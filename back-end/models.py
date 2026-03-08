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
