# Running the Reminder Service

## Setup

1. Copy `.env.example` to `.env` and fill in actual secrets for Vapi and Twilio.
2. Optionally adjust `DATABASE_URL` if you move to Postgres later (SQLModel works with SQLAlchemy URLs).
3. Install dependencies via Poetry or pip:
   ```bash
   cd backend
   poetry install
   # or
   pip install -r requirements.txt
   ```

## Development

- Start the app with Uvicorn:
  ```bash
  uvicorn app.main:app --reload
  ```
- The API will be available at `http://localhost:8000/api/reminders` with automatic docs at `/docs`.
- Scheduler runs inside FastAPI's startup event and polls reminders every `SCHEDULER_INTERVAL_SECONDS`.

## Scheduler & Call Processing

- APScheduler is configured via `backend/app/scheduler.py` to execute jobs in UTC.
- Each scheduled reminder triggers a Vapi call; successes mark the reminder `completed`, while repeated failures after `MAX_RETRY_ATTEMPTS` mark `failed`.
- For testing, use Vapi's sandbox and Twilio trial number; ensure `TWILIO_PHONE_NUMBER` is verified in Twilio.

## Production Considerations

- Run under an ASGI server (Uvicorn/Gunicorn with uvicorn workers) and ensure the `.env` file is restricted.
- Schedule periodic backups for `reminders.db` or switch `DATABASE_URL` to managed Postgres and run migrations.
- Monitor scheduler logs and surfaced `failure_reason` field for reliability issues.
