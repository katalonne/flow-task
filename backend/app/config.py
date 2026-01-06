from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings

# Resolve .env path relative to this file's location (backend/.env)
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
  app_name: str = "Reminder Service"
  database_url: str
  scheduler_interval_seconds: int
  max_retry_attempts: int
  default_timezone: str

  vapi_api_key: str
  phone_number_id: str

  detect_timezone_header: str = "Accept-Timezone"

  class Config:
    env_file = _ENV_FILE
    env_file_encoding = "utf-8"


settings = Settings()
