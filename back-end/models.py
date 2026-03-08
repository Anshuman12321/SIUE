from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class UserPreferences(BaseModel):
    vibe: str
    activity_types: list[str]
    age_group: Literal["18-22", "23-27", "28-35", "36+"]
    alcohol: bool
    budget_min: int
    budget_max: int
    lat: float
    lng: float


class UpdatePreferencesRequest(BaseModel):
    preferences: UserPreferences


class ParseVibeRequest(BaseModel):
    raw_text: str


class ParseVibeResponse(BaseModel):
    vibe: str
    activity_types: list[str]
    alcohol: bool
    budget_min: int
    budget_max: int


class DeclineGroupRequest(BaseModel):
    user_id: UUID


class PlaceCallRequest(BaseModel):
    phone_number: str


class CalendarStatusResponse(BaseModel):
    connected: bool
    provider: str | None = None


class CalendarSyncResponse(BaseModel):
    blocks_synced: int


class AvailabilityResponse(BaseModel):
    user_id: str
    busy_blocks: list[dict]


class PlaceResult(BaseModel):
    place_id: str
    display_name: str
    address: str
    lat: float
    lng: float
    primary_type: str
    summary: str = ""


class PlaceDiscoveryResponse(BaseModel):
    centroid_lat: float
    centroid_lng: float
    places: list[PlaceResult]


class EventResponse(BaseModel):
    id: int
    event_name: str
    location_name: str | None
    address: str | None
    date_time: str
    description: str | None = None
    group_id: int


class GenerateEventsResponse(BaseModel):
    group_id: int
    events_created: int
    events: list[EventResponse]
