from functools import lru_cache

from pydantic_settings import BaseSettings
from supabase import Client, create_client


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    gemini_api_key: str
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/auth/google/calendar/callback"
    google_places_api_key: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_db() -> Client:
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_key)
