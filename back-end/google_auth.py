from __future__ import annotations

from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx

from database import get_db, get_settings

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
AUTH_URI = "https://accounts.google.com/o/oauth2/auth"
TOKEN_URI = "https://oauth2.googleapis.com/token"


def build_authorization_url(user_id: str) -> str:
    """Create the Google OAuth2 consent URL, passing user_id as state."""
    settings = get_settings()
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": user_id,
    }
    return f"{AUTH_URI}?{urlencode(params)}"


def exchange_code_for_tokens(code: str) -> dict:
    """Exchange the authorization code for access + refresh tokens."""
    settings = get_settings()
    resp = httpx.post(TOKEN_URI, data={
        "code": code,
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uri": settings.google_redirect_uri,
        "grant_type": "authorization_code",
    })
    resp.raise_for_status()
    data = resp.json()
    expires_in = data.get("expires_in", 3600)
    expiry = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    return {
        "access_token": data["access_token"],
        "refresh_token": data.get("refresh_token", ""),
        "token_expiry": expiry.isoformat(),
        "scopes": data.get("scope", "").split(),
    }


def save_tokens(user_id: str, tokens: dict) -> None:
    """Upsert calendar tokens for the user."""
    db = get_db()
    db.table("calendar_tokens").upsert(
        {
            "user_id": user_id,
            "provider": "google",
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_expiry": tokens["token_expiry"],
            "scopes": tokens["scopes"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        on_conflict="user_id,provider",
    ).execute()


def check_calendar_connected(user_id: str) -> bool:
    """Return True if the user has stored calendar tokens."""
    db = get_db()
    result = (
        db.table("calendar_tokens")
        .select("id")
        .eq("user_id", user_id)
        .eq("provider", "google")
        .execute()
    )
    return len(result.data) > 0


def refresh_access_token(user_id: str) -> str | None:
    """Return a valid access token, refreshing it if expired."""
    db = get_db()
    settings = get_settings()

    result = (
        db.table("calendar_tokens")
        .select("access_token, refresh_token, token_expiry")
        .eq("user_id", user_id)
        .eq("provider", "google")
        .single()
        .execute()
    )
    if not result.data:
        return None

    row = result.data
    expiry = datetime.fromisoformat(row["token_expiry"])
    now = datetime.now(timezone.utc)

    # Return existing token if still valid (with 5-min buffer)
    if expiry > now + timedelta(minutes=5):
        return row["access_token"]

    # Refresh the token
    resp = httpx.post(TOKEN_URI, data={
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "refresh_token": row["refresh_token"],
        "grant_type": "refresh_token",
    })
    resp.raise_for_status()
    data = resp.json()

    new_expiry = now + timedelta(seconds=data.get("expires_in", 3600))
    db.table("calendar_tokens").update({
        "access_token": data["access_token"],
        "token_expiry": new_expiry.isoformat(),
        "updated_at": now.isoformat(),
    }).eq("user_id", user_id).eq("provider", "google").execute()

    return data["access_token"]
