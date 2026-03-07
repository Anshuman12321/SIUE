from collections import Counter
from uuid import UUID

from fastapi import FastAPI, HTTPException

from database import get_db
from embeddings import get_embedding
from models import DeclineGroupRequest, UpdatePreferencesRequest

app = FastAPI()


@app.post("/users/{user_id}/preferences")
def update_preferences(user_id: UUID, body: UpdatePreferencesRequest):
    p = body.preferences
    embedding = get_embedding(p.vibe, p.activity_types)
    db = get_db()

    prefs_json = p.model_dump()
    location_wkt = f"POINT({p.lng} {p.lat})"

    db.table("users").upsert({
        "id": str(user_id),
        "interests": prefs_json,
        "embedding": embedding,
        "location": location_wkt,
    }).execute()

    return {"user_id": str(user_id), "status": "ok"}


@app.post("/jobs/matchmaker")
def run_matchmaker():
    db = get_db()

    result = db.rpc("get_lonely_users").execute()
    lonely = result.data or []

    import random
    random.shuffle(lonely)

    already_matched: set[str] = set()
    groups_created = 0

    for row in lonely:
        uid = row["user_id"]
        if uid in already_matched:
            continue

        user_row = db.table("users").select("interests,embedding").eq("id", uid).single().execute()
        if not user_row.data:
            continue

        prefs = user_row.data["interests"]
        embedding = user_row.data["embedding"]

        lat = prefs.get("lat")
        lng = prefs.get("lng")
        if lat is None or lng is None:
            continue

        match_result = db.rpc("match_users", {
            "query_embedding": embedding,
            "query_lat": lat,
            "query_lng": lng,
            "radius_meters": 32000,
            "filter_alcohol": prefs.get("alcohol", False),
            "filter_budget_min": prefs.get("budget_min", 0),
            "filter_budget_max": prefs.get("budget_max", 9999),
            "exclude_user_id": uid,
            "match_count": 10,
        }).execute()

        candidates = [
            c for c in (match_result.data or [])
            if c["user_id"] not in already_matched
        ][:3]

        if not candidates:
            continue

        member_ids = [uid] + [c["user_id"] for c in candidates]

        all_activity_types: list[str] = list(prefs.get("activity_types", []))
        for c in candidates:
            c_row = db.table("users").select("interests").eq("id", c["user_id"]).single().execute()
            if c_row.data:
                all_activity_types.extend(c_row.data["interests"].get("activity_types", []))

        activity_type = Counter(all_activity_types).most_common(1)[0][0] if all_activity_types else None

        db.table("groups").insert({
            "members": member_ids,
            "activity_type": activity_type,
            "status": "pending",
        }).execute()

        already_matched.update(member_ids)
        groups_created += 1

    return {"groups_created": groups_created, "lonely_users_processed": len(lonely)}


@app.post("/groups/{group_id}/decline")
def decline_group(group_id: int, body: DeclineGroupRequest):
    db = get_db()
    db.rpc("remove_member_from_group", {
        "p_group_id": group_id,
        "p_user_id": str(body.user_id),
    }).execute()
    return {"status": "ok"}
