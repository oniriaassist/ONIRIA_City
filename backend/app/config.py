from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import parse_qsl, quote, unquote, urlencode, urlparse, urlunparse

from pydantic import EmailStr, TypeAdapter, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ENV_FILE = BACKEND_ROOT / ".env"

POSTGRES_SCHEMES = {
    "postgres",
    "postgresql",
    "postgresql+asyncpg",
}

email_adapter = TypeAdapter(EmailStr)


class Settings(BaseSettings):
    # Application
    app_name: str = "Roho Backend"
    app_env: str = "local"
    app_debug: bool = False
    api_prefix: str = "/api"

    # Frontend and CORS
    cors_origins: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )
    frontend_url: str = "http://localhost:3000"

    # PostgreSQL / Supabase
    database_url: str | None = None
    postgres_host: str | None = None
    postgres_port: int = 5432
    postgres_database: str | None = None
    postgres_user: str | None = None
    postgres_password: str | None = None

    # Database pool
    database_min_size: int = 1
    database_max_size: int = 5

    # Logging and limits
    log_level: str = "INFO"
    rate_limit_per_minute: int = 120

    # WhatsApp
    whatsapp_verify_token: str = "oniria-demo-verify-token"
    whatsapp_app_secret: str | None = None
    whatsapp_access_token: str | None = None
    whatsapp_phone_number_id: str | None = None
    whatsapp_graph_version: str = "v23.0"
    whatsapp_brochure_template_name: str | None = None
    whatsapp_brochure_template_language: str = "en"

    # Email
    mail_provider: str | None = None
    resend_api_key: str | None = None
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = False
    smtp_starttls: bool = True
    smtp_timeout_seconds: int = 10
    mail_from: str | None = None
    mail_from_name: str = "Roho"
    sales_notification_email: str | None = None
    sales_notification_emails: str | None = None
    reply_to_email: str | None = None

    # Approved brochure asset
    brochure_pdf_file: str = "app/assets/ONIRIA_City_Brochure.pdf"

    # Initial administrator
    oniria_admin_full_name: str | None = None
    oniria_admin_email: str | None = None
    oniria_admin_password: str | None = None
    oniria_admin_password_confirm: str | None = None
    oniria_admin_update_password: bool = False

    # Session cookies
    session_cookie_secure: bool = False
    session_cookie_samesite: Literal[
        "lax",
        "strict",
        "none",
    ] = "lax"
    session_cookie_domain: str | None = None

    model_config = SettingsConfigDict(
        env_file=BACKEND_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        env_ignore_empty=True,
    )

    @field_validator("api_prefix")
    @classmethod
    def validate_api_prefix(cls, value: str) -> str:
        value = value.strip()

        if not value.startswith("/"):
            raise ValueError("API_PREFIX must start with /")

        return value.rstrip("/") or "/api"

    @field_validator("database_url", mode="before")
    @classmethod
    def empty_database_url_is_none(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = str(value)

        if value != value.strip():
            raise ValueError(
                "DATABASE_URL must not contain leading or trailing spaces"
            )

        value = value.strip()

        if not value or value.startswith("#"):
            return None

        return value

    @field_validator(
        "postgres_host",
        "postgres_database",
        "postgres_user",
        "postgres_password",
        "mail_provider",
        "resend_api_key",
        "smtp_host",
        "smtp_username",
        "smtp_password",
        "mail_from",
        "sales_notification_email",
        "sales_notification_emails",
        "reply_to_email",
        "whatsapp_access_token",
        "whatsapp_phone_number_id",
        "whatsapp_brochure_template_name",
        "brochure_pdf_file",
        "oniria_admin_full_name",
        "oniria_admin_email",
        "oniria_admin_password",
        "oniria_admin_password_confirm",
        mode="before",
    )
    @classmethod
    def reject_surrounding_spaces(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = str(value)

        if value != value.strip():
            raise ValueError(
                "Environment values must not contain "
                "leading or trailing spaces"
            )

        return value or None

    @field_validator("database_url")
    @classmethod
    def validate_database_url_scheme(
        cls,
        value: str | None,
    ) -> str | None:
        if not value:
            return None

        parsed = urlparse(value)

        if parsed.scheme not in POSTGRES_SCHEMES:
            raise ValueError(
                "DATABASE_URL must use postgresql://, "
                "postgres://, or postgresql+asyncpg://"
            )

        if not parsed.hostname:
            raise ValueError(
                "DATABASE_URL must include a hostname"
            )

        if not parsed.path.strip("/"):
            raise ValueError(
                "DATABASE_URL must include a database name"
            )

        return value

    @field_validator(
        "session_cookie_domain",
        mode="before",
    )
    @classmethod
    def empty_cookie_domain_is_none(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = str(value).strip()

        return value or None

    @field_validator(
        "database_min_size",
        "database_max_size",
    )
    @classmethod
    def validate_positive_pool_sizes(
        cls,
        value: int,
    ) -> int:
        if value < 1:
            raise ValueError(
                "Database pool sizes must be at least 1"
            )

        return value

    @field_validator("postgres_port")
    @classmethod
    def validate_postgres_port(
        cls,
        value: int,
    ) -> int:
        if value < 1 or value > 65535:
            raise ValueError(
                "POSTGRES_PORT must be between 1 and 65535"
            )

        return value

    @field_validator("smtp_port")
    @classmethod
    def validate_smtp_port(
        cls,
        value: int,
    ) -> int:
        if value < 1 or value > 65535:
            raise ValueError(
                "SMTP_PORT must be between 1 and 65535"
            )

        return value

    @field_validator("smtp_timeout_seconds")
    @classmethod
    def validate_smtp_timeout(
        cls,
        value: int,
    ) -> int:
        if value < 1:
            raise ValueError(
                "SMTP_TIMEOUT_SECONDS must be at least 1"
            )

        return value

    @model_validator(mode="after")
    def validate_environment_consistency(
        self,
    ) -> "Settings":
        if self.database_max_size < self.database_min_size:
            raise ValueError(
                "DATABASE_MAX_SIZE must be greater than or equal "
                "to DATABASE_MIN_SIZE"
            )

        if self.app_env.strip().lower() == "production":
            if self.app_debug:
                raise ValueError("APP_DEBUG must be false in production")
            if not self.effective_database_url:
                raise ValueError("A PostgreSQL DATABASE_URL is required in production")
            if not self.session_cookie_secure:
                raise ValueError("SESSION_COOKIE_SECURE must be true in production")
            if not self.frontend_url.lower().startswith("https://"):
                raise ValueError("FRONTEND_URL must use https:// in production")
            invalid_origins = [
                origin
                for origin in self.cors_origin_list
                if origin == "*" or not origin.lower().startswith("https://")
            ]
            if invalid_origins:
                raise ValueError(
                    "CORS_ORIGINS must contain only explicit https:// origins in production"
                )

        if (
            self.session_cookie_samesite == "none"
            and not self.session_cookie_secure
        ):
            raise ValueError(
                "SESSION_COOKIE_SAMESITE=none requires "
                "SESSION_COOKIE_SECURE=true"
            )

        if self.database_url and any(
            [
                self.postgres_host,
                self.postgres_database,
                self.postgres_user,
            ]
        ):
            parsed = urlparse(self.database_url)

            comparisons = {
                "host": (
                    parsed.hostname,
                    self.postgres_host,
                ),
                "port": (
                    parsed.port or 5432,
                    self.postgres_port,
                ),
                "database": (
                    parsed.path.lstrip("/"),
                    self.postgres_database,
                ),
                "username": (
                    unquote(parsed.username or ""),
                    self.postgres_user,
                ),
            }

            mismatches = [
                name
                for name, (url_value, env_value)
                in comparisons.items()
                if env_value is not None
                and str(url_value) != str(env_value)
            ]

            if mismatches:
                raise ValueError(
                    "DATABASE_URL and POSTGRES_* disagree on: "
                    + ", ".join(mismatches)
                )

        if self.mail_from:
            email_adapter.validate_python(self.mail_from)

        if self.reply_to_email:
            email_adapter.validate_python(
                self.reply_to_email
            )

        for recipient in self.sales_notification_recipient_list:
            email_adapter.validate_python(recipient)

        if (
            self.oniria_admin_email
            and not self.oniria_admin_full_name
        ):
            raise ValueError(
                "ONIRIA_ADMIN_FULL_NAME is required when "
                "ONIRIA_ADMIN_EMAIL is configured"
            )

        if self.oniria_admin_email:
            email_adapter.validate_python(
                self.oniria_admin_email
            )

        if (
            self.oniria_admin_password
            or self.oniria_admin_password_confirm
        ):
            if not self.oniria_admin_password:
                raise ValueError(
                    "ONIRIA_ADMIN_PASSWORD is required"
                )

            if not self.oniria_admin_password_confirm:
                raise ValueError(
                    "ONIRIA_ADMIN_PASSWORD_CONFIRM is required"
                )

            if (
                self.oniria_admin_password
                != self.oniria_admin_password_confirm
            ):
                raise ValueError(
                    "ONIRIA_ADMIN_PASSWORD and "
                    "ONIRIA_ADMIN_PASSWORD_CONFIRM do not match"
                )

        if (
            self.mail_provider or ""
        ).strip().lower() == "resend":
            missing: list[str] = []

            if not self.resend_api_key:
                missing.append("RESEND_API_KEY")

            if not self.mail_from:
                missing.append("MAIL_FROM")

            if not self.sales_notification_recipient_list:
                missing.append(
                    "SALES_NOTIFICATION_EMAIL or "
                    "SALES_NOTIFICATION_EMAILS"
                )

            if missing:
                raise ValueError(
                    "MAIL_PROVIDER=resend requires: "
                    + ", ".join(missing)
                )

        if (
            self.mail_provider or ""
        ).strip().lower() == "smtp":
            missing = []

            if not self.smtp_host:
                missing.append("SMTP_HOST")

            if not self.mail_from:
                missing.append("MAIL_FROM")

            if not self.sales_notification_recipient_list:
                missing.append(
                    "SALES_NOTIFICATION_EMAIL or "
                    "SALES_NOTIFICATION_EMAILS"
                )

            if missing:
                raise ValueError(
                    "MAIL_PROVIDER=smtp requires: "
                    + ", ".join(missing)
                )

        return self

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip().rstrip("/")
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def sales_notification_recipient_list(
        self,
    ) -> list[str]:
        values: list[str] = []

        if self.sales_notification_email:
            values.append(
                self.sales_notification_email
            )

        if self.sales_notification_emails:
            values.extend(
                self.sales_notification_emails.split(",")
            )

        return [
            value.strip()
            for value in values
            if value.strip()
        ]

    @property
    def effective_database_url(self) -> str | None:
        if self.database_url:
            return self.database_url

        if self.has_postgres_connection_settings:
            return (
                f"postgresql://{quote(str(self.postgres_user))}:"
                f"{quote(str(self.postgres_password))}@"
                f"{self.postgres_host}:"
                f"{self.postgres_port}/"
                f"{self.postgres_database}"
            )

        return None

    @property
    def has_postgres_connection_settings(self) -> bool:
        return bool(
            all(
                [
                    self.postgres_host,
                    self.postgres_database,
                    self.postgres_user,
                    self.postgres_password,
                ]
            )
        )

    @property
    def database_log_summary(
        self,
    ) -> dict[str, str | int | None]:
        """
        Return non-sensitive PostgreSQL details for logs.

        The password is intentionally excluded.
        """
        if self.database_url:
            parsed = urlparse(self.database_url)

            return {
                "postgres_host": parsed.hostname,
                "postgres_port": parsed.port or 5432,
                "postgres_database": (
                    parsed.path.lstrip("/") or None
                ),
                "postgres_user": (
                    unquote(parsed.username or "") or None
                ),
            }

        return {
            "postgres_host": self.postgres_host,
            "postgres_port": self.postgres_port,
            "postgres_database": self.postgres_database,
            "postgres_user": self.postgres_user,
        }

    @property
    def asyncpg_database_url(self) -> str | None:
        """Return a normalized PostgreSQL URL suitable for asyncpg.

        SQLAlchemy-style ``postgresql+asyncpg://`` URLs are accepted by the
        application configuration but asyncpg itself expects ``postgresql://``.
        Supabase connections are forced to TLS unless the caller already
        supplied an explicit sslmode.
        """
        database_url = self.effective_database_url
        if not database_url:
            return None

        parsed = urlparse(database_url)
        scheme = "postgresql" if parsed.scheme in {"postgres", "postgresql+asyncpg"} else parsed.scheme
        query_items = dict(parse_qsl(parsed.query, keep_blank_values=True))
        if "supabase" in (parsed.hostname or "").lower():
            query_items.setdefault("sslmode", "require")
        return urlunparse(parsed._replace(scheme=scheme, query=urlencode(query_items)))

    @property
    def postgres_connection_params(
        self,
    ) -> str | None:
        """Backward-compatible alias for the asyncpg connection URL."""
        return self.asyncpg_database_url

    @property
    def database_configuration_source(self) -> str:
        if self.database_url:
            return "DATABASE_URL"

        if self.has_postgres_connection_settings:
            return "POSTGRES_*"

        return "not_configured"

    @property
    def brochure_pdf_path(self) -> Path:
        value = Path(self.brochure_pdf_file)
        return value if value.is_absolute() else BACKEND_ROOT / value

    @property
    def resolved_env_file(self) -> Path:
        return BACKEND_ENV_FILE


@lru_cache
def get_settings() -> Settings:
    return Settings()
