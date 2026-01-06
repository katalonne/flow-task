from __future__ import annotations

from typing import Any

from vapi import Vapi

from .config import settings


class VapiClient:
  def __init__(self) -> None:
    self._client = Vapi(token=settings.vapi_api_key)

  def call_reminder(self, to: str, content: str) -> dict[str, Any]:
    payload: dict[str, Any] = {
      "phone_number_id": settings.phone_number_id,
      "customer": {"number": to},
      "assistant": {
        "first_message": content,
        "model": {"provider": "openai", "model": "gpt-4o-mini"},
        "voice": {"provider": "11labs", "voice_id": "paula"},
      },
    }
    call = self._client.calls.create(**payload)
    return call

  async def close(self) -> None:
    # SDK uses httpx under the hood; no explicit close needed
    pass
