import pytest
import asyncio

from app.config import Settings
from app.services.admin_bootstrap_service import bootstrap_administrator, verify_administrator


class FakeCursor:
    def __init__(self, connection):
        self.connection = connection
        self.lastrowid = None
        self.result = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def execute(self, query, params=None):
        self.connection.queries.append((query, params))
        if "FROM staff_roles" in query:
            self.result = (7,)
        elif "EXISTS" in query:
            if self.connection.staff:
                self.result = (self.connection.staff[0], self.connection.staff[1], 1 if self.connection.has_role else 0)
            else:
                self.result = None
        elif "FROM staff_users" in query:
            self.result = self.connection.staff
        elif "FROM staff_user_roles" in query:
            self.result = (1,) if self.connection.has_role else None
        elif "INSERT INTO staff_users" in query:
            self.lastrowid = 11
            self.connection.staff = (11, 1)
        elif "INSERT INTO staff_user_roles" in query:
            self.connection.has_role = True
            self.result = None
        else:
            self.result = None

    async def fetchone(self):
        return self.result


class FakeConnection:
    def __init__(self, staff=None, has_role=False):
        self.staff = staff
        self.has_role = has_role
        self.queries = []
        self.next_staff_id = 11

    def cursor(self):
        return FakeCursor(self)

    async def fetchrow(self, query, *params):
        self.queries.append((query, params))
        if "FROM staff_roles" in query:
            return {"id": 7}
        if "EXISTS" in query:
            if self.staff:
                return {
                    "id": self.staff[0],
                    "is_active": self.staff[1],
                    "has_administrator_role": self.has_role,
                }
            return None
        if "FROM staff_users" in query:
            if not self.staff:
                return None
            return {"id": self.staff[0], "is_active": self.staff[1]}
        return None

    async def fetchval(self, query, *params):
        self.queries.append((query, params))
        if "INSERT INTO staff_users" in query:
            self.staff = (self.next_staff_id, True)
            return self.next_staff_id
        if "SELECT EXISTS" in query:
            return self.has_role
        return None

    async def execute(self, query, *params):
        self.queries.append((query, params))
        if "INSERT INTO staff_user_roles" in query:
            self.has_role = True
        return "INSERT 0 1"


def test_bootstrap_creates_missing_administrator():
    asyncio.run(_run_bootstrap_creates_missing_administrator())


async def _run_bootstrap_creates_missing_administrator():
    connection = FakeConnection()
    result = await bootstrap_administrator(
        connection,
        Settings(
            oniria_admin_full_name="Admin User",
            oniria_admin_email="admin@example.com",
            oniria_admin_password="StrongPass12!",
            oniria_admin_password_confirm="StrongPass12!",
        ),
    )
    assert result.status == "Administrator created"
    assert connection.has_role is True
    verified = await verify_administrator(connection, "ADMIN@example.com")
    assert verified.active is True
    assert verified.has_administrator_role is True


def test_bootstrap_adds_missing_administrator_role_without_password_reset():
    asyncio.run(_run_bootstrap_adds_missing_administrator_role_without_password_reset())


async def _run_bootstrap_adds_missing_administrator_role_without_password_reset():
    connection = FakeConnection(staff=(5, 1), has_role=False)
    result = await bootstrap_administrator(
        connection,
        Settings(
            oniria_admin_full_name="Admin User",
            oniria_admin_email="admin@example.com",
            oniria_admin_password="StrongPass12!",
            oniria_admin_password_confirm="StrongPass12!",
        ),
    )
    assert result.status == "Administrator role added"
    assert not any("password_hash" in query for query, _ in connection.queries)
