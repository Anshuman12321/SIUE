from __future__ import annotations

from google import genai
from google.genai.types import GenerateContentConfig
from pydantic import BaseModel

from database import get_settings

_client = None

SYSTEM_INSTRUCTION = """\
You are a vibe parser. Given a user's free-form description of what they want to do, \
extract structured information.

Rules:
- vibe: A concise descriptor (3-8 words) capturing the overall mood/energy. \
  Examples: "chill outdoor adventure", "high energy nightlife", "laid back coffee hangout".
- activity_types: A list of normalized activity categories. Use lowercase terms like: \
  "hiking", "camping", "bar hopping", "coffee", "gaming", "movies", "sports", \
  "dining", "shopping", "live music", "art", "fitness", "beach", "board games", \
  "karaoke", "cooking", "dancing", "volunteering", "study group".
- alcohol: true if the user mentions or implies drinking/bars/nightlife with alcohol. \
  false if they explicitly say no alcohol or the context doesn't involve it.
- budget_min: Lower bound in USD. Default to 0 if not mentioned.
- budget_max: Upper bound in USD. Default to 100 if not mentioned. \
  If they say "low budget" or "cheap", use 0-30. \
  If they say "moderate", use 30-75. \
  If they say "expensive" or "splurge", use 75-200.
"""


class ParsedVibe(BaseModel):
    vibe: str
    activity_types: list[str]
    alcohol: bool
    budget_min: int
    budget_max: int


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        settings = get_settings()
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def parse_vibe(raw_text: str) -> ParsedVibe:
    client = _get_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=raw_text,
        config=GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ParsedVibe,
            system_instruction=SYSTEM_INSTRUCTION,
        ),
    )
    return response.parsed
