from uuid import UUID

from pydantic import BaseModel


class DeclineGroupRequest(BaseModel):
    user_id: UUID


class PlaceCallRequest(BaseModel):
    event_id: int
    caller_name: str


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


