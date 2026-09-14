import logging
import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import (
    admin_auth_routes,
    admin_conversation_routes,
    admin_dashboard_routes,
    admin_enquiry_routes,
    admin_lead_routes,
    admin_recovery_routes,
    admin_staff_routes,
    ai_routes,
    enquiry_routes,
    newsletter_routes,
    property_routes,
    search_routes,
    whatsapp_routes,
)
from app.config import get_settings
from app.database import db
from app.utils.logger import configure_logging
from app.utils.rate_limit import RateLimitMiddleware

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await db.connect(settings)
    yield
    await db.disconnect()


app = FastAPI(
    title=settings.app_name,
    debug=settings.app_debug,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(
    RateLimitMiddleware,
    requests_per_minute=settings.rate_limit_per_minute,
    protected_prefixes=(
        f"{settings.api_prefix}/search",
        f"{settings.api_prefix}/properties",
        f"{settings.api_prefix}/collections",
        f"{settings.api_prefix}/masterplan",
        f"{settings.api_prefix}/enquiries",
        f"{settings.api_prefix}/brochure-requests",
        f"{settings.api_prefix}/newsletter/subscribe",
        f"{settings.api_prefix}/newsletter/unsubscribe",
        f"{settings.api_prefix}/consultations",
        f"{settings.api_prefix}/site-visits",
        f"{settings.api_prefix}/commercial-enquiries",
        f"{settings.api_prefix}/admin/login",
        f"{settings.api_prefix}/admin/auth/forgot-password",
        f"{settings.api_prefix}/admin/auth/validate-reset-token",
        f"{settings.api_prefix}/admin/auth/reset-password",
        f"{settings.api_prefix}/admin/auth/recovery-request",
        f"{settings.api_prefix}/ai",
        f"{settings.api_prefix}/webhooks/whatsapp",
    ),
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(
        "request completed",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "elapsed_ms": elapsed_ms,
        },
    )
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": {"code": "http_error", "message": exc.detail}},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.info("request validation failed", extra={"path": request.url.path})
    details = []
    for error in exc.errors():
        safe_error = dict(error)
        ctx = safe_error.get("ctx")
        if isinstance(ctx, dict) and "error" in ctx:
            safe_error["ctx"] = {**ctx, "error": str(ctx["error"])}
        details.append(safe_error)
    return JSONResponse(
        status_code=422,
        content={"success": False, "error": {"code": "validation_error", "message": "Invalid request data", "details": details}},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled application error", extra={"path": request.url.path})
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": {"code": "internal_server_error", "message": "Something went wrong"}},
    )


@app.get(f"{settings.api_prefix}/health", tags=["health"])
async def healthcheck():
    database_connected = await db.healthcheck()
    database_status = "connected" if database_connected else "not_configured"
    if settings.effective_database_url and not database_connected:
        database_status = "unavailable"
    return {
        "success": True,
        "data": {
            "service": settings.app_name,
            "environment": settings.app_env,
            "status": "ok",
            "database": database_status,
        },
    }


@app.get(f"{settings.api_prefix}/ready", tags=["health"])
async def readiness():
    database_connected = await db.healthcheck()
    required_tables = [
        "staff_users",
        "staff_roles",
        "staff_sessions",
        "customers",
        "leads",
        "enquiries",
        "lead_activities",
        "enquiry_reference_sequence",
        "newsletter_subscriptions",
    ]
    required_columns = {
        "customers": {
            "id", "full_name", "email", "phone", "country",
            "preferred_language", "preferred_contact_method",
            "marketing_consent", "privacy_consent",
        },
        "leads": {
            "id", "reference_number", "customer_id", "anonymous_session_id",
            "name", "email", "phone", "property_interest",
            "property_interests", "collection_interests", "bedroom_preference",
            "budget_range", "buying_purpose", "purchase_timeframe", "score",
            "lead_score", "follow_up_status", "lead_status", "source_platform",
            "campaign_name", "utm_source", "utm_medium", "utm_campaign",
            "utm_content", "utm_term", "landing_page", "referral_url",
            "last_activity_at",
        },
        "enquiries": {
            "id", "reference_number", "lead_id", "enquiry_type", "message",
            "preferred_contact_time", "payload", "score", "follow_up_status",
            "notification_status",
        },
        "lead_activities": {
            "id", "lead_id", "reference_number", "activity_type", "summary",
            "campaign", "created_at",
        },
        "enquiry_reference_sequence": {"id"},
    }

    table_status: dict[str, bool] = {}
    column_status: dict[str, bool] = {}
    migration_020_applied = False

    if database_connected:
        for table in required_tables:
            try:
                await db.fetchval(f"SELECT 1 FROM {table} LIMIT 1")
                table_status[table] = True
            except Exception:
                table_status[table] = False

        for table, expected_columns in required_columns.items():
            try:
                rows = await db.fetch(
                    """
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = %s
                    """,
                    table,
                )
                actual_columns = {row["column_name"] for row in rows}
                column_status[table] = expected_columns.issubset(actual_columns)
            except Exception:
                column_status[table] = False

        try:
            migration_020_applied = bool(
                await db.fetchval(
                    "SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE filename = %s)",
                    "020_enquiry_pipeline_compatibility.sql",
                )
            )
        except Exception:
            migration_020_applied = False

    data = {
        "service": settings.app_name,
        "environment": settings.app_env,
        "database": "connected" if database_connected else "unavailable",
        "tables": table_status,
        "enquiry_schema": column_status,
        "migration_020_applied": migration_020_applied,
    }
    production_ready = (
        database_connected
        and all(table_status.values())
        and all(column_status.values())
        and migration_020_applied
    )
    if settings.app_env.strip().lower() == "production" and not production_ready:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": {
                    "code": "service_not_ready",
                    "message": "Database schema is incomplete or migrations are not current",
                },
                "data": data,
            },
        )
    return {"success": True, "data": data}


app.include_router(property_routes.router, prefix=settings.api_prefix)
app.include_router(search_routes.router, prefix=settings.api_prefix)
app.include_router(enquiry_routes.router, prefix=settings.api_prefix)
app.include_router(enquiry_routes.internal_router, prefix=settings.api_prefix)
app.include_router(newsletter_routes.router, prefix=settings.api_prefix)
app.include_router(ai_routes.router, prefix=settings.api_prefix)
app.include_router(whatsapp_routes.router, prefix=settings.api_prefix)
app.include_router(admin_auth_routes.router, prefix=settings.api_prefix)
app.include_router(admin_dashboard_routes.router, prefix=settings.api_prefix)
app.include_router(admin_lead_routes.router, prefix=settings.api_prefix)
app.include_router(admin_enquiry_routes.router, prefix=settings.api_prefix)
app.include_router(admin_conversation_routes.router, prefix=settings.api_prefix)
app.include_router(admin_staff_routes.router, prefix=settings.api_prefix)
app.include_router(admin_recovery_routes.router, prefix=settings.api_prefix)
app.include_router(newsletter_routes.admin_router, prefix=settings.api_prefix)
