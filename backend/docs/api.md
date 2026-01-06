# Reminder API Design

## FastAPI Application Structure

- `backend/app/main.py`
  - Initializes FastAPI instance, includes routers, events for startup/shutdown, and attaches middleware (CORS, logging).
- `backend/app/config.py`
  - Loads environment variables (`DATABASE_URL`, `VAPI_*`, `TWILIO_PHONE_NUMBER`, scheduler interval, and retry counts) via `python-dotenv`.
- `backend/app/models/reminder.py`
  - SQLModel `Reminder` class with fields from the schema and SQLAlchemy/SQLModel metadata (indexes, default values).
- `backend/app/schemas.py`
  - Pydantic models for request/response validation (`ReminderCreate`, `ReminderUpdate`, `ReminderResponse`, `ReminderFilter`).
- `backend/app/db.py`
  - Session and engine initialization, SQLite connection string from config, helper `get_session` dependency with `async_sessionmaker`.
- `backend/app/routes/reminders.py`
  - Router with CRUD endpoints and filters described below. Uses dependency injection for session and validation utilities.
- `backend/app/services/scheduler.py`
  - APScheduler job definition that queries due reminders, triggers Vapi calls, and updates statuses.
- `backend/app/services/vapi_client.py`
  - HTTPX client encapsulating Vapi-specific payload, retries, and response parsing.
- `backend/app/utils.py`
  - Helpers: timezone parsing, phone validation/masking, countdown calculation, search predicates, status formatting.
- `backend/app/tasks.py`
  - Startup/shutdown hooks for scheduler, including graceful stop for APScheduler.

## Request/Response Models

- `ReminderCreate`
  ```python
  class ReminderCreate(BaseModel):
      title: str
      message: str
      phone_number: str
      scheduled_time: datetime
      timezone: str | None
  ```
  - Validates message non-empty; phone parsed via `phonenumbers`; timezone defaults to configured base; scheduled time converted to UTC.
- `ReminderUpdate` allows partial updates but enforces future `scheduled_time` when present.
- `ReminderResponse` expands stored reminder with computed fields:
  - `time_remaining: timedelta` / humanized string
  - `masked_phone_number`
  - `status`

## Endpoints

1. `POST /api/reminders`
   - Body: `ReminderCreate`
   - Response: `201 Created` with `ReminderResponse`
2. `GET /api/reminders`
   - Query params: `status` (`scheduled`, `completed`, `failed`, or `all`), `search`, `page`, `per_page`
   - Returns paginated list sorted by `scheduled_time` ascending.
3. `GET /api/reminders/{id}`
   - Returns `ReminderResponse`
4. `PATCH /api/reminders/{id}`
   - Applies partial updates.
5. `DELETE /api/reminders/{id}`
   - Deletes record, returns `204 No Content`

All endpoints validate timezone-aware `scheduled_time` by converting to UTC using `ZoneInfo` and ensuring it's in the future relative to the user-supplied timezone.

## Validation Rules

- Phone numbers normalized via [`phonenumbers.parse()`](https://pypi.org/project/phonenumbers/), storing E.164.
- Timezone inferred from request (Accept-Timezone header or frontend selection); fallback to `DEFAULT_TIMEZONE`.
- `scheduled_time` must be > `now` (per timezone-aware comparison); otherwise respond `HTTPException(status_code=400, detail="scheduled_time must be in the future")`.
- Searches use `ILIKE`/`LIKE` with `%` for title and message. For SQLite, use `LOWER()`.

## Dashboard-friendly Fields

- `status`: string enumeration to render badges.
- `humanized_time`: e.g., `Tuesday, Jan 5, 2026 @ 2:30 PM EET`.
- `time_remaining_seconds`: computed for countdown timers.
- `masked_phone_number`: e.g., `+1415****2671`.
- `failure_reason`: surfaced for failed statuses.

## Filtering & Search Flow

1. Validate `status` param and translate to SQL predicate.
2. For `search`, run `OR` predicate on `title` and `message` using lowercase comparison.
3. Support pagination by applying `limit`/`offset`; default `per_page=25`.

## Scheduler/Worker Outline

*(Move to scheduler doc if needed, but we will describe high level later.)*
