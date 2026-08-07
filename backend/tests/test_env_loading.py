import os
import subprocess
import sys
from pathlib import Path

from app.config import BACKEND_ENV_FILE


def run_python(code: str, cwd: Path, env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
    merged_env = os.environ.copy()
    for key in [
        "DATABASE_URL",
        "MYSQL_HOST",
        "MYSQL_PORT",
        "MYSQL_DATABASE",
        "MYSQL_USER",
        "MYSQL_PASSWORD",
        "MAIL_PROVIDER",
        "RESEND_API_KEY",
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USERNAME",
        "SMTP_PASSWORD",
        "MAIL_FROM",
        "SALES_NOTIFICATION_EMAIL",
        "SALES_NOTIFICATION_EMAILS",
    ]:
        merged_env.pop(key, None)
    if env:
        merged_env.update(env)
    return subprocess.run(
        [sys.executable, "-c", code],
        cwd=cwd,
        env=merged_env,
        text=True,
        capture_output=True,
        check=False,
    )


def write_env(path: Path, *, host: str = "192.0.2.10", password: str = "super-secret") -> str:
    original = path.read_text(encoding="utf-8") if path.exists() else None
    path.write_text(
        "\n".join(
            [
                "DATABASE_URL=",
                f"MYSQL_HOST={host}",
                "MYSQL_PORT=3306",
                "MYSQL_DATABASE=oniria_city_test",
                "MYSQL_USER=env_user",
                f"MYSQL_PASSWORD={password}",
                "SESSION_COOKIE_SECURE=false",
                "SESSION_COOKIE_SAMESITE=lax",
            ]
        )
        + "\n",
        encoding="utf-8",
    )
    return original


def restore_env(path: Path, original: str | None) -> None:
    if original is None:
        path.unlink(missing_ok=True)
    else:
        path.write_text(original, encoding="utf-8")


def test_backend_env_loads_from_repository_root():
    root = Path(__file__).resolve().parents[2]
    original = write_env(BACKEND_ENV_FILE)
    try:
        result = run_python(
            "import sys; sys.path.insert(0, 'backend'); from app.config import get_settings; s=get_settings(); print(s.mysql_host, s.mysql_user)",
            cwd=root,
        )
        assert result.returncode == 0
        assert "192.0.2.10 env_user" in result.stdout
    finally:
        restore_env(BACKEND_ENV_FILE, original)


def test_backend_env_loads_from_backend_directory():
    root = Path(__file__).resolve().parents[2]
    original = write_env(BACKEND_ENV_FILE, host="192.0.2.11")
    try:
        result = run_python(
            "from app.config import get_settings; s=get_settings(); print(s.mysql_host, s.mysql_database)",
            cwd=root / "backend",
        )
        assert result.returncode == 0
        assert "192.0.2.11 oniria_city_test" in result.stdout
    finally:
        restore_env(BACKEND_ENV_FILE, original)


def test_operating_system_env_overrides_backend_env():
    root = Path(__file__).resolve().parents[2]
    original = write_env(BACKEND_ENV_FILE)
    try:
        result = run_python(
            "import sys; sys.path.insert(0, 'backend'); from app.config import get_settings; s=get_settings(); print(s.mysql_host)",
            cwd=root,
            env={"MYSQL_HOST": "198.51.100.7"},
        )
        assert result.returncode == 0
        assert result.stdout.strip() == "198.51.100.7"
    finally:
        restore_env(BACKEND_ENV_FILE, original)


def test_check_database_uses_backend_env_and_does_not_print_password():
    root = Path(__file__).resolve().parents[2]
    original = write_env(BACKEND_ENV_FILE, password="do-not-print-this")
    try:
        result = subprocess.run(
            [sys.executable, "backend/scripts/check_database.py"],
            cwd=root,
            text=True,
            capture_output=True,
            check=False,
        )
        combined = result.stdout + result.stderr
        assert f"Environment file: {BACKEND_ENV_FILE}" in combined
        assert "Host: 192.0.2.10" in combined
        assert "User: env_user" in combined
        assert "do-not-print-this" not in combined
    finally:
        restore_env(BACKEND_ENV_FILE, original)
