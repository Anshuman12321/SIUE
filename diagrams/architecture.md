# Repository Architecture

The project follows a monorepo structure with a React frontend and a FastAPI backend, both communicating with Supabase for data persistence and authentication.

```mermaid
graph TD
    subgraph "Frontend (React + Vite)"
        UI[React UI Components]
        Contexts[Contexts & State]
        Hooks[Custom Hooks]
        SupabaseSDK[Supabase JS Client]
        MapboxSDK[Mapbox GL JS]
        VapiSDK[Vapi Client SDK]
    end

    subgraph "Backend (FastAPI)"
        API[FastAPI Endpoints]
        Matchmaker[Matchmaker Job]
        CalSync[Calendar Sync Engine]
        VibeParser[Vibe Parser - Gemini]
        EventGen[Event Generator - Gemini]
        SupabasePy[Supabase Python Client]
        SentenceTransformers[Sentence Transformers - Embeddings]
    end

    subgraph "External Services"
        GoogleAuth[Google OAuth 2.0]
        GoogleCal[Google Calendar API]
        Gemini[Google Gemini AI]
        VapiAPI[Vapi API - AI Calls]
        MapboxAPI[Mapbox API]
    end

    subgraph "Data Storage (Supabase)"
        Auth[Supabase Auth]
        Postgres[(Postgres + PostGIS + pgvector)]
        Storage[Supabase Storage - Avatars]
    end

    %% Interactions
    UI --> API
    UI --> SupabaseSDK
    UI --> MapboxSDK
    UI --> VapiSDK

    API --> SupabasePy
    API --> Gemini
    API --> VapiAPI
    API --> GoogleCal
    
    Matchmaker --> SupabasePy
    Matchmaker --> SentenceTransformers
    
    CalSync --> GoogleCal
    CalSync --> SupabasePy
    
    SupabaseSDK --> Auth
    SupabaseSDK --> Postgres
    SupabaseSDK --> Storage
    
    SupabasePy --> Postgres
    
    GoogleAuth -.-> UI
    GoogleAuth -.-> API
```

## Component Descriptions

| Component | Responsibility |
|-----------|----------------|
| **Frontend** | React single-page application handling user interface, onboarding, and dashboard. |
| **Backend** | FastAPI server handling business logic, AI integrations, and background jobs. |
| **Supabase** | Backend-as-a-Service providing authentication, database, and storage. |
| **Google Gemini** | AI model used for parsing user vibes and generating event suggestions. |
| **Vapi** | Platform for placing AI-powered voice calls to businesses for reservations. |
| **Mapbox** | Map visualization for event locations and user geolocation. |
| **Google Calendar** | Source of user availability for the matchmaker. |
| **Sentence Transformers** | Used locally in the backend to generate vector embeddings for user matching. |
