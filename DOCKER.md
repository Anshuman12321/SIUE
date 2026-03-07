# Docker Setup Guide

This guide explains how to use Docker with this project.

## Prerequisites

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Docker Desktop includes Docker Compose

## Quick Start

### 1. Create your .env file:

```bash
# Copy the example
cp .env.example .env

# Edit .env with your backend API URL and Supabase credentials
```

### 2. Build and run all services:

```bash
docker compose up --build
```

### 3. View logs:

```bash
docker compose logs -f
```

### 4. Stop services:

```bash
docker compose down
```

## Services

### Backend
- **URL**: http://localhost:8000
- **Port**: 8000
- **Image**: Python 3.12
- **Auto-restart**: Yes
- **Health check**: Uses curl to verify service

### Frontend
- **URL**: http://localhost
- **Port**: 80 (HTTP)
- **Image**: Node 20 Alpine + Nginx
- **Auto-restart**: Yes
- **Depends on**: Backend (waits for health check)

## Environment Configuration

### Frontend Variables
Set these in `.env` file:

```bash
VITE_API_URL=http://localhost:8000        # Backend API URL
VITE_SUPABASE_URL=your_supabase_url      # Supabase project URL
VITE_SUPABASE_KEY=your_supabase_key      # Supabase public API key
```

### Backend Variables
Set these in `backend/.env`:

```bash
PYTHONUNBUFFERED=1
# Add other backend env vars as needed
```

## Common Commands

### Build only (no start):

```bash
docker compose build
```

### View specific service logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### Execute command in running container:

```bash
docker compose exec backend python main.py
docker compose exec frontend npm run build
```

### Remove containers and volumes:

```bash
docker compose down -v
```

### Clean up all Docker data:

```bash
docker system prune -a
```

## Adding Python Dependencies

1. Edit `backend/requirements.txt`
2. Rebuild the backend image:

```bash
docker compose build backend
docker compose up -d backend
```

## Adding npm Dependencies

1. Edit `frontend/package.json`
2. Rebuild the frontend image:

```bash
docker compose build frontend
docker compose up -d frontend
```

## Health Checks

The backend service includes a health check that verifies the service is running. The frontend waits for this health check to pass before starting.

**Note**: You'll need to implement a `/health` endpoint in your backend for the health check to work properly.

Example for a simple backend:
```python
@app.get("/health")
def health():
    return {"status": "ok"}
```

## Troubleshooting

### Docker Desktop won't start
- Ensure Hyper-V or WSL 2 is enabled on Windows
- For WSL 2: `wsl --set-default-version 2`

### Port already in use
Edit `docker-compose.yml` and change the port mapping:
```yaml
ports:
  - "8001:8000"  # Use 8001 instead of 8000
```

### Frontend can't reach backend
Check `.env` file has correct `VITE_API_URL`. If running locally:
```bash
VITE_API_URL=http://localhost:8000
```

### Clear cache and restart
```bash
docker compose down -v
docker system prune -a --volumes
docker compose up --build
```

## Production Deployment

For production:
1. Remove volume mounts for code
2. Set proper environment variables
3. Use a reverse proxy (Nginx, Traefik)
4. Configure SSL/TLS certificates
5. Set up proper logging and monitoring
6. Use Docker secrets for sensitive data
