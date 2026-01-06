from __future__ import annotations

from datetime import datetime, timedelta, timezone

import phonenumbers
from fastapi import HTTPException

from .config import settings


def parse_phone(value: str) -> str:
    try:
        parsed = phonenumbers.parse(value, None)
    except phonenumbers.NumberParseException as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not phonenumbers.is_valid_number(parsed):
        raise HTTPException(status_code=400, detail="Invalid phone number")
    return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)


def mask_phone_number(value: str) -> str:
    clean = value.lstrip("+")
    if len(clean) <= 6:
        return value
    return f"{value[:3]}{'*' * 4}{value[-3:]}"


def ensure_aware_utc(dt: datetime) -> datetime:
    """Ensure a datetime is timezone-aware and in UTC."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def normalize_datetime(value: datetime) -> datetime:
    return ensure_aware_utc(value)


def time_remaining_seconds(scheduled: datetime) -> float:
    now = datetime.now(timezone.utc)
    scheduled = ensure_aware_utc(scheduled)
    remaining = scheduled - now
    return max(remaining.total_seconds(), 0)


def human_readable_datetime(value: datetime) -> str:
    return value.astimezone().strftime("%A, %b %-d %Y @ %I:%M %p %Z")
