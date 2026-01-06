# Docker Setup Guide

This project includes a complete Docker setup to run both the Python backend and Next.js frontend.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

## Quick Start

### 1. Start All Services

```bash
docker-compose up
```

This will:
- Build and start the FastAPI backend on `http://localhost:8000`
- Build and start the Next.js frontend on `http://localhost:3000`
- Create a shared network for communication between services

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Services

### Backend (FastAPI)
- **Port**: 8000
- **Language**: Python 3.11
- **Framework**: FastAPI with Uvicorn
- **Database**: SQLite (persisted in `backend_db` volume)
- **Hot Reload**: Enabled (changes to code auto-reload)

### Frontend (Next.js)
- **Port**: 3000
- **Language**: TypeScript/JavaScript
- **Framework**: Next.js 16
- **Hot Reload**: Enabled (changes to code auto-reload)

## Common Commands

### Start Services
```bash
docker-compose up
```

### Start in Background
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild Images
```bash
docker-compose up --build
```

### Remove Everything (including volumes)
```bash
docker-compose down -v
```

## Environment Variables

### For Docker (Recommended)

The services use environment variables from a `.env` file in the **project root**. To set up:

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```env
   VAPI_API_KEY=sk_live_your_actual_key
   PHONE_NUMBER_ID=your_phone_number_id
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Start the services:
   ```bash
   docker-compose up
   ```

### For Local Development (Without Docker)

If you're running the services locally without Docker:

- **Backend**: Create `backend/.env` with backend variables
- **Frontend**: Create `frontend2/.env.local` with frontend variables

The `.env` file in the project root is **only for Docker** and will be ignored by local development.

### Backend Environment Variables
- `DATABASE_URL`: Database connection string (default: `sqlite+aiosqlite:///./reminders.db`)
- `SCHEDULER_INTERVAL_SECONDS`: Scheduler polling interval in seconds (default: `10`)
- `MAX_RETRY_ATTEMPTS`: Maximum retry attempts for failed reminders (default: `3`)
- `VAPI_API_KEY`: API key for Vapi service (required for voice calls)
- `PHONE_NUMBER_ID`: Phone number ID for Vapi (required for voice calls)
- `PYTHONUNBUFFERED`: Set to 1 for real-time logs (default: `1`)

### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:8000`)

## Troubleshooting

### Port Already in Use
If ports 3000 or 8000 are already in use:

```bash
# Change ports in docker-compose.yml
# For example, change "3000:3000" to "3001:3000"
```

### Database Issues
To reset the database:

```bash
docker-compose down -v
docker-compose up
```

### Build Issues
Clear Docker cache and rebuild:

```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

## Development Workflow

1. Make changes to code in `backend/` or `frontend2/`
2. Changes are automatically detected and reloaded
3. Check logs with `docker-compose logs -f`
4. Test in browser at http://localhost:3000

## Production Deployment

For production, modify the docker-compose.yml:
- Remove `--reload` flag from backend command
- Use `npm run build && npm run start` for frontend
- Add proper environment variables
- Use external database (PostgreSQL recommended)

