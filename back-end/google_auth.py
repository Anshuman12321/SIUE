from __future__ import annotations

from datetime import datetime, timezone

from google_auth_oauthlib.flow import Flow

from database import get_db, get_settings

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]


def _build_flow() -> Flow:
    settings = get_settings()
    return Flow.from_client_config(
        {
            "web": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
        redirect_uri=settings.google_redirect_uri,
    )


def build_authorization_url(user_id: str) -> str:
    """Create the Google OAuth2 consent URL, passing user_id as state."""
    flow = _build_flow()
    url, _ = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        state=user_id,
    )
    return url


def exchange_code_for_tokens(code: str) -> dict:
    """Exchange the authorization code for access + refresh tokens."""
    flow = _build_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials
    return {
        "access_token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_expiry": creds.expiry.isoformat() if creds.expiry else datetime.now(timezone.utc).isoformat(),
        "scopes": list(creds.scopes or SCOPES),
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
    """Refresh the access token using the stored refresh token.

    Skeleton for Branch 2 — not yet implemented.
    """
    return None
