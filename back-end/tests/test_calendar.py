"""Tests for Google Calendar auth endpoints, sync, and free-time logic."""

from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient


# ── Fixtures ──────────────────────────────────────────────────────


@pytest.fixture(autouse=True)
def _mock_settings(monkeypatch):
    """Patch Settings so pydantic-settings doesn't require real env vars."""
    monkeypatch.setenv("SUPABASE_URL", "https://fake.supabase.co")
    monkeypatch.setenv("SUPABASE_KEY", "fake-key")
    monkeypatch.setenv("GEMINI_API_KEY", "fake-gemini")
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "fake-client-id")
    monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "fake-client-secret")
    monkeypatch.setenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/calendar/callback")

    # Clear lru_cache so patched env vars take effect
    from database import get_settings, get_db
    get_settings.cache_clear()
    get_db.cache_clear()


@pytest.fixture
def client():
    from server import app
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def user_id():
    return str(uuid4())


# ── Endpoint tests ────────────────────────────────────────────────


class TestGoogleCalendarAuth:
    @patch("server.build_authorization_url")
    def test_auth_redirects_to_google(self, mock_build_url, client, user_id):
        mock_build_url.return_value = "https://accounts.google.com/o/oauth2/auth?fake=1"
        resp = client.get(
            f"/auth/google/calendar?user_id={user_id}",
            follow_redirects=False,
        )
        assert resp.status_code == 307
        assert "accounts.google.com" in resp.headers["location"]
        mock_build_url.assert_called_once_with(user_id)

    @patch("server.get_db")
    @patch("server.sync_availability")
    @patch("server.save_tokens")
    @patch("server.exchange_code_for_tokens")
    def test_callback_saves_tokens_and_redirects(
        self, mock_exchange, mock_save, mock_sync, mock_get_db, client, user_id
    ):
        mock_exchange.return_value = {
            "access_token": "at",
            "refresh_token": "rt",
            "token_expiry": datetime.now(timezone.utc).isoformat(),
            "scopes": ["https://www.googleapis.com/auth/calendar.readonly"],
        }
        resp = client.get(
            f"/auth/google/calendar/callback?code=authcode&state={user_id}",
            follow_redirects=False,
        )
        assert resp.status_code == 307
        assert "calendar=connected" in resp.headers["location"]
        mock_exchange.assert_called_once_with("authcode")
        mock_save.assert_called_once_with(user_id, mock_exchange.return_value)
        mock_sync.assert_called_once_with(user_id)

    @patch("server.exchange_code_for_tokens")
    def test_callback_returns_400_on_exchange_failure(
        self, mock_exchange, client, user_id
    ):
        mock_exchange.side_effect = Exception("invalid grant")
        resp = client.get(
            f"/auth/google/calendar/callback?code=bad&state={user_id}",
        )
        assert resp.status_code == 400
        assert "Token exchange failed" in resp.json()["detail"]

    @patch("server.get_db")
    @patch("server.sync_availability")
    @patch("server.save_tokens")
    @patch("server.exchange_code_for_tokens")
    def test_callback_still_redirects_if_sync_fails(
        self, mock_exchange, mock_save, mock_sync, mock_get_db, client, user_id
    ):
        mock_exchange.return_value = {
            "access_token": "at",
            "refresh_token": "rt",
            "token_expiry": datetime.now(timezone.utc).isoformat(),
            "scopes": [],
        }
        mock_sync.side_effect = Exception("sync boom")
        resp = client.get(
            f"/auth/google/calendar/callback?code=authcode&state={user_id}",
            follow_redirects=False,
        )
        # Should still redirect — sync failure is non-fatal
        assert resp.status_code == 307
        assert "calendar=connected" in resp.headers["location"]


class TestCalendarStatus:
    @patch("server.check_calendar_connected")
    def test_connected(self, mock_check, client, user_id):
        mock_check.return_value = True
        resp = client.get(f"/users/{user_id}/calendar-status")
        assert resp.status_code == 200
        data = resp.json()
        assert data["connected"] is True
        assert data["provider"] == "google"

    @patch("server.check_calendar_connected")
    def test_not_connected(self, mock_check, client, user_id):
        mock_check.return_value = False
        resp = client.get(f"/users/{user_id}/calendar-status")
        assert resp.status_code == 200
        assert resp.json()["connected"] is False


class TestCalendarSync:
    @patch("server.sync_availability")
    def test_sync_success(self, mock_sync, client, user_id):
        mock_sync.return_value = {"blocks_synced": 5}
        resp = client.post(f"/users/{user_id}/calendar/sync")
        assert resp.status_code == 200
        assert resp.json()["blocks_synced"] == 5

    @patch("server.sync_availability")
    def test_sync_not_connected(self, mock_sync, client, user_id):
        mock_sync.side_effect = ValueError("Calendar not connected")
        resp = client.post(f"/users/{user_id}/calendar/sync")
        assert resp.status_code == 400

    @patch("server.sync_availability")
    def test_sync_api_error(self, mock_sync, client, user_id):
        mock_sync.side_effect = Exception("Google API down")
        resp = client.post(f"/users/{user_id}/calendar/sync")
        assert resp.status_code == 502


class TestAvailability:
    @patch("server.get_db")
    def test_returns_busy_blocks(self, mock_get_db, client, user_id):
        now = datetime.now(timezone.utc).isoformat()
        mock_table = MagicMock()
        mock_get_db.return_value.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.order.return_value = mock_table
        mock_table.execute.return_value = MagicMock(
            data=[
                {"busy_start": now, "busy_end": now, "synced_at": now},
            ]
        )
        resp = client.get(f"/users/{user_id}/availability")
        assert resp.status_code == 200
        data = resp.json()
        assert data["user_id"] == user_id
        assert len(data["busy_blocks"]) == 1

    @patch("server.get_db")
    def test_returns_empty_when_no_data(self, mock_get_db, client, user_id):
        mock_table = MagicMock()
        mock_get_db.return_value.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.order.return_value = mock_table
        mock_table.execute.return_value = MagicMock(data=[])
        resp = client.get(f"/users/{user_id}/availability")
        assert resp.status_code == 200
        assert resp.json()["busy_blocks"] == []


# ── Unit tests for free-time logic ────────────────────────────────


class TestMergeIntervals:
    def test_empty(self):
        from calendar_sync import _merge_intervals
        assert _merge_intervals([]) == []

    def test_no_overlap(self):
        from calendar_sync import _merge_intervals
        now = datetime.now(timezone.utc)
        intervals = [
            (now, now + timedelta(hours=1)),
            (now + timedelta(hours=2), now + timedelta(hours=3)),
        ]
        merged = _merge_intervals(intervals)
        assert len(merged) == 2

    def test_overlapping(self):
        from calendar_sync import _merge_intervals
        now = datetime.now(timezone.utc)
        intervals = [
            (now, now + timedelta(hours=2)),
            (now + timedelta(hours=1), now + timedelta(hours=3)),
        ]
        merged = _merge_intervals(intervals)
        assert len(merged) == 1
        assert merged[0] == (now, now + timedelta(hours=3))

    def test_adjacent(self):
        from calendar_sync import _merge_intervals
        now = datetime.now(timezone.utc)
        intervals = [
            (now, now + timedelta(hours=1)),
            (now + timedelta(hours=1), now + timedelta(hours=2)),
        ]
        merged = _merge_intervals(intervals)
        assert len(merged) == 1

    def test_unsorted_input(self):
        from calendar_sync import _merge_intervals
        now = datetime.now(timezone.utc)
        intervals = [
            (now + timedelta(hours=3), now + timedelta(hours=4)),
            (now, now + timedelta(hours=1)),
        ]
        merged = _merge_intervals(intervals)
        assert len(merged) == 2
        assert merged[0][0] < merged[1][0]


class TestUsersShareFreeTime:
    @patch("calendar_sync.get_busy_blocks_for_users")
    def test_no_data_returns_true(self, mock_get):
        """Users without synced calendars should pass the filter."""
        from calendar_sync import users_share_free_time
        mock_get.return_value = {"a": [], "b": []}
        assert users_share_free_time(["a", "b"]) is True

    @patch("calendar_sync.get_busy_blocks_for_users")
    def test_one_user_no_data_returns_true(self, mock_get):
        """If any user has no data, skip the filter."""
        from calendar_sync import users_share_free_time
        now = datetime.now(timezone.utc)
        mock_get.return_value = {
            "a": [(now, now + timedelta(hours=23))],
            "b": [],
        }
        assert users_share_free_time(["a", "b"]) is True

    @patch("calendar_sync.get_busy_blocks_for_users")
    def test_both_free_all_week(self, mock_get):
        """Users with only small busy blocks should have overlap."""
        from calendar_sync import users_share_free_time
        now = datetime.now(timezone.utc)
        mock_get.return_value = {
            "a": [(now + timedelta(hours=5), now + timedelta(hours=6))],
            "b": [(now + timedelta(hours=10), now + timedelta(hours=11))],
        }
        assert users_share_free_time(["a", "b"]) is True

    @patch("calendar_sync.get_busy_blocks_for_users")
    def test_completely_busy_returns_false(self, mock_get):
        """Users whose combined busy blocks cover the entire week have no overlap."""
        from calendar_sync import users_share_free_time
        now = datetime.now(timezone.utc)
        # User A busy first half, user B busy second half — no gap >= 2h
        mock_get.return_value = {
            "a": [(now, now + timedelta(days=3, hours=23))],
            "b": [(now + timedelta(days=3, hours=22), now + timedelta(days=7))],
        }
        assert users_share_free_time(["a", "b"]) is False

    @patch("calendar_sync.datetime")
    @patch("calendar_sync.get_busy_blocks_for_users")
    def test_gap_exactly_at_min_overlap(self, mock_get, mock_dt):
        """A gap of exactly min_overlap_hours should pass."""
        from calendar_sync import users_share_free_time
        now = datetime(2026, 3, 7, 12, 0, 0, tzinfo=timezone.utc)
        mock_dt.now.return_value = now
        mock_dt.side_effect = lambda *a, **kw: datetime(*a, **kw)
        mock_get.return_value = {
            "a": [(now + timedelta(hours=2), now + timedelta(days=7))],
            "b": [(now + timedelta(hours=2), now + timedelta(days=7))],
        }
        # Gap from now to now+2h = exactly 2 hours
        assert users_share_free_time(["a", "b"], min_overlap_hours=2.0) is True

    @patch("calendar_sync.datetime")
    @patch("calendar_sync.get_busy_blocks_for_users")
    def test_gap_just_under_min_overlap(self, mock_get, mock_dt):
        """A gap just under min_overlap_hours should fail."""
        from calendar_sync import users_share_free_time
        now = datetime(2026, 3, 7, 12, 0, 0, tzinfo=timezone.utc)
        mock_dt.now.return_value = now
        mock_dt.side_effect = lambda *a, **kw: datetime(*a, **kw)
        mock_get.return_value = {
            "a": [(now + timedelta(hours=1, minutes=59), now + timedelta(days=7))],
            "b": [(now + timedelta(hours=1, minutes=59), now + timedelta(days=7))],
        }
        assert users_share_free_time(["a", "b"], min_overlap_hours=2.0) is False

    @patch("calendar_sync.get_busy_blocks_for_users")
    def test_trailing_gap(self, mock_get):
        """Free time at the end of the window should count."""
        from calendar_sync import users_share_free_time
        now = datetime.now(timezone.utc)
        # Both busy until day 6, leaving ~1 day free at the end
        mock_get.return_value = {
            "a": [(now, now + timedelta(days=6))],
            "b": [(now, now + timedelta(days=6))],
        }
        assert users_share_free_time(["a", "b"], min_overlap_hours=2.0) is True
