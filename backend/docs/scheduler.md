# Scheduler and Vapi Integration

## Job Definition

- APScheduler's `AsyncIOScheduler` runs a job every `SCHEDULER_INTERVAL_SECONDS` (default: 60).
- Job function:
  1. Open an async database session.
  2. Query `reminders` where `status == 'scheduled'`, `retry_count < MAX_RETRY_ATTEMPTS`, and `scheduled_time <= now_utc + poll_window`.
  3. Acquire a lightweight lock per reminder using an `already_processing` set or optimistic update to mark `status = 'scheduled'` but `last_run_at` is epoch; this avoids concurrency issues when the scheduler is running in multi-instance setups.
  4. For each reminder, call Vapi via `VapiClient.call_reminder()`.
  5. On success: set `status = 'completed'`, `call_sid`, `failure_reason = None`, `last_run_at = now_utc`, increment `retry_count`.
  6. On failure: increment `retry_count`, set `failure_reason`, `last_run_at = now_utc`, and if `retry_count >= MAX_RETRY_ATTEMPTS`, set `status = 'failed'`.

## Vapi Client

- Singleton `httpx.AsyncClient` created on startup with default headers:
  - `Authorization: Bearer {VAPI_API_KEY}`
  - `Content-Type: application/json`
- POST payload includes:
  ```json
  {
    "to": "{reminder.phone_number}",
    "from": "{TWILIO_PHONE_NUMBER}",
    "voice": "{VAPI_VOICE}",
    "content": {
       "type": "voice",
       "text": "{reminder.message}"
    }
  }
  ```
- Response handled for `200`/`202` success. Extract `callSid` and use for logging.

## Retry Strategy

- Use `tenacity.AsyncRetrying` with:
  - `wait=wait_exponential(multiplier=1, min=2, max=30)`
  - `stop=stop_after_attempt(MAX_RETRY_ATTEMPTS)`
  - `retry=retry_if_exception_type(httpx.TransportError)`
- On `httpx.HTTPStatusError` with status 4xx or 5xx, stop retries if permanent (4xx except 429) and mark `failed`.

## Background Task Lifecycle

- `app.on_event("startup")`:
  - Create the scheduler, add the job, start it.
  - Initialize the database (create tables if missing).
- `app.on_event("shutdown")`:
  - Shut down the scheduler gracefully.
  - Close HTTP clients.

## Dashboard Feedback

- Scheduler updates `status` and `failure_reason`, which the API surfaces so the frontend can show badges and error reasons.
- Completed reminders remain in the dashboard for audit but can be filtered out by status.
