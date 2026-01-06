from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import init_db
from .routes import router as reminders_router
from .scheduler import register_scheduler


from fastapi.openapi.utils import get_openapi

def create_app() -> FastAPI:
  app = FastAPI(title=settings.app_name, docs_url="/docs", redoc_url=None)

  # Add CORS middleware
  app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  app.include_router(reminders_router)

  @app.on_event("startup")
  async def startup_event() -> None:
    await init_db()
    register_scheduler(app)

  def custom_openapi():
    if app.openapi_schema:
      return app.openapi_schema
    openapi_schema = get_openapi(
      title=settings.app_name,
      version="1.0.0",
      description="Reminder API with Vapi call integration",
      routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema

  app.openapi = custom_openapi

  return app


app = create_app()
