from uuid import UUID

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from calendar_sync import sync_availability, users_share_free_time
from database import get_db
from embeddings import get_embedding
from event_generator import generate_events_for_group
from google_auth import build_authorization_url, check_calendar_connected, exchange_code_for_tokens, save_tokens
from models import AvailabilityResponse, CalendarStatusResponse, CalendarSyncResponse, DeclineGroupRequest, PlaceCallRequest, PlaceDiscoveryResponse
from places import search_nearby_places
from vapi import create_call, poll_call_until_done
from vibe_parser import parse_vibe

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/users/{user_id}/process-vibe")
def process_vibe(user_id: UUID):
    db = get_db()
    row = db.table("users").select("interests").eq("id", str(user_id)).single().execute()
    if not row.data or not row.data.get("interests"):
        raise HTTPException(status_code=400, detail="No interests found")

    interests = row.data["interests"]
    raw_vibe = interests.get("vibe", "")
    if not raw_vibe:
        raise HTTPException(status_code=400, detail="No vibe text found")

    parsed = parse_vibe(raw_vibe)

    embedding = get_embedding(parsed.vibe, parsed.activity_types)

    loc = interests.get("location", {})
    lat, lng = loc.get("lat"), loc.get("lng")
    if lat is None or lng is None:
        raise HTTPException(status_code=400, detail="No location found")
    location_wkt = f"POINT({lng} {lat})"

    interests["activity_types"] = parsed.activity_types
    interests["parsed_vibe"] = parsed.vibe

    db.table("users").update({
        "interests": interests,
        "embedding": embedding,
        "location": location_wkt,
    }).eq("id", str(user_id)).execute()

    return {"status": "ok", "activity_types": parsed.activity_types}


@app.post("/jobs/matchmaker")
def run_matchmaker():
    db = get_db()

    result = db.rpc("get_lonely_users", {"max_groups": 1}).execute()
    lonely = result.data or []
    print(f"[matchmaker] Found {len(lonely)} lonely users: {lonely}")

    import random
    random.shuffle(lonely)

    already_matched: set[str] = set()
    groups_created = 0

    for row in lonely:
        uid = row["user_id"]
        print(f"[matchmaker] Processing user {uid}")
        if uid in already_matched:
            print(f"[matchmaker] Skipping {uid} — already matched")
            continue

        user_row = db.table("users").select("interests,embedding").eq("id", uid).single().execute()
        if not user_row.data:
            print(f"[matchmaker] Skipping {uid} — no user data")
            continue

        prefs = user_row.data["interests"]
        embedding = user_row.data.get("embedding")
        print(f"[matchmaker] User {uid} has embedding: {embedding is not None}, prefs: {list(prefs.keys()) if prefs else None}")

        # Lazy fallback: generate embedding + geometry if process-vibe wasn't called
        if not embedding:
            vibe = prefs.get("vibe", "")
            if not vibe:
                continue
            parsed = parse_vibe(vibe)
            embedding = get_embedding(parsed.vibe, parsed.activity_types)
            loc = prefs.get("location", {})
            lat, lng = loc.get("lat"), loc.get("lng")
            if lat is None or lng is None:
                continue
            location_wkt = f"POINT({lng} {lat})"
            prefs["activity_types"] = parsed.activity_types
            prefs["parsed_vibe"] = parsed.vibe
            db.table("users").update({
                "interests": prefs,
                "embedding": embedding,
                "location": location_wkt,
            }).eq("id", uid).execute()
        else:
            loc = prefs.get("location", {})
            lat, lng = loc.get("lat"), loc.get("lng")
            if lat is None or lng is None:
                continue

        match_result = db.rpc("match_users", {
            "query_embedding": embedding,
            "query_lat": lat,
            "query_lng": lng,
            "radius_meters": 32000,
            "filter_alcohol": prefs.get("alcohol", False),
            "filter_budget": prefs.get("budget", "medium"),
            "exclude_user_id": uid,
            "match_count": 10,
        }).execute()

        candidates = [
            c for c in (match_result.data or [])
            if c["user_id"] not in already_matched
        ]
        print(f"[matchmaker] Found {len(candidates)} candidates for {uid}")

        # Filter by free time overlap: keep only candidates who share
        # a 2+ hour free window with the current user
        available_candidates = [
            c for c in candidates
            if users_share_free_time([uid, c["user_id"]])
        ][:3]
        print(f"[matchmaker] {len(available_candidates)} candidates passed free-time filter")

        if not available_candidates:
            print(f"[matchmaker] No available candidates for {uid}, skipping")
            continue

        member_ids = [uid] + [c["user_id"] for c in available_candidates]

        group_result = db.table("groups").insert({
            "members": member_ids,
        }).execute()

        new_group_id = group_result.data[0]["id"]
        db.table("users").update({"group_id": new_group_id}).in_("id", member_ids).execute()
        print(f"[matchmaker] Created group {new_group_id} with members {member_ids}")

        try:
            print(f"[matchmaker] Generating events for group {new_group_id}...")
            generate_events_for_group(new_group_id)
            print(f"[matchmaker] Events generated successfully for group {new_group_id}")
        except Exception as exc:
            print(f"[matchmaker] Event generation failed for group {new_group_id}: {exc}")
            import traceback
            traceback.print_exc()

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


@app.post("/calls/place")
def place_call(body: PlaceCallRequest):
    """Place an outbound AI agent call and return the structured output."""
    try:
        call = create_call(body.phone_number)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to create Vapi call: {exc}")

    call_id = call["id"]

    try:
        result = poll_call_until_done(call_id)
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Error polling call status: {exc}")

    structured_data = (result.get("analysis") or {}).get("structuredData")

    return {
        "call_id": call_id,
        "status": result.get("status"),
        "structured_data": structured_data,
    }
# ── Google Calendar OAuth ──────────────────────────────────────────


@app.get("/auth/google/calendar")
def google_calendar_auth(user_id: UUID):
    url = build_authorization_url(str(user_id))
    return RedirectResponse(url)


@app.get("/auth/google/calendar/callback")
def google_calendar_callback(code: str, state: str):
    try:
        tokens = exchange_code_for_tokens(code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {e}")
    # Ensure user row exists (onboarding may not have finished yet)
    db = get_db()
    db.table("users").upsert({"id": state}, on_conflict="id", ignore_duplicates=True).execute()

    save_tokens(state, tokens)

    # Trigger initial availability sync (non-fatal if it fails)
    try:
        sync_availability(state)
    except Exception:
        pass

    return RedirectResponse("http://localhost:5173/onboarding?calendar=connected")


@app.get("/users/{user_id}/calendar-status", response_model=CalendarStatusResponse)
def calendar_status(user_id: UUID):
    connected = check_calendar_connected(str(user_id))
    return CalendarStatusResponse(connected=connected, provider="google" if connected else None)


# ── Calendar Availability ─────────────────────────────────────────


@app.post("/users/{user_id}/calendar/sync", response_model=CalendarSyncResponse)
def sync_calendar(user_id: UUID):
    try:
        result = sync_availability(str(user_id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Calendar sync failed: {e}")
    return result


@app.get("/users/{user_id}/availability", response_model=AvailabilityResponse)
def get_availability(user_id: UUID):
    db = get_db()
    result = (
        db.table("user_availability")
        .select("busy_start, busy_end, synced_at")
        .eq("user_id", str(user_id))
        .order("busy_start")
        .execute()
    )
    return AvailabilityResponse(user_id=str(user_id), busy_blocks=result.data)


# ── Event Generation ─────────────────────────────────────────────


@app.get("/groups/{group_id}/places", response_model=PlaceDiscoveryResponse)
def discover_places(group_id: int):
    """Find places near the group's centroid based on members' activity preferences."""
    db = get_db()

    group_row = db.table("groups").select("members").eq("id", group_id).single().execute()
    if not group_row.data:
        raise HTTPException(status_code=404, detail="Group not found")

    member_ids = group_row.data["members"]
    all_activity_types: list[str] = []

    for uid in member_ids:
        user_row = db.table("users").select("interests").eq("id", uid).single().execute()
        if not user_row.data:
            continue
        all_activity_types.extend(user_row.data["interests"].get("activity_types", []))

    # Get centroid via PostGIS
    centroid_result = db.rpc("get_group_centroid", {"p_group_id": group_id}).execute()
    if not centroid_result.data:
        raise HTTPException(status_code=400, detail="No member locations found")

    centroid = centroid_result.data[0]
    centroid_lat = centroid["lat"]
    centroid_lng = centroid["lng"]

    unique_activities = list(set(all_activity_types))
    places = search_nearby_places(centroid_lat, centroid_lng, unique_activities)

    return PlaceDiscoveryResponse(
        centroid_lat=centroid_lat,
        centroid_lng=centroid_lng,
        places=places,
    )


