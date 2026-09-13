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
        "newsletter_subscriptions",
    ]
    table_status: dict[str, bool] = {}
    if database_connected:
        for table in required_tables:
            try:
                await db.fetchval(f"SELECT 1 FROM {table} LIMIT 1")
                table_status[table] = True
            except Exception:
                table_status[table] = False
    return {
        "success": True,
        "data": {
            "service": settings.app_name,
            "environment": settings.app_env,
            "database": "connected" if database_connected else "unavailable",
            "tables": table_status,
        },
    }


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
