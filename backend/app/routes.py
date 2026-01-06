from __future__ import annotations

from datetime import datetime, timedelta, timezone
from random import randint
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from .db import get_session
from .models import Reminder, ReminderStatus
from .schemas import (
  ReminderCreate,
  ReminderDashboardItem,
  ReminderFilter,
  ReminderResponse,
  ReminderUpdate,
  ReminderListResponse,
)
from .utils import mask_phone_number, normalize_datetime, time_remaining_seconds

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


@router.post("/", response_model=ReminderResponse, status_code=201)
async def create_reminder(form: ReminderCreate, session: AsyncSession = Depends(get_session)) -> ReminderResponse:
  reminder = Reminder(
    title=form.title,
    message=form.message,
    phone_number=form.phone_number,
    scheduled_time_utc=normalize_datetime(form.scheduled_time_utc),
    timezone=form.timezone or "UTC",
  )
  session.add(reminder)
  await session.commit()
  await session.refresh(reminder)
  return _map_response(reminder)


@router.get("/", response_model=ReminderListResponse)
async def list_reminders(
  filters: ReminderFilter = Depends(),
  session: AsyncSession = Depends(get_session),
) -> ReminderListResponse:
  stmt = select(Reminder)
  if filters.status != "all":
    stmt = stmt.where(Reminder.status == ReminderStatus(filters.status))
  if filters.search:
    term = f"%{filters.search.lower()}%"
    stmt = stmt.where(
      (Reminder.title.ilike(term)) | (Reminder.message.ilike(term))
    )
  # Sort by scheduled_time_utc based on sort parameter
  if filters.sort == "ascending":
    stmt = stmt.order_by(Reminder.scheduled_time_utc.asc())
  else:  # "descending" is default
    stmt = stmt.order_by(Reminder.scheduled_time_utc.desc())
  total_offset = (filters.page - 1) * filters.per_page
  stmt = stmt.offset(total_offset).limit(filters.per_page)
  result = (await session.execute(stmt)).scalars().all()

  # Get total count for pagination
  count_stmt = select(func.count(Reminder.id))
  if filters.status != "all":
    count_stmt = count_stmt.where(Reminder.status == ReminderStatus(filters.status))
  if filters.search:
    term = f"%{filters.search.lower()}%"
    count_stmt = count_stmt.where(
      (Reminder.title.ilike(term)) | (Reminder.message.ilike(term))
    )
  total_items = (await session.execute(count_stmt)).scalar_one()

  return ReminderListResponse(
    page=filters.page,
    per_page=filters.per_page,
    total_items=total_items,
    items=[_map_dashboard(item) for item in result],
  )


@router.get("/{reminder_id}", response_model=ReminderResponse)
async def get_reminder(reminder_id: str, session: AsyncSession = Depends(get_session)) -> ReminderResponse:
  reminder = await session.get(Reminder, reminder_id)
  if not reminder:
    raise HTTPException(status_code=404, detail="Reminder not found")
  return _map_response(reminder)


@router.patch("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
  reminder_id: str,
  payload: ReminderUpdate,
  session: AsyncSession = Depends(get_session),
) -> ReminderResponse:
  reminder = await session.get(Reminder, reminder_id)
  if not reminder:
    raise HTTPException(status_code=404, detail="Reminder not found")
  if reminder.status not in (ReminderStatus.scheduled, ReminderStatus.failed):
    raise HTTPException(status_code=400, detail="Only scheduled or failed reminders can be updated")
  update_data = payload.model_dump(exclude_none=True)
  if scheduled := update_data.get("scheduled_time_utc"):
    update_data["scheduled_time_utc"] = normalize_datetime(scheduled)
  for field, value in update_data.items():
    setattr(reminder, field, value)
  reminder.updated_at = datetime.utcnow()
  session.add(reminder)
  await session.commit()
  await session.refresh(reminder)
  return _map_response(reminder)


@router.delete("/all", status_code=204)
async def delete_all_reminders(session: AsyncSession = Depends(get_session)) -> None:
  """Delete all reminders."""
  await session.execute(text("DELETE FROM reminders"))
  await session.commit()


@router.delete("/{reminder_id}", status_code=204)
async def delete_reminder(reminder_id: str, session: AsyncSession = Depends(get_session)) -> None:
  """Delete a single reminder by ID."""
  reminder = await session.get(Reminder, reminder_id)
  if not reminder:
    raise HTTPException(status_code=404, detail="Reminder not found")
  await session.delete(reminder)
  await session.commit()


@router.post("/call-me-in-10-secs", response_model=ReminderResponse)
async def call_me_in_10_secs(phone_number: str, session: AsyncSession = Depends(get_session)) -> ReminderResponse:
    now = datetime.now(timezone.utc)
    scheduled_time_utc = now + timedelta(seconds=10)
    title = f"Random Title {randint(1000, 9999)}"
    message = f"Random Message {randint(1000, 9999)}"
    reminder = Reminder(
        title=title,
        message=message,
        phone_number=phone_number,
        scheduled_time_utc=scheduled_time_utc,
        timezone="UTC",
    )
    session.add(reminder)
    await session.commit()
    await session.refresh(reminder)
    return _map_response(reminder)


def _map_response(reminder: Reminder) -> ReminderResponse:
  return ReminderResponse(
    id=reminder.id,
    title=reminder.title,
    message=reminder.message,
    phone_number=reminder.phone_number,
    masked_phone_number=mask_phone_number(reminder.phone_number),
    scheduled_time_utc=reminder.scheduled_time_utc,
    timezone=reminder.timezone,
    status=reminder.status,
    time_remaining_seconds=time_remaining_seconds(reminder.scheduled_time_utc),
    failure_reason=reminder.failure_reason,
  )


def _map_dashboard(reminder: Reminder) -> ReminderDashboardItem:
  return ReminderDashboardItem(
    id=reminder.id,
    title=reminder.title,
    message=reminder.message,
    timezone=reminder.timezone,
    scheduled_time_utc=reminder.scheduled_time_utc,
    status=reminder.status,
    time_remaining_seconds=time_remaining_seconds(reminder.scheduled_time_utc),
    phone_number=reminder.phone_number,
    failure_reason=reminder.failure_reason,
  )
