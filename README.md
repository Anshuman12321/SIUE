# Connect — Find Your People. Plan Your Vibe.

A full-stack **hangout app** that matches users by interests, location, and calendar availability, forms small groups, and helps them discover and vote on events—with AI-powered outbound calls for reservations.

---

## The Problem

People want to hang out with others who share their interests and schedule, but:

- **Discovery is hard:** It’s difficult to find nearby people with similar vibes, budget, and preferences.
- **Scheduling is painful:** Even when you find a group, aligning free time across calendars is tedious.
- **Plans fizzle:** Without a clear way to decide on an activity and lock it in, plans often never happen.

The result: more scrolling, fewer real hangouts.

---

## The Solution

**Connect** is an end-to-end platform that:

1. **Matches you with compatible people** using your interests, location, budget, and preferences—and only pairs you with users who share at least one **2+ hour free window** in the next 7 days (via Google Calendar).
2. **Puts you in small groups** (ex. 3–4 people) so you can see who you’re matched with and coordinate.
3. **Lets you vote on events** as a group, with a timer and a map of candidate activities.
4. **Stores everything in Supabase**—users, profiles, groups, calendar tokens, availability—so the dashboard always reflects live data from the database.
5. **Places an AI call** (“Riley”) to a phone number for reservations or confirmations, with structured results shown in the app.

Data throughout the app—group membership, events, availability, preferences—is **pulled from Supabase** (and, where applicable, from the backend API that reads/writes Supabase). The frontend displays groups and events that come from the database and from the matchmaker job.

---

## Features & User Flow

### Authentication & Onboarding

- **Sign up / Log in** via Supabase Auth (email + password). Session is persisted; the app uses the Supabase client for auth state.
- **Onboarding (multi-step):**
  - Name, avatar (upload to Supabase Storage `avatars` bucket), short bio.
  - Two prompt/response pairs (e.g. “A perfect weekend looks like…”).
  - **Location** via browser geolocation + Mapbox Geocoder reverse lookup for a readable label.
  - **Google Calendar connect** via OAuth: user is sent to Google, authorizes read-only calendar access, then is redirected back; the backend exchanges the code for tokens and stores them in Supabase (`calendar_tokens`). An initial availability sync runs and writes busy blocks to `user_availability`.
  - **Vibe:** free-form text describing what they want to do; optional **vibe parsing** (see Tools) can structure this.
- Onboarding completion is saved to **Supabase**: `users` table is updated with name, bio, prompts, interests, and avatar URL. Profile and completion status are read from Supabase.

### Dashboard (Home)

- **Welcome state:** The app loads the user’s **match status and group from Supabase**. If the user is in a group (assigned by the matchmaker), they see the group name and can open **Group Members** and **Events** tabs.
- **Group Members tab:** Lists members of the user’s group; member data is **sourced from Supabase** (users and group membership). Users can open a member profile modal.
- **Events tab:**
  - **Voting phase:** Events are **loaded from the database** (or from the API that reads event/group data from Supabase). Users see a list and a **Mapbox** map of event locations; they can upvote. A voting timer is shown.
  - **Finalized phase:** When the group has chosen an event, the app shows the chosen event details (again from Supabase/API).
- **Riley Call button:** Triggers an outbound AI call (see Tools). The backend places the call and returns structured data (e.g. reservation confirmation); the UI displays the result.

### Preferences

- Users can update **location, age group, alcohol preference, budget, activity type, and vibe**. Preferences are sent to the backend and stored in Supabase (e.g. `users.interests` and related fields used by the matchmaker).

### Calendar & Availability

- **Calendar status** is read from Supabase (`calendar_tokens`): the frontend calls the backend `/users/{id}/calendar-status`, which checks if the user has tokens stored.
- **Sync:** Backend endpoint `/users/{id}/calendar/sync` fetches busy blocks from the Google Calendar FreeBusy API and **writes them to Supabase** `user_availability`. The matchmaker uses this table (via `users_share_free_time`) to only match users who share a 2+ hour free window.

---

## Architecture Overview

- **Frontend:** Single-page app (React, TypeScript, Vite). Talks to Supabase (auth, `users` profile, storage) and to the **backend API** for preferences, matchmaker, calendar OAuth/sync/availability, and Riley calls.
- **Backend:** FastAPI (Python). Uses **Supabase** (server-side) for users, groups, calendar_tokens, user_availability, and RPCs. Does not store “mock” data; group and event data displayed in the app come from **Supabase and the API**.
- **Data:** All persistent state lives in **Supabase**—users, groups, calendar_tokens, user_availability—and is queried/updated by both the frontend (Supabase client) and the backend (Supabase server client).

---

## Tools & Integrations

| Category | Tool | Purpose |
|----------|------|---------|
| **Database & Auth** | **Supabase** | Auth (sign up, login, session), Postgres (users, groups, calendar_tokens, user_availability), Storage (avatars), RLS. All group and event data shown in the app are **pulled from Supabase** (directly or via the API). |
| **Backend RPCs** | Supabase Postgres functions | `get_lonely_users`: users not yet in a group; `match_users`: vector + location-based matching; `remove_member_from_group`: leave/decline. Used by the matchmaker and decline flow. |
| **Embeddings & Matching** | **sentence-transformers** (all-MiniLM-L6-v2) | Turns vibe + activity types into a vector stored in `users.embedding`. Matchmaker uses Supabase RPC `match_users` with this embedding and location for similarity search. |
| **Vibe Parsing** | **Google Gemini** (gemini-2.5-flash) | Parses free-form “vibe” text into structured fields (vibe label, activity_types, alcohol, budget_min/max). Used to normalize onboarding/preference input. |
| **Calendar** | **Google OAuth 2.0** + **Google Calendar FreeBusy API** | OAuth stores tokens in `calendar_tokens`; FreeBusy returns busy intervals; backend syncs them into **Supabase** `user_availability`. Matchmaker reads from Supabase to enforce shared free time. |
| **Maps & Geocoding** | **Mapbox** (Mapbox GL JS, Geocoder) | Map of event locations on the Events tab; reverse geocoding for onboarding location label. Events and locations are **sourced from Supabase/API**. |
| **AI Voice / Outbound Call** | **Vapi** (+ **Twilio** for telephony) | “Riley” assistant places outbound calls; backend creates the call, polls until done, returns structured analysis (e.g. reservation confirmation). No mock data—results come from the live call. |

---

## Tech Stack Summary

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, TypeScript, Vite 7, React Router 7, Supabase JS client, Mapbox GL JS, Mapbox Geocoder |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic, Pydantic-Settings |
| **Data & Auth** | Supabase (Postgres, Auth, Storage, RLS) |
| **APIs & Services** | Google Gemini, Google OAuth 2.0, Google Calendar FreeBusy, Vapi, Twilio, Mapbox |

---

## Repository Structure (High Level)

```
SIUE/
├── front-end/                 # React SPA
│   ├── src/
│   │   ├── components/        # UI, dashboard, auth, onboarding
│   │   ├── contexts/          # Auth, Onboarding
│   │   ├── hooks/              # useUserProfile, useCalendarStatus
│   │   ├── lib/                # supabase client, userProfile
│   │   ├── pages/              # Landing, Login, Signup, Onboarding, Home, Preferences
│   │   └── App.tsx, main.tsx
│   ├── supabase/migrations/   # RLS, calendar_tokens, user_availability
│   └── package.json, vite.config.ts
├── back-end/                  # FastAPI API
│   ├── server.py              # Routes: preferences, matchmaker, groups, calendar, calls
│   ├── database.py            # Supabase client, settings
│   ├── google_auth.py         # OAuth URL, token exchange, refresh, save to Supabase
│   ├── calendar_sync.py       # FreeBusy fetch, sync to Supabase, users_share_free_time
│   ├── embeddings.py          # sentence-transformers embedding
│   ├── vibe_parser.py         # Gemini structured vibe parsing
│   ├── vapi.py                # Create call, poll until done
│   ├── models.py              # Pydantic request/response models
│   └── pyproject.toml
├── docker-compose.yml         # backend + frontend (nginx) containers
├── DEPLOY.md                  # Docker & Vultr deployment steps
└── README.md                  # This file
```

---

## Key Backend Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/users/{user_id}/preferences` | Update user preferences and embedding in Supabase. |
| POST | `/jobs/matchmaker` | Run matchmaker: get lonely users from Supabase, match via RPC (embedding + location + free time), insert groups into Supabase. |
| POST | `/groups/{group_id}/decline` | Remove current user from group (Supabase RPC). |
| POST | `/calls/place` | Place outbound Riley call (Vapi), return structured result. |
| GET | `/auth/google/calendar` | Redirect to Google OAuth (calendar). |
| GET | `/auth/google/calendar/callback` | Exchange code, save tokens to Supabase, sync availability into `user_availability`. |
| GET | `/users/{user_id}/calendar-status` | Whether user has calendar tokens in Supabase. |
| POST | `/users/{user_id}/calendar/sync` | Fetch FreeBusy, write busy blocks to Supabase. |
| GET | `/users/{user_id}/availability` | Return busy blocks from Supabase. |

---

## Supabase Data Model (Concise)

- **users:** id (auth), name, bio, prompts, interests (JSON), embedding (vector), location (WKT), avatar_url. Updated by onboarding and preferences; read for profile and matchmaker.
- **groups:** members (array of user ids), activity_type, status. Created by matchmaker; read to show group and members.
- **calendar_tokens:** user_id, provider, access_token, refresh_token, token_expiry, scopes. Written by Google OAuth callback; read for calendar status and refresh.
- **user_availability:** user_id, busy_start, busy_end, synced_at. Written by calendar sync; read by matchmaker and availability endpoint.

All group and event data displayed in the dashboard are **loaded from Supabase** (and from API responses that query Supabase).

---

## Environment & Configuration

- **Backend** (`.env` in `back-end/`): Supabase URL and key, Gemini API key, Google OAuth client id/secret/redirect_uri, Google Places (optional), Vapi API key and assistant id, Twilio credentials. Optional: `ALLOWED_ORIGINS` for CORS.
- **Frontend** (`.env` in `front-end/`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (backend base URL), `VITE_MAPBOX_TOKEN`, `VITE_VAPI_PUBLIC_KEY`, `VITE_VAPI_ASSISTANT_ID` (if using Vapi from client).

For production and Docker, see **DEPLOY.md**.

---

## Running Locally

1. **Supabase:** Create a project, run migrations (RLS, calendar_tokens, user_availability), create `users`/`groups` and RPCs if not already present. Configure Auth and Storage (avatars).
2. **Backend:** From `back-end/`, create `.env`, then run `uv run python main.py` (or `uvicorn server:app --reload --port 8000`).
3. **Frontend:** From `front-end/`, create `.env` with Vite vars, then `npm install` and `npm run dev`. Open the app and use the backend URL for API and OAuth redirect.

For containerized run and Vultr hosting, follow **DEPLOY.md**.

---

## Summary

**Connect** solves the “find your people and actually make plans” problem by matching users with **Supabase-backed** profiles, preferences, and calendar availability; forming groups via an embedding + location + free-time matchmaker; and letting groups vote on events and optionally confirm plans with an AI call. All data—users, groups, events, availability—is **stored in and pulled from Supabase**; nothing in the app is driven by mock data.
