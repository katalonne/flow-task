from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import Query
from pydantic import BaseModel, constr, root_validator, validator

from .constants import SUPPORTED_TIMEZONES_SET
from .models import ReminderStatus
from .utils import mask_phone_number, normalize_datetime, parse_phone


def validate_timezone(tz: Optional[str]) -> Optional[str]:
  """Validate that the timezone string is in the supported timezones list."""
  if tz is None:
    return None
  if tz not in SUPPORTED_TIMEZONES_SET:
    raise ValueError(f"Unsupported timezone: {tz}. Must be one of the supported IANA timezones.")
  return tz


class ReminderCreate(BaseModel):
  title: constr(strip_whitespace=True, min_length=1, max_length=128)
  message: constr(strip_whitespace=True, min_length=1)
  phone_number: str
  scheduled_time_utc: datetime
  timezone: Optional[str] = None

  @validator("phone_number")
  def normalize_phone(cls, value: str) -> str:
    return parse_phone(value)

  @validator("timezone")
  def validate_tz(cls, value: Optional[str]) -> Optional[str]:
    return validate_timezone(value)

  @validator("scheduled_time_utc")
  def future_time(cls, value: datetime) -> datetime:
    now = datetime.now(timezone.utc)
    # If value is naive, treat as UTC
    if value.tzinfo is None:
      value = value.replace(tzinfo=timezone.utc)
    if value <= now:
      raise ValueError("scheduled_time_utc must be in the future")
    return value


class ReminderUpdate(BaseModel):
  title: Optional[constr(strip_whitespace=True, min_length=1, max_length=128)] = None
  message: Optional[constr(strip_whitespace=True, min_length=1)] = None
  phone_number: Optional[str] = None
  scheduled_time_utc: Optional[datetime] = None
  timezone: Optional[str] = None

  @validator("phone_number", pre=True, always=False)
  def normalize_phone(cls, value: Optional[str]) -> Optional[str]:
    if value is None:
      return None
    return parse_phone(value)

  @validator("timezone", pre=True, always=False)
  def validate_tz(cls, value: Optional[str]) -> Optional[str]:
    return validate_timezone(value)

  @validator("scheduled_time_utc", pre=True, always=False)
  def future_time(cls, value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
      return None
    now = datetime.now(timezone.utc)
    # If value is naive, treat as UTC
    if value.tzinfo is None:
      value = value.replace(tzinfo=timezone.utc)
    if value <= now:
      raise ValueError("scheduled_time_utc must be in the future")
    return value


class ReminderResponse(BaseModel):
  id: str
  title: str
  message: str
  phone_number: str
  masked_phone_number: str
  scheduled_time_utc: datetime
  timezone: str
  status: ReminderStatus
  time_remaining_seconds: float
  failure_reason: Optional[str]

  class Config:
    orm_mode = True


class ReminderFilter(BaseModel):
  status: Literal["all", "scheduled", "completed", "failed"] = Query("all")
  search: Optional[str] = Query(None, description="Search term for title or message")
  sort: Literal["ascending", "descending"] = Query("descending", description="Sort by scheduled_time_utc in ascending or descending order")
  page: int = Query(1, ge=1)
  per_page: int = Query(25, ge=1, le=100)


class ReminderDashboardItem(BaseModel):
  id: str
  title: str
  message: str
  timezone: str
  scheduled_time_utc: datetime
  status: ReminderStatus
  time_remaining_seconds: float
  phone_number: str
  failure_reason: Optional[str]

  class Config:
    orm_mode = True


class ReminderListResponse(BaseModel):
  page: int
  per_page: int
  total_items: int
  items: list[ReminderDashboardItem]

  class Config:
    orm_mode = True
