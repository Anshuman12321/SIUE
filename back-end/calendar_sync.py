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
