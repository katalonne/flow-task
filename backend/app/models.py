from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4

from sqlmodel import Field, SQLModel
from sqlalchemy import Column, Index, String


class ReminderStatus(str, Enum):
  scheduled = "scheduled"
  completed = "completed"
  failed = "failed"


class Reminder(SQLModel, table=True):
  __tablename__ = "reminders"
  __table_args__ = (
    Index("ix_reminders_status_scheduled_time", "status", "scheduled_time_utc"),
  )

  id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
  title: str = Field(sa_column=Column(String(128)))
  message: str
  phone_number: str = Field(sa_column=Column(String(32)))
  timezone: str = Field(default="Europe/Bucharest", sa_column=Column(String(64)))
  scheduled_time_utc: datetime
  status: ReminderStatus = Field(default=ReminderStatus.scheduled, index=True)
  created_at: datetime = Field(default_factory=datetime.utcnow)
  updated_at: datetime = Field(default_factory=datetime.utcnow)
  last_run_at: Optional[datetime] = None
  retry_count: int = 0
  call_sid: Optional[str] = None
  failure_reason: Optional[str] = None
