from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import unquote, urlparse

from pydantic import EmailStr, TypeAdapter, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ENV_FILE = BACKEND_ROOT / ".env"

MYSQL_SCHEMES = {
    "mysql",
    "mysql+pymysql",
    "mysql+aiomysql",
}

email_adapter = TypeAdapter(EmailStr)


class Settings(BaseSettings):
    # Application
    app_name: str = "ONIRIA City Backend"
    app_env: str = "local"
    app_debug: bool = False
    api_prefix: str = "/api"

    # Frontend and CORS
    cors_origins: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )
    frontend_url: str = "http://localhost:3000"

    # MySQL
    database_url: str | None = None
    mysql_host: str | None = None
    mysql_port: int = 3306
    mysql_database: str | None = None
    mysql_user: str | None = None
    mysql_password: str | None = None

    # Database pool
    mysql_pool_size: int = 10
    mysql_max_overflow: int = 20
    database_min_size: int = 1
    database_max_size: int = 5

    # Logging and limits
    log_level: str = "INFO"
    rate_limit_per_minute: int = 120

    # WhatsApp
    whatsapp_verify_token: str = "oniria-demo-verify-token"
    whatsapp_app_secret: str | None = None

    # Email
    mail_provider: str | None = None
    resend_api_key: str | None = None
    mail_from: str | None = None
    mail_from_name: str = "ONIRIA City"
    sales_notification_email: str | None = None
    sales_notification_emails: str | None = None
    reply_to_email: str | None = None

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
        "mysql_host",
        "mysql_database",
        "mysql_user",
        "mysql_password",
        "mail_provider",
        "resend_api_key",
        "mail_from",
        "sales_notification_email",
        "sales_notification_emails",
        "reply_to_email",
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

        if parsed.scheme not in MYSQL_SCHEMES:
            raise ValueError(
                "DATABASE_URL must use mysql://, "
                "mysql+pymysql://, or mysql+aiomysql://"
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
        "mysql_pool_size",
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

    @field_validator("mysql_port")
    @classmethod
    def validate_mysql_port(
        cls,
        value: int,
    ) -> int:
        if value < 1 or value > 65535:
            raise ValueError(
                "MYSQL_PORT must be between 1 and 65535"
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
                self.mysql_host,
                self.mysql_database,
                self.mysql_user,
            ]
        ):
            parsed = urlparse(self.database_url)

            comparisons = {
                "host": (
                    parsed.hostname,
                    self.mysql_host,
                ),
                "port": (
                    parsed.port or 3306,
                    self.mysql_port,
                ),
                "database": (
                    parsed.path.lstrip("/"),
                    self.mysql_database,
                ),
                "username": (
                    unquote(parsed.username or ""),
                    self.mysql_user,
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
                    "DATABASE_URL and MYSQL_* disagree on: "
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

        if self.has_mysql_connection_settings:
            return (
                f"mysql://{self.mysql_user}:"
                f"{self.mysql_password}@"
                f"{self.mysql_host}:"
                f"{self.mysql_port}/"
                f"{self.mysql_database}"
            )

        return None

    @property
    def has_mysql_connection_settings(self) -> bool:
        return bool(
            all(
                [
                    self.mysql_host,
                    self.mysql_database,
                    self.mysql_user,
                    self.mysql_password,
                ]
            )
        )

    @property
    def mysql_log_summary(
        self,
    ) -> dict[str, str | int | None]:
        """
        Return non-sensitive MySQL details for logs.

        The password is intentionally excluded.
        """
        if self.database_url:
            parsed = urlparse(self.database_url)

            return {
                "mysql_host": parsed.hostname,
                "mysql_port": parsed.port or 3306,
                "mysql_database": (
                    parsed.path.lstrip("/") or None
                ),
                "mysql_user": (
                    unquote(parsed.username or "") or None
                ),
            }

        return {
            "mysql_host": self.mysql_host,
            "mysql_port": self.mysql_port,
            "mysql_database": self.mysql_database,
            "mysql_user": self.mysql_user,
        }

    @property
    def mysql_connection_params(
        self,
    ) -> dict[str, str | int] | None:
        """
        Return connection arguments accepted by aiomysql.

        SSL is intentionally not configured here.
        """
        if self.has_mysql_connection_settings:
            return {
                "host": str(self.mysql_host),
                "port": self.mysql_port,
                "user": str(self.mysql_user),
                "password": str(self.mysql_password),
                "db": str(self.mysql_database),
            }

        if self.database_url:
            parsed = urlparse(self.database_url)

            if not parsed.hostname:
                raise ValueError(
                    "DATABASE_URL must include a hostname"
                )

            if not parsed.path.strip("/"):
                raise ValueError(
                    "DATABASE_URL must include a database name"
                )

            return {
                "host": parsed.hostname,
                "port": parsed.port or 3306,
                "user": unquote(
                    parsed.username or ""
                ),
                "password": unquote(
                    parsed.password or ""
                ),
                "db": parsed.path.lstrip("/"),
            }

        return None

    @property
    def mysql_configuration_source(self) -> str:
        if self.database_url:
            return "DATABASE_URL"

        if self.has_mysql_connection_settings:
            return "MYSQL_*"

        return "not_configured"

    @property
    def resolved_env_file(self) -> Path:
        return BACKEND_ENV_FILE


@lru_cache
def get_settings() -> Settings:
    return Settings()
