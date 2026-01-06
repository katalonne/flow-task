# Configuration & Utility Notes

## Environment Variables

- `DATABASE_URL`: SQLite connection string (e.g., `sqlite+aiosqlite:///./reminders.db`).
- `DEFAULT_TIMEZONE`: Default tz (Europe/Bucharest). Used when the client cannot detect timezone.
- `SCHEDULER_INTERVAL_SECONDS`: Interval between reminder polls (default `60`).
- `MAX_RETRY_ATTEMPTS`: Maximum retries before marking reminder `failed` (default `3`).
- `VAPI_API_KEY`: Key for authenticating with Vapi.ai.
- `VAPI_VOICE`: Voice name (e.g., `bella`).
- `TWILIO_PHONE_NUMBER`: Bottle neck for outbound call.
- `VAPI_ENDPOINT`: Optional override of base endpoint (default `https://api.vapi.ai/v1/calls`).

Load via `python-dotenv` early in `app/config.py` and expose via `pydantic.BaseSettings`.

## Utilities

1. `parse_phone_number(value: str) -> str`
   - Uses `phonenumbers.parse` with default `None` region, re-formats with `format_number(..., PhoneNumberFormat.E164)`.
   - Raises `ValueError` on invalid input.
2. `mask_phone_number(value: str) -> str`
   - Preserves leading `+` and first three digits, replaces middle digits with `****`, keeps last two digits.
3. `normalize_datetime(dt: datetime, tz: str) -> datetime`
   - Uses `ZoneInfo(tz)` to localize naive inputs and converts to UTC; ensures outcome > now.
4. `compute_time_remaining(scheduled_time: datetime) -> timedelta`
   - Returns `max(scheduled_time - datetime.now(tz=timezone.utc), timedelta(seconds=0))`.
5. `detect_timezone(request: Request) -> str`
   - Checks `Accept-Timezone` header; fallbacks to `DEFAULT_TIMEZONE`.

## Logging & Masking

- Use `structlog`/`logging` for scheduler and API events.
- Log masked phone in API responses but store full sanitized phone for scheduler.
