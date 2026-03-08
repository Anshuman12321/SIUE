from __future__ import annotations

import httpx

from database import get_settings

SEARCH_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"

# Maps app activity categories (from vibe_parser.py) to Google Places API (New) includedTypes.
# Reference: https://developers.google.com/maps/documentation/places/web-service/place-types
ACTIVITY_TO_PLACE_TYPES: dict[str, list[str]] = {
    "hiking": ["park", "hiking_area", "national_park"],
    "camping": ["campground", "park", "national_park"],
    "bar hopping": ["bar", "night_club"],
    "coffee": ["cafe", "coffee_shop"],
    "gaming": ["amusement_center"],
    "movies": ["movie_theater"],
    "sports": ["sports_complex", "gym", "stadium"],
    "dining": ["restaurant"],
    "shopping": ["shopping_mall", "market"],
    "live music": ["night_club", "performing_arts_theater"],
    "art": ["art_gallery", "museum"],
    "fitness": ["gym", "sports_complex"],
    "beach": ["beach"],
    "board games": ["cafe", "amusement_center"],
    "karaoke": ["night_club", "bar"],
    "cooking": ["restaurant", "market"],
    "dancing": ["night_club"],
    "volunteering": ["community_center"],
    "study group": ["library", "cafe", "coffee_shop"],
}


def _activity_types_to_place_types(activity_types: list[str]) -> list[str]:
    """Convert app activity_types to Google Places includedTypes, deduplicating."""
    place_types: set[str] = set()
    for activity in activity_types:
        mapped = ACTIVITY_TO_PLACE_TYPES.get(activity.lower(), [])
        place_types.update(mapped)
    if not place_types:
        place_types = {"restaurant", "cafe", "park", "bar"}
    return list(place_types)


def search_nearby_places(
    lat: float,
    lng: float,
    activity_types: list[str],
    radius_meters: float = 16000.0,
    max_results: int = 20,
) -> list[dict]:
    """Call Google Places API (New) searchNearby endpoint.

    Returns list of place dicts with keys:
        place_id, display_name, address, lat, lng, types, primary_type, summary
    """
    settings = get_settings()
    included_types = _activity_types_to_place_types(activity_types)

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.google_places_api_key,
        "X-Goog-FieldMask": (
            "places.displayName,"
            "places.formattedAddress,"
            "places.location,"
            "places.types,"
            "places.id,"
            "places.primaryType,"
            "places.editorialSummary,"
            "places.nationalPhoneNumber"
        ),
    }

    body = {
        "includedTypes": included_types,
        "maxResultCount": max_results,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": radius_meters,
            }
        },
    }

    resp = httpx.post(SEARCH_NEARBY_URL, headers=headers, json=body, timeout=10.0)
    resp.raise_for_status()
    data = resp.json()

    places = []
    for p in data.get("places", []):
        loc = p.get("location", {})
        places.append({
            "place_id": p.get("id", ""),
            "display_name": p.get("displayName", {}).get("text", ""),
            "address": p.get("formattedAddress", ""),
            "lat": loc.get("latitude", 0.0),
            "lng": loc.get("longitude", 0.0),
            "types": p.get("types", []),
            "primary_type": p.get("primaryType", ""),
            "summary": p.get("editorialSummary", {}).get("text", ""),
            "phone_number": p.get("nationalPhoneNumber", ""),
        })
    return places
