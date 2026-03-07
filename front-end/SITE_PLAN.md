Help me plan each page and the layout for the front end. Create a site map and a wireframe for each page if you can. I will describe a user flow and core features I want to help guide you. Include detailed guide docuemnts for each page as well to help code and build later.

When a user is logged in, we have two options:
user is not matched yet
user is matched

IF user is not matched yet.
Display a header and message along (somethign alogn the liens liek check back later, you will be notified when a matched group has been made) along an with option to go to user preferences modifications page to change stuff. 

if a user is matched, display a cool aniamtion before loading in the page to show the group details and events.

This page will have a segmented control for the following sections:
- group members
- events

witch a clear list of the other members. It shoudlk be a rpeview of each member of the group, and when you click or hover on them, animated enlargement of their profile view appears. Style the profile of each member similar to Hinge. 

Apart from the group members view, have a view (from the segmented control) for the events

This part will check the group data if event is finalzied or not:
If not finalized, this view will contain a mapbox view of the events, events displayed on the map. As well as a side bar list of the events. Each event shows their respected details as well as a metrix for voting. Allow the use to be abel to vote for their map. Also show a timer for the voting time period

If it is finalized, this view will play a func animation and affects that an event has been chosen, and only show that event details. 



For now, any backend or data functionality for groups and events, hard code examples. I will guide you later to connect them with suapabse client calls for real data and updates.

After creating these plans, also create a plan of any new tables, table updates, storage buckets, needed on supabase, along with any othe reccomended services to implement with this. 