# SIUE: Social Interest-based User Engagement

SIUE is an intelligent social matching platform designed for **eHacks 2026**. It connects people with similar interests, "vibes," and availability by leveraging AI-powered embeddings and geospatial analysis to form compatible groups and plan localized events.

## 🚀 Overview

In an increasingly digital world, finding meaningful local connections can be challenging. SIUE automates the group-forming process by:
1.  **Profiling:** Capturing user preferences (vibe, budget, alcohol preference, activity types).
2.  **Matching:** Using Vector Similarity (pgvector) and Geospatial constraints (PostGIS) to find compatible peers.
3.  **Engagement:** Providing a shared dashboard for matched groups to explore events on a map and vote on their next outing.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) (TypeScript)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** CSS Modules, Lucide Icons
- **Auth & Database:** [Supabase](https://supabase.com/)
- **Maps:** [Mapbox GL JS](https://www.mapbox.com/mapbox-gljs)

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **AI/ML:** [Sentence-Transformers](https://www.sbert.net/) (for preference embeddings)
- **Database:** PostgreSQL (via Supabase) with `pgvector` and `PostGIS` extensions
- **Package Manager:** `uv`

## 📂 Project Structure

```text
SIUE/
├── back-end/          # FastAPI server, embedding logic, and matching jobs
├── front-end/         # React application, components, and site logic
├── tests/             # Seeding scripts and backend tests
└── README.md          # Project documentation
```

## ✨ Key Features

- **Intelligent Matching Engine:** Uses `all-MiniLM-L6-v2` to convert text-based "vibes" into vectors, allowing for nuanced similarity matching beyond simple tags.
- **Hinge-Style Member Profiles:** Visual, interactive profiles for group members to get to know each other.
- **Map-Centric Event Discovery:** Explore potential venues and activities on an interactive Mapbox view.
- **Democratic Voting:** Integrated voting system for groups to finalize their plans before a countdown timer expires.
- **Seamless Onboarding:** A multi-step flow that gathers essential preferences to ensure high-quality matches.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.12+)
- [uv](https://github.com/astral-sh/uv) (recommended for Python)
- Supabase account and project

### Backend Setup
1. Navigate to the `back-end` directory.
2. Install dependencies:
   ```bash
   uv sync
   ```
3. Create a `.env` file with your Supabase credentials:
   ```env
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_service_role_key
   ```
4. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the `front-end` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_MAPBOX_TOKEN=your_mapbox_token
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🧠 Architecture Note

SIUE utilizes a hybrid matching approach. The **Vector Search** handles the "vibe" compatibility, while **PostGIS** ensures matches are within a reasonable geographic radius. The `match_users` logic is offloaded to a Supabase RPC to minimize latency and leverage database-level optimizations.

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

---
*Created for eHacks 2026.*