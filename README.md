<h2 align="center">Reminder Voice Calls</h2>

# Requirements (without Docker)
- Docker
- Python 3.11
- Poetry
- node >=20
- npm 10.9.2

# How to run (with docker)
1) Create `.env` file from `.env.example` in the root directory. `cp .env.example .env`
2) Get your `VAPI_API_KEY`, `PHONE_NUMBER_ID` and put them in `.env` (root directory).
3) Run `docker compose up` from the root directory.
4) The app will be available at `http://localhost:3000`
5) The API docs will be available at `http://localhost:8000/docs`

# How to run without docker
1) Create `.env` file from `backend/.env.example` in the `backend` directory. `cp backend/.env.example backend/.env`
2) Get your `VAPI_API_KEY`, `PHONE_NUMBER_ID` and put them in `backend/.env`.
3) Run `poetry install` from the `backend` directory.
4) Run `uvicorn app.main:app --reload` from the `backend` directory.
5) Run `npm install` from the `frontend` directory.
6) Run `npm run dev` from the `frontend` directory.
7) The app will be available at `http://localhost:3000`
8) The API docs will be available at `http://localhost:8000/docs`

# How scheduling works (what triggers reminders)
1) A scheduler runs every minute (configurable via env `SCHEDULER_INTERVAL_SECONDS`). `10` seconds for dev.
2) The scheduler queries the database for reminders that are due (scheduled_time_utc <= now_utc) and have not failed (retry_count < MAX_RETRY_ATTEMPTS).
3) For each reminder, it makes a call via Vapi.ai.

# How to test the call workflow quickly
1) Run the app as described above. 
2) Go to `http://localhost:3000/`
3) Click "Quick Create" and fill in the form. 
4) The reminder will be scheduled to call you in maximum 1 minute. 
5) You can check the status of the reminder in the "Scheduled" tab. 

# How to run tests
1) Run `npm install` from the `frontend` directory.
2) Run `npm run e2e` from the `frontend` directory for the **end to end tests**.
3) Run `npm run test` from the `frontend` directory for the **unit tests**.

# Project Details
1) The frontend is built with Next.js 16 and TypeScript.
2) For styling we use TailwindCSS and RadixUI for component primitives.
3) For requests we use axios and tanstack/react-query for data fetching.
4) Custom hooks for state management and side effects.
5) Custom styled components for consistency.
6) The backend is built with FastAPI and Python 3.11.
7) The database is SQLite for now.
8) The scheduler is built with APScheduler and runs in a separate thread.
9) Vapi.ai is used to make the voice calls.
10) Twilio is used to make the phone calls. (Added a Twillio phone number in vapi.ai)


# Frontend Goals
- [x] Visual quality, spacing, typography, component consistency
- [x] Form experience, empty/loading/error states, responsiveness
- [x] Component design system quality
- [x] Code clarity, structure, reusability
- [x] Data fetching/state management approach with TanStack React Query
- [x] Dashboard filtering, sorting, pagination
- [x] End to end tests
- [x] unit tests

# Backend goals
- [x] Reminder scheduling reliability
- [x] Status updates correct
- [x] Vapi call trigger works
- [x] Clear configuration + README
- [x] Good error handling when call fails

# Backend Database Schema

## Reminders Table

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| `id` | UUID (String) | Primary Key | Generated via `uuid4()` | Unique identifier for each reminder |
| `title` | String(128) | Not Null, Indexed | - | Short reminder title |
| `message` | Text | Not Null | - | Reminder message to be spoken |
| `phone_number` | String(32) | Not Null | - | Phone number in E.164 format |
| `timezone` | String(64) | Not Null | "Europe/Bucharest" | IANA timezone (e.g., Europe/London) |
| `scheduled_time_utc` | DateTime | Not Null, Indexed | - | Scheduled time in UTC |
| `status` | Enum | Not Null, Indexed | "scheduled" | One of: `scheduled`, `completed`, `failed` |
| `created_at` | DateTime | Not Null | Current UTC time | Timestamp when reminder was created |
| `updated_at` | DateTime | Not Null | Current UTC time | Timestamp when reminder was last updated |
| `last_run_at` | DateTime | Nullable | NULL | Timestamp of last attempted call |
| `retry_count` | Integer | Not Null | 0 | Number of retry attempts |
| `call_sid` | String(64) | Nullable | NULL | Twilio call identifier |
| `failure_reason` | Text | Nullable | NULL | Error description if call failed |

## Indexes

- **Composite Index**: `(status, scheduled_time_utc)` - Optimizes scheduler queries
- **Single Index**: `status` - For filtering reminders by status
- **Single Index**: `title` - For search functionality

## Enums

### ReminderStatus
- `scheduled` - Reminder is waiting to be triggered
- `completed` - Reminder call was successfully completed
- `failed` - Reminder call failed after max retries

## Validation Rules

- `title`: 1-128 characters, whitespace trimmed
- `message`: Non-empty, whitespace trimmed
- `phone_number`: Valid E.164 format (validated via phonenumbers library)
- `timezone`: Must be a valid IANA timezone
- `scheduled_time_utc`: Must be a future datetime in UTC
- `retry_count`: Incremented on each failed attempt (max: `MAX_RETRY_ATTEMPTS` from config)