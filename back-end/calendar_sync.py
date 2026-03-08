from __future__ import annotations

from datetime import datetime, timedelta, timezone

import httpx

from database import get_db
from google_auth import refresh_access_token

FREEBUSY_URL = "https://www.googleapis.com/calendar/v3/freeBusy"


def fetch_busy_blocks(access_token: str, days: int = 7) -> list[dict]:
    """Call Google Calendar FreeBusy API to get busy intervals for the next N days."""
    now = datetime.now(timezone.utc)
    time_max = now + timedelta(days=days)

    resp = httpx.post(
        FREEBUSY_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "timeMin": now.isoformat(),
            "timeMax": time_max.isoformat(),
            "items": [{"id": "primary"}],
        },
    )
    resp.raise_for_status()

    data = resp.json()
    busy_list = data.get("calendars", {}).get("primary", {}).get("busy", [])
    return [{"start": b["start"], "end": b["end"]} for b in busy_list]


def sync_availability(user_id: str) -> dict:
    """Fetch busy blocks from Google Calendar and store them in Supabase."""
    access_token = refresh_access_token(user_id)
    if not access_token:
        raise ValueError("Calendar not connected or token refresh failed")

    blocks = fetch_busy_blocks(access_token)
    db = get_db()
    now_iso = datetime.now(timezone.utc).isoformat()

    # Full replace: delete old availability, insert fresh data
    db.table("user_availability").delete().eq("user_id", user_id).execute()

    if blocks:
        rows = [
            {
                "user_id": user_id,
                "busy_start": b["start"],
                "busy_end": b["end"],
                "synced_at": now_iso,
            }
            for b in blocks
        ]
        db.table("user_availability").insert(rows).execute()

    return {"blocks_synced": len(blocks)}


def get_busy_blocks_for_users(user_ids: list[str]) -> dict[str, list[tuple[datetime, datetime]]]:
    """Fetch stored busy blocks from Supabase for multiple users."""
    db = get_db()
    result = (
        db.table("user_availability")
        .select("user_id, busy_start, busy_end")
        .in_("user_id", user_ids)
        .execute()
    )
    blocks: dict[str, list[tuple[datetime, datetime]]] = {uid: [] for uid in user_ids}
    for row in result.data:
        start = datetime.fromisoformat(row["busy_start"])
        end = datetime.fromisoformat(row["busy_end"])
        blocks[row["user_id"]].append((start, end))
    return blocks


def _merge_intervals(intervals: list[tuple[datetime, datetime]]) -> list[tuple[datetime, datetime]]:
    """Merge overlapping intervals into sorted non-overlapping ones."""
    if not intervals:
        return []
    sorted_iv = sorted(intervals)
    merged = [sorted_iv[0]]
    for start, end in sorted_iv[1:]:
        if start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def users_share_free_time(
    user_ids: list[str],
    min_overlap_hours: float = 2.0,
    days: int = 7,
) -> bool:
    """Check if all users share at least one free window of min_overlap_hours.

    Merges all busy blocks across all users into a combined busy timeline,
    then checks if any gap in the next `days` days is >= min_overlap_hours.
    """
    all_busy = get_busy_blocks_for_users(user_ids)

    # If any user has no availability data (never synced), skip the filter
    for uid in user_ids:
        if not all_busy[uid]:
            return True

    # Combine all busy blocks from all users and merge
    combined: list[tuple[datetime, datetime]] = []
    for blocks in all_busy.values():
        combined.extend(blocks)
    merged = _merge_intervals(combined)

    now = datetime.now(timezone.utc)
    window_end = now + timedelta(days=days)
    min_gap = timedelta(hours=min_overlap_hours)

    # Check gaps between merged busy blocks within the window
    cursor = now
    for busy_start, busy_end in merged:
        # Clamp to our window
        if busy_end <= cursor:
            continue
        if busy_start >= window_end:
            break
        gap_start = cursor
        gap_end = min(busy_start, window_end)
        if gap_end - gap_start >= min_gap:
            return True
        cursor = max(cursor, busy_end)

    # Check trailing gap after last busy block
    if window_end - cursor >= min_gap:
        return True

    return False
