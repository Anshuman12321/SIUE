# User Flow

The user journey in Connect spans from onboarding to event selection and reservation.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Supabase
    participant GoogleCalendar
    participant GeminiAI
    participant Vapi

    %% Onboarding Flow
    Note over User, Supabase: Onboarding Flow
    User->>Frontend: Signs up / Logs in
    Frontend->>Supabase: Create/Fetch User Session
    User->>Frontend: Completes Profile (Name, Bio, Prompts)
    User->>Frontend: Provides Location (Browser API)
    User->>Frontend: Connects Google Calendar
    Frontend->>Backend: Start Google OAuth Redirect
    Backend->>GoogleCalendar: Authorize Access
    GoogleCalendar->>Backend: Return OAuth Code
    Backend->>Supabase: Store Access/Refresh Tokens
    Backend->>Backend: Fetch & Sync Busy Blocks
    Backend->>Supabase: Store user_availability
    User->>Frontend: Describes "Vibe"
    Frontend->>Backend: Post Vibe Text
    Backend->>GeminiAI: Parse Vibe (Structured Data)
    Backend->>Backend: Generate Vector Embedding
    Backend->>Supabase: Update User Preferences & Embedding

    %% Matching Flow
    Note over Backend, Supabase: Matching (Background Job)
    Backend->>Supabase: Call get_lonely_users()
    Backend->>Supabase: Call match_users(embedding, location)
    Backend->>Backend: Check shared free time overlap (2+ hours)
    Backend->>Supabase: Create new group, Assign members
    Supabase->>Frontend: State Change (via Realtime or Polling)

    %% Event Voting Flow
    Note over User, GeminiAI: Event Voting & Finalization
    User->>Frontend: Opens Dashboard (now in a group)
    Frontend->>Backend: Request Suggested Events
    Backend->>Supabase: Fetch member vibes & availability
    Backend->>Supabase: Get group centroid (PostGIS)
    Backend->>GeminiAI: Generate 3 diverse event suggestions
    Backend->>Supabase: Store events for group
    Frontend->>User: Displays 3 events + Map
    User->>Frontend: Votes for an event
    Frontend->>Supabase: Insert vote
    Note over Supabase, User: Voting period ends
    Supabase->>Frontend: Shows winner event

    %% Riley Call flow
    Note over User, Vapi: Riley Call (Optional)
    User->>Frontend: Clicks "Riley Call" for reservation
    Frontend->>Backend: Place Call request (Phone number)
    Backend->>Vapi: Create outbound AI call
    Vapi->>Backend: Structured result (Confirmed/Failed)
    Backend->>Frontend: Display confirmation to user
```

## Step-by-Step Breakdown

### 1. Onboarding
- **Identity & Profile:** Users create their identity and provide social prompts for matching.
- **Location & Calendar:** Critical for the matchmaker to ensure users are nearby and share free time.
- **Vibe Parsing:** Gemini AI structures free-form text into attributes like activity types, budget, and alcohol preference.

### 2. Matchmaker Job
- **Vector Search:** Uses `pgvector` to find users with similar interests.
- **Geospatial Filter:** Uses PostGIS to ensure users are within a reasonable radius (e.g., 20 miles).
- **Time Filter:** A critical backend check ensuring all group members share a 2-hour free window in the next 7 days.

### 3. Group Dashboard
- **Group Formation:** Users are notified once they are placed in a small group (3–4 people).
- **Event Selection:** The backend generates 3 tailored events near the group's centroid based on shared vibes and availability.
- **Voting:** Group members vote on their preferred activity.

### 4. Reservation (Riley Call)
- **AI-Powered:** Riley (the Vapi agent) calls the venue directly to confirm availability or make a reservation, returning a structured summary to the group.
