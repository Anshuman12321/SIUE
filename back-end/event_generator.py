from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone

from google import genai
from google.genai.types import GenerateContentConfig
from pydantic import BaseModel

from calendar_sync import get_busy_blocks_for_users, _merge_intervals
from database import get_db, get_settings
from places import search_nearby_places

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        settings = get_settings()
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


# ── Free Time Calculation ──────────────────────────────────────────


def find_free_windows(
    user_ids: list[str],
    min_hours: float = 2.0,
    days: int = 7,
) -> list[dict]:
    """Find all free time windows shared by all users in the next N days.

    Returns list of dicts: [{"start": isoformat, "end": isoformat, "hours": float}, ...]
    """
    all_busy = get_busy_blocks_for_users(user_ids)

    # Combine all busy blocks from all users
    combined: list[tuple[datetime, datetime]] = []
    for blocks in all_busy.values():
        combined.extend(blocks)
    merged = _merge_intervals(combined)

    now = datetime.now(timezone.utc)
    window_end = now + timedelta(days=days)
    min_gap = timedelta(hours=min_hours)

    free_windows: list[dict] = []
    cursor = now

    for busy_start, busy_end in merged:
        if busy_end <= cursor:
            continue
        if busy_start >= window_end:
            break
        gap_start = cursor
        gap_end = min(busy_start, window_end)
        if gap_end - gap_start >= min_gap:
            free_windows.append({
                "start": gap_start.isoformat(),
                "end": gap_end.isoformat(),
                "hours": (gap_end - gap_start).total_seconds() / 3600,
            })
        cursor = max(cursor, busy_end)

    # Trailing gap
    if window_end - cursor >= min_gap:
        free_windows.append({
            "start": cursor.isoformat(),
            "end": window_end.isoformat(),
            "hours": (window_end - cursor).total_seconds() / 3600,
        })

    return free_windows


# ── Gemini Event Selection ─────────────────────────────────────────


class GeneratedEvent(BaseModel):
    event_name: str
    location_name: str
    address: str
    lat: float
    lng: float
    date_time: str  # ISO 8601
    description: str
    phone_number: str | None = None


class GeneratedEvents(BaseModel):
    events: list[GeneratedEvent]


EVENT_SYSTEM_INSTRUCTION = """\
You are an event planner for a social group. Given:
1. The combined vibes of all group members
2. Their preferred activity types (with frequency counts)
3. Available free time windows when ALL members are free
4. Nearby places discovered via Google Places

Create exactly 3 diverse event suggestions. Each event must:
- Use one of the provided places (use its exact name, address, lat, lng, and phone_number)
- Be scheduled during one of the free time windows
- Pick a reasonable specific date/time within a free window \
(not at midnight, prefer afternoons/evenings for social events, mornings for outdoor activities)
- Have a catchy, concise event_name (e.g., "Top Golf Afternoon", "Coffee & Board Games")
- Include a short, fun description (max 15 words)
- Spread events across different time windows when possible
- Spread events across different activity types when possible
- Match the group's overall vibe

Return the date_time as an ISO 8601 string with timezone.
"""


def _build_gemini_prompt(
    vibes: list[str],
    activity_counts: dict[str, int],
    free_windows: list[dict],
    places: list[dict],
) -> str:
    """Build the content string for Gemini."""
    parts = []

    parts.append("## Group Vibes")
    for v in vibes:
        parts.append(f"- {v}")

    parts.append("\n## Activity Preferences (ranked by popularity)")
    for activity, count in sorted(activity_counts.items(), key=lambda x: -x[1]):
        parts.append(f"- {activity}: {count} members interested")

    parts.append("\n## Free Time Windows")
    for w in free_windows:
        parts.append(f"- {w['start']} to {w['end']} ({w['hours']:.1f} hours)")

    parts.append("\n## Nearby Places")
    for p in places:
        desc = f"- {p['display_name']} ({p['primary_type']}): {p['address']}"
        if p.get("phone_number"):
            desc += f" (Phone: {p['phone_number']})"
        if p.get("summary"):
            desc += f" -- {p['summary']}"
        desc += f" [lat={p['lat']}, lng={p['lng']}]"
        parts.append(desc)

    return "\n".join(parts)


# ── Main Orchestrator ──────────────────────────────────────────────


def generate_events_for_group(group_id: int) -> list[dict]:
    """Generate 3 event suggestions for a group and insert them into the events table."""
    db = get_db()

    # 1. Fetch group members
    group_row = db.table("groups").select("members").eq("id", group_id).single().execute()
    if not group_row.data:
        raise ValueError(f"Group {group_id} not found")
    member_ids: list[str] = group_row.data["members"]

    # 2. Fetch all members' interests
    vibes: list[str] = []
    all_activity_types: list[str] = []

    for uid in member_ids:
        user_row = db.table("users").select("interests").eq("id", uid).single().execute()
        if not user_row.data:
            continue
        interests = user_row.data["interests"]
        if interests.get("vibe"):
            vibes.append(interests["vibe"])
        all_activity_types.extend(interests.get("activity_types", []))

    activity_counts = dict(Counter(all_activity_types))

    # 3. Get centroid via PostGIS RPC
    centroid_result = db.rpc("get_group_centroid", {"p_group_id": group_id}).execute()
    if not centroid_result.data:
        raise ValueError(f"No member locations found for group {group_id}")
    centroid = centroid_result.data[0]
    centroid_lat = centroid["lat"]
    centroid_lng = centroid["lng"]

    # 4. Search for nearby places
    unique_activities = list(set(all_activity_types))
    places = search_nearby_places(centroid_lat, centroid_lng, unique_activities)

    if not places:
        raise ValueError(f"No places found near group {group_id} centroid")

    # 5. Find free time windows
    free_windows = find_free_windows(member_ids, min_hours=2.0, days=7)

    if not free_windows:
        # Fallback: default weekend windows if no calendar data
        now = datetime.now(timezone.utc)
        days_until_saturday = (5 - now.weekday()) % 7
        if days_until_saturday == 0:
            days_until_saturday = 7
        saturday = now.replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=days_until_saturday)
        sunday = saturday + timedelta(days=1)
        free_windows = [
            {"start": saturday.isoformat(), "end": (saturday + timedelta(hours=12)).isoformat(), "hours": 12.0},
            {"start": sunday.isoformat(), "end": (sunday + timedelta(hours=12)).isoformat(), "hours": 12.0},
        ]

    # 6. Ask Gemini to pick 3 events
    prompt = _build_gemini_prompt(vibes, activity_counts, free_windows, places)
    client = _get_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=GeneratedEvents,
            system_instruction=EVENT_SYSTEM_INSTRUCTION,
        ),
    )
    generated: GeneratedEvents = response.parsed

    # 7. Insert into events table
    event_rows = []
    for ev in generated.events[:3]:
        location_wkt = f"POINT({ev.lng} {ev.lat})"
        event_rows.append({
            "group_id": group_id,
            "event_name": ev.event_name,
            "location_name": ev.location_name,
            "address": ev.address,
            "date_time": ev.date_time,
            "location": location_wkt,
            "description": ev.description,
            "phone_number": ev.phone_number,
        })

    result = db.table("events").insert(event_rows).execute()
    return result.data
