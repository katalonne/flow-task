from __future__ import annotations

from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .db import async_session
from .models import Reminder, ReminderStatus
from .vapi import VapiClient


scheduler = AsyncIOScheduler(timezone=timezone.utc)
client = VapiClient()


def register_scheduler(app: FastAPI) -> None:
  async def run_job() -> None:
    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    async with async_session() as session:
      stmt = select(Reminder).where(
        Reminder.status == ReminderStatus.scheduled,
        Reminder.scheduled_time_utc <= now,
      )
      result = await session.execute(stmt)
      reminders = result.scalars().all()
      for reminder in reminders:
        await _process_reminder(session, reminder, client)

  scheduler.add_job(run_job, "interval", seconds=settings.scheduler_interval_seconds)

  @app.on_event("startup")
  async def start_scheduler() -> None:
    if not scheduler.running:
      scheduler.start()

  @app.on_event("shutdown")
  async def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
    await client.close()


async def _process_reminder(session: AsyncSession, reminder: Reminder, client: VapiClient) -> None:
  payload = f"Reminder titled {reminder.title}: {reminder.message}."
  try:
    call = client.call_reminder(reminder.phone_number, payload)
    call_sid = getattr(call, "id", None) or getattr(call, "call_id", None) or str(call)
    await session.execute(
      update(Reminder)
      .where(Reminder.id == reminder.id)
      .values(
        status=ReminderStatus.completed,
        last_run_at=datetime.utcnow().replace(tzinfo=timezone.utc),
        failure_reason=None,
        call_sid=call_sid,
        retry_count=reminder.retry_count + 1,
      )
    )
  except Exception as exc:
    await session.execute(
      update(Reminder)
      .where(Reminder.id == reminder.id)
      .values(
        status=ReminderStatus.failed if reminder.retry_count + 1 >= settings.max_retry_attempts else ReminderStatus.scheduled,
        last_run_at=datetime.utcnow().replace(tzinfo=timezone.utc),
        failure_reason=str(exc),
        retry_count=reminder.retry_count + 1,
      )
    )
  finally:
    await session.commit()
