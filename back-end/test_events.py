from event_generator import generate_events_for_group
from database import get_db

db = get_db()
result = db.table("groups").select("id").limit(1).execute()

if not result.data:
    print("No groups found in database to test with.")
else:
    group_id = result.data[0]["id"]
    print(f"Testing with group_id: {group_id}")
    try:
        events = generate_events_for_group(group_id)
        for ev in events:
            print(f"- {ev['event_name']} at {ev['location_name']}")
            print(f"  Phone: {ev.get('phone_number', 'Not Found')}")
    except Exception as e:
        import traceback
        traceback.print_exc()
