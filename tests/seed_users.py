"""
Seed 20 personas and verify the matchmaker groups compatible users.
Run from back-end/: uv run python ../tests/seed_users.py
"""

import requests
import uuid

from database import get_db

BASE = "http://localhost:8000"
db = get_db()


# 20 personas clustered around SIUE (lat=38.58, lng=-89.95) with ±0.05° offsets
# Using the frontend interests JSON shape:
#   { location: {lat, lng, label}, age_range: {min, max}, alcohol: bool, budget: str, vibe: str }
PERSONAS = [
    # --- No-alcohol athletes ---
    {
        "id": str(uuid.uuid4()),
        "label": "athlete_1",
        "name": "Alex Runner",
        "interests": {
            "location": {"lat": 38.582, "lng": -89.952, "label": "SIUE Campus"},
            "age_range": {"min": 18, "max": 22},
            "alcohol": False,
            "budget": "low",
            "vibe": "competitive sports fitness training running gym hiking",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "athlete_2",
        "name": "Jordan Fit",
        "interests": {
            "location": {"lat": 38.579, "lng": -89.948, "label": "SIUE Campus"},
            "age_range": {"min": 18, "max": 22},
            "alcohol": False,
            "budget": "low",
            "vibe": "fitness outdoor cardio sports active lifestyle running cycling gym",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "athlete_3",
        "name": "Morgan Hiker",
        "interests": {
            "location": {"lat": 38.584, "lng": -89.955, "label": "SIUE Campus"},
            "age_range": {"min": 23, "max": 27},
            "alcohol": False,
            "budget": "low",
            "vibe": "health wellness exercise outdoor activities hiking running yoga",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "athlete_4",
        "name": "Casey Active",
        "interests": {
            "location": {"lat": 38.577, "lng": -89.951, "label": "SIUE Campus"},
            "age_range": {"min": 23, "max": 27},
            "alcohol": False,
            "budget": "low",
            "vibe": "outdoor adventure sports competitive active cycling hiking gym",
        },
    },
    # --- Drinkers / social bar crowd ---
    {
        "id": str(uuid.uuid4()),
        "label": "drinker_1",
        "name": "Pat Barfly",
        "interests": {
            "location": {"lat": 38.583, "lng": -89.947, "label": "Downtown"},
            "age_range": {"min": 23, "max": 27},
            "alcohol": True,
            "budget": "medium",
            "vibe": "bar hopping craft beer social nightlife trivia karaoke",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "drinker_2",
        "name": "Sam Cocktails",
        "interests": {
            "location": {"lat": 38.581, "lng": -89.944, "label": "Downtown"},
            "age_range": {"min": 23, "max": 27},
            "alcohol": True,
            "budget": "high",
            "vibe": "cocktails happy hour downtown socializing fun wine tasting trivia",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "drinker_3",
        "name": "Taylor Night",
        "interests": {
            "location": {"lat": 38.580, "lng": -89.950, "label": "Downtown"},
            "age_range": {"min": 28, "max": 35},
            "alcohol": True,
            "budget": "high",
            "vibe": "nightlife party social drinks dancing bars karaoke",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "drinker_4",
        "name": "Riley Brew",
        "interests": {
            "location": {"lat": 38.578, "lng": -89.946, "label": "Downtown"},
            "age_range": {"min": 28, "max": 35},
            "alcohol": True,
            "budget": "medium",
            "vibe": "craft beer brewery social weekend fun bars trivia",
        },
    },
    # --- Golf / TopGolf ---
    {
        "id": str(uuid.uuid4()),
        "label": "golfer_1",
        "name": "Drew Driver",
        "interests": {
            "location": {"lat": 38.586, "lng": -89.953, "label": "SIUE Area"},
            "age_range": {"min": 28, "max": 35},
            "alcohol": False,
            "budget": "high",
            "vibe": "golf TopGolf sports recreation outdoor driving range",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "golfer_2",
        "name": "Jamie Putter",
        "interests": {
            "location": {"lat": 38.575, "lng": -89.942, "label": "SIUE Area"},
            "age_range": {"min": 23, "max": 27},
            "alcohol": False,
            "budget": "medium",
            "vibe": "TopGolf driving range golf course sports bowling",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "golfer_3",
        "name": "Quinn Fairway",
        "interests": {
            "location": {"lat": 38.588, "lng": -89.958, "label": "SIUE Area"},
            "age_range": {"min": 36, "max": 50},
            "alcohol": False,
            "budget": "high",
            "vibe": "golf social competitive recreation outdoor fun disc golf",
        },
    },
    # --- Foodies ---
    {
        "id": str(uuid.uuid4()),
        "label": "foodie_1",
        "name": "Avery Taste",
        "interests": {
            "location": {"lat": 38.576, "lng": -89.956, "label": "SIUE Area"},
            "age_range": {"min": 23, "max": 27},
            "alcohol": False,
            "budget": "medium",
            "vibe": "foodie restaurant dining culinary exploration food tour cooking class",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "foodie_2",
        "name": "Blake Gourmet",
        "interests": {
            "location": {"lat": 38.583, "lng": -89.960, "label": "SIUE Area"},
            "age_range": {"min": 28, "max": 35},
            "alcohol": False,
            "budget": "high",
            "vibe": "new restaurants cuisine food social dining out brunch food tour",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "foodie_3",
        "name": "Charlie Brunch",
        "interests": {
            "location": {"lat": 38.581, "lng": -89.943, "label": "Downtown"},
            "age_range": {"min": 23, "max": 27},
            "alcohol": True,
            "budget": "medium",
            "vibe": "brunch mimosas social eating food culture restaurant cafe",
        },
    },
    # --- Outdoor / nature types ---
    {
        "id": str(uuid.uuid4()),
        "label": "outdoor_1",
        "name": "Sage Trail",
        "interests": {
            "location": {"lat": 38.590, "lng": -89.945, "label": "Nature Area"},
            "age_range": {"min": 18, "max": 22},
            "alcohol": False,
            "budget": "low",
            "vibe": "nature trails camping outdoor adventure wilderness hiking kayaking",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "outdoor_2",
        "name": "River Photo",
        "interests": {
            "location": {"lat": 38.574, "lng": -89.940, "label": "Nature Area"},
            "age_range": {"min": 23, "max": 27},
            "alcohol": False,
            "budget": "low",
            "vibe": "parks trails nature photography outdoor relaxation hiking picnic",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "outdoor_3",
        "name": "Lake Paddle",
        "interests": {
            "location": {"lat": 38.591, "lng": -89.962, "label": "Nature Area"},
            "age_range": {"min": 28, "max": 35},
            "alcohol": False,
            "budget": "medium",
            "vibe": "kayaking canoeing water outdoor adventure fishing camping",
        },
    },
    # --- Gaming / indoor ---
    {
        "id": str(uuid.uuid4()),
        "label": "gamer_1",
        "name": "Pixel Pro",
        "interests": {
            "location": {"lat": 38.580, "lng": -89.957, "label": "SIUE Campus"},
            "age_range": {"min": 18, "max": 22},
            "alcohol": False,
            "budget": "low",
            "vibe": "gaming arcade esports board games chill escape room",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "gamer_2",
        "name": "Dice Roll",
        "interests": {
            "location": {"lat": 38.578, "lng": -89.954, "label": "SIUE Campus"},
            "age_range": {"min": 18, "max": 22},
            "alcohol": False,
            "budget": "low",
            "vibe": "board games tabletop RPG social indoor fun arcade trivia",
        },
    },
    {
        "id": str(uuid.uuid4()),
        "label": "gamer_3",
        "name": "Key Escape",
        "interests": {
            "location": {"lat": 38.585, "lng": -89.949, "label": "SIUE Area"},
            "age_range": {"min": 23, "max": 27},
            "alcohol": False,
            "budget": "medium",
            "vibe": "escape room puzzle solving games social board games mini golf",
        },
    },
]

# Map label -> assigned user_id for verification
label_to_id: dict[str, str] = {}


def seed_users():
    print("=== Seeding 20 users ===")
    for p in PERSONAS:
        uid = p["id"]
        db.table("users").upsert({
            "id": uid,
            "name": p.get("name", p["label"]),
            "interests": p["interests"],
        }).execute()
        label_to_id[p["label"]] = uid
        print(f"  {p['label']:12s} -> {uid}")
    print(f"Seeded {len(PERSONAS)} users.\n")


def process_vibes():
    print("=== Processing vibes (embedding + geometry) ===")
    for p in PERSONAS:
        uid = p["id"]
        resp = requests.post(f"{BASE}/users/{uid}/process-vibe")
        resp.raise_for_status()
        data = resp.json()
        print(f"  {p['label']:12s} -> activity_types={data.get('activity_types', [])}")
    print("Done.\n")


def run_matchmaker():
    print("=== Running matchmaker ===")
    resp = requests.post(f"{BASE}/jobs/matchmaker")
    resp.raise_for_status()
    data = resp.json()
    print(f"  groups_created={data['groups_created']}, lonely_users_processed={data['lonely_users_processed']}\n")
    return data


def verify_groups():
    print("=== Verifying groups ===")

    # Compatible clusters we expect to land together:
    expected_clusters = [
        ("no-alcohol athletes", ["athlete_1", "athlete_2", "athlete_3", "athlete_4"]),
        ("drinkers", ["drinker_1", "drinker_2", "drinker_3", "drinker_4"]),
        ("gamers", ["gamer_1", "gamer_2", "gamer_3"]),
    ]

    print("Label -> user_id mapping (check Supabase groups table):")
    for label, uid in label_to_id.items():
        print(f"  {label:14s}: {uid}")

    print("\nExpected compatible clusters (should end up in same group):")
    for name, labels in expected_clusters:
        ids = [label_to_id[l] for l in labels]
        print(f"  {name}: {ids}")

    print("\nVerification complete. Cross-reference with Supabase groups table.")


if __name__ == "__main__":
    seed_users()
    process_vibes()
    run_matchmaker()
    verify_groups()
