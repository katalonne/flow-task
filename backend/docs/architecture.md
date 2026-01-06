# Reminder Backend Architecture

## Overview

The FastAPI service will live inside `backend/` and expose a RESTful API so the frontend can manage reminders, view a dashboard of upcoming items, and let a scheduler trigger outbound calls through Vapi when a reminder becomes due.

Key components:

- FastAPI + SQLModel for request handling and persistence
- SQLite for local storage (migratable to Postgres later)
- APScheduler-driven worker for polling and triggering reminders
- Vapi.ai integration to speak the reminder message via Twilio phone number
- Validation utilities (time zone handling, future-dated reminders, phone numbers)

## Database Schema

### Table: `reminders`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `UUID` | Primary key, generated via `uuid4()` for distributed safety. |
| `title` | `String(128)` | Short reminder title, indexed for search. |
| `message` | `Text` | Required reminder payload that will be spoken. |
| `phone_number` | `String(32)` | Stored in E.164 format after validation by `phonenumbers`. |
| `timezone` | `String(64)` | IANA tz (e.g., `Europe/Bucharest`). Auto-detected from request but overridable via dropdown. |
| `scheduled_time` | `DateTime(timezone=True)` | Normalized to UTC when stored; input parsed with provided timezone. Indexed for timely polling. |
| `status` | `Enum('scheduled','completed','failed')` | Default `scheduled`. Filtered by dashboard. Indexed. |
| `created_at` / `updated_at` | `DateTime(timezone=True)` | Auto-managed audit columns. |
| `last_run_at` | `DateTime(timezone=True)` | Timestamp of last attempted call. |
| `retry_count` | `Integer` | Tracks how many times we attempted the call (used with tenacity). |
| `call_sid` | `String(64)` | Twilio call identifier (if available). |
| `failure_reason` | `Text` | Optional text describing the last error for dashboard debugging. |

Indexes:

- Composite index on `(status, scheduled_time)` to accelerate scheduler queries.
- Full-text or trigram index on `title` and `message` (if migrating to Postgres later) for search.

Validation rules:

- `scheduled_time` must be in the future relative to now-with-zone conversion.
- `phone_number` must parse via [`phonenumbers.parse()`](https://github.com/daviddrysdale/python-phonenumbers) and be valid (E.164 normalized). Store original fallback if parsing fails.
- `message` and `title` are required; `title` trimmed to 128 characters.
- `timezone` defaults to detected zone (using headers or IP-based heuristics) but frontend can override.

## API Surface

### Models

- `ReminderCreate`: `{title, message, phone_number, scheduled_time, timezone?}`
- `ReminderUpdate`: partial update for `{title?, message?, phone_number?, scheduled_time?, timezone?}`
- `ReminderOut`: includes status, time remaining (computed), masked phone number, and `next_action_time`.

### Endpoints

1. `POST /reminders`
   - Creates a reminder after validating inputs.
   - Normalizes `scheduled_time` to UTC using `zoneinfo.ZoneInfo(timezone)`.
2. `GET /reminders`
   - Returns paginated/sorted reminders.
   - Query params: `status` (All/Scheduled/Completed/Failed), `search`, `page`, `per_page`.
   - Includes computed fields: human-readable time, countdown (`scheduled_time - now`), and masked phone (e.g., `+1415****2671`).
3. `GET /reminders/{id}`
   - Returns single reminder detail for edit screening.
4. `PATCH /reminders/{id}`
   - Allows rescheduling, editing title/message/phone/timezone if status is `scheduled`. Validations re-run.
5. `DELETE /reminders/{id}`
   - Removes reminders and any pending scheduler locks (soft delete not required for MVP).

Each endpoint returns standard HTTP codes (201, 200, 400, 404) and uses FastAPI `HTTPException` with detail messages.

## Scheduler / Worker Flow

1. APScheduler job runs every minute (configurable via env `SCHEDULER_INTERVAL_SECONDS`).
2. Job queries `reminders` where `status == 'scheduled'` and `scheduled_time <= now_utc + leeway` (e.g., 30 seconds) and `retry_count < MAX_RETRIES`.
3. For each due reminder:
   - Mark it as `in_progress` temporarily (optimistic locking using `sqlite` `rowid` + version or session merge) to avoid duplicate processing.
   - Use [`httpx.AsyncClient`](https://www.python-httpx.org/) to POST to Vapi endpoint with Twilio `from` number, `to` number, and script message.
   - Wrap HTTP call with [`tenacity.retry`](https://tenacity.readthedocs.io/) for transient failures, using exponential backoff.
   - On success, store `call_sid` and set `status = 'completed'`, `last_run_at = now`, `failure_reason = NULL`.
   - On failure after retries, store `failure_reason`, `status = 'failed'`, and optionally schedule a notification.

APScheduler uses the FastAPI `startup` event to begin its background thread/process using `AsyncIOScheduler`. The controller injects the DB session via `Depends(get_session)` and runs queries inside `async with` contexts.

## Vapi & Twilio Integration

- Environment variables (via `.env` read by `python-dotenv`): `VAPI_API_KEY`, `TWILIO_PHONE_NUMBER`, `VAPI_VOICE`, `CALL_TIMEOUT_SECONDS`.
- The scheduler constructs payload:
  ```json
  {
    "to": "+14155552671",
    "from": "+12025550123",
    "voice": "alloy",
    "message": "Hi, this is your reminder: ..."
  }
  ```
- Vapi response parsed for `callSid`. `Tenacity` retries on network/timeouts.
- On `503`/`429`, the scheduler waits before retrying.
- Fallback: If Vapi fails permanently, the reminder is flagged `failed` and the dashboard shows failures.

## Dashboard Considerations

- Frontend fetches `GET /reminders` to populate tabs (All/Scheduled/Completed/Failed).
- API provides `status` badges via enum values.
- Empty states respond with `{data: []}` and frontend shows stylized placeholder cards.
- Search filters `title`/`message` via SQL `LIKE` (case-insensitive).
- `time_remaining` computed server-side as `max((scheduled_time - now).total_seconds(), 0)` and humanized in the frontend.
- Mask phone numbers by showing `front=3 digits` + `****` + `last 3 digits` but keep full number in API so scheduler can use it.

## Configuration & Utilities

- `.env` keys:
  - `DATABASE_URL=sqlite:///./reminders.db`
  - `SCHEDULER_INTERVAL_SECONDS=60`
  - `MAX_RETRY_ATTEMPTS=3`
  - `DEFAULT_TIMEZONE=Europe/Bucharest`
  - `VAPI_API_KEY=...`
  - `TWILIO_PHONE_NUMBER=+12025550123`
- Utility functions:
  - `parse_and_validate_phone(number: str) -> str`
  - `normalize_to_utc(dt: str, tz: str) -> datetime`
  - `mask_phone(number: str) -> str`
  - `current_timezone(accept_timezone_header: str | None) -> str`
- Logging: Structured logs for scheduler runs, success/failure reasons, and API validation errors.

## Next Steps

1. Scaffold FastAPI app with routers, SQLModel models, and dependency overrides for session management.
2. Implement scheduler job and background startup/shutdown hooks.
3. Wire Vapi client with retries and integrate Twilio config.
4. Provide documentation for environment setup and running scheduler in development vs production.
