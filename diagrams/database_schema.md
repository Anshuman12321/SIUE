# Database Schema (ERD)

The database is hosted on Supabase (PostgreSQL) and uses PostGIS for location data and `pgvector` for user embeddings.

```mermaid
erDiagram
    users {
        uuid id PK
        timestamp created_at
        text name
        json interests
        vector embedding
        geography location
        text[] prompts
        text avatar_url
        text bio
        bigint group_id FK
        smallint age
    }

    groups {
        bigint id PK
        timestamp created_at
        uuid[] members
        bigint vibe_score
        timestamp voting_ends_at
        bigint final_event_id FK
    }

    calendar_tokens {
        bigint id PK
        uuid user_id FK
        text provider
        text access_token
        text refresh_token
        timestamp token_expiry
        text[] scopes
        timestamp created_at
        timestamp updated_at
    }

    user_availability {
        bigint id PK
        uuid user_id FK
        timestamp busy_start
        timestamp busy_end
        timestamp synced_at
    }

    events {
        bigint id PK
        timestamp created_at
        text event_name
        text address
        timestamp date_time
        bigint group_id FK
        text location_name
        geography location
        text description
        text phone_number
    }

    votes {
        bigint id PK
        timestamp created_at
        uuid user_id FK
        bigint event_id FK
    }

    users ||--o| groups : "belongs to"
    groups ||--o{ users : "has members"
    groups ||--o{ events : "has suggested events"
    groups ||--o| events : "finalized event"
    users ||--o{ calendar_tokens : "has tokens"
    users ||--o{ user_availability : "has busy blocks"
    users ||--o{ votes : "casts votes"
    events ||--o{ votes : "received votes"
```

## Table Descriptions

| Table | Description |
|-------|-------------|
| **users** | Core user profiles, including preferences, embeddings for matching, and geolocation. |
| **groups** | Formed groups of compatible users, tracking member IDs and voting status. |
| **calendar_tokens** | OAuth tokens for Google Calendar access. |
| **user_availability** | Synced busy blocks from Google Calendar, used for time-based matching. |
| **events** | Suggested and finalized events for each group. |
| **votes** | Individual user votes for suggested events within their group. |
| **geography_columns / geometry_columns / spatial_ref_sys** | PostGIS internal tables for spatial data support. |
