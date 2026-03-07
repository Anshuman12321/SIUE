# Docker Setup Guide

This guide explains how to use Docker with this project.

## Prerequisites

- Install [Docker](https://www.docker.com/products/docker-desktop)
- Install [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

### Build and run all services:

```bash
docker-compose up --build
```

### Run services in background:

```bash
docker-compose up -d --build
```

### Stop services:

```bash
docker-compose down
```

## Services

### Backend
- **Port**: 8000
- **Image**: Python 3.12 slim
- **Volume**: Mounted for development (live code reload)
- **URL**: http://localhost:8000

### Frontend
- **Port**: 80
- **Image**: Node 20 Alpine + Nginx
- **URL**: http://localhost

## Individual Commands

### Build images only:

```bash
docker-compose build
```

### View logs:

```bash
docker-compose logs -f
```

### View specific service logs:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Execute command in container:

```bash
docker-compose exec backend python main.py
docker-compose exec frontend npm run lint
```

### Remove containers and volumes:

```bash
docker-compose down -v
```

## Development Workflow

1. **Backend development**: Edit Python files - changes appear in container via volume mount
2. **Frontend development**: Run `npm run dev` locally for hot reload, or rebuild container for production build
3. **Database/Services**: Add additional services to `docker-compose.yml` as needed

## Production Considerations

For production deployment:

1. Remove `volumes` from `docker-compose.yml` (backend)
2. Change `PYTHONUNBUFFERED` to match your environment
3. Set up environment variables in `.env` file
4. Use proper API gateway/reverse proxy (e.g., Traefik, Nginx)
5. Implement proper logging and monitoring
6. Use secret management (Docker secrets or external service)

## Troubleshooting

### Port already in use:

Change port mappings in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Change 8001 to desired port
```

### Backend not connecting to frontend:

Ensure both services use the same network (`siue-network` is defined).

### Clear everything and start fresh:

```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```
