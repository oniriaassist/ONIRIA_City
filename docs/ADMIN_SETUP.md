# Admin Setup

Fill PostgreSQL/Supabase settings and admin bootstrap values:

```text
DATABASE_URL=<supabase-postgresql-url>
ONIRIA_ADMIN_FULL_NAME=ONIRIA Administrator
ONIRIA_ADMIN_EMAIL=admin@example.com
ONIRIA_ADMIN_PASSWORD=CHANGE_ME_STRONG_PASSWORD
ONIRIA_ADMIN_PASSWORD_CONFIRM=CHANGE_ME_STRONG_PASSWORD
ONIRIA_ADMIN_UPDATE_PASSWORD=false
```

Run:

```powershell
python backend\scripts\run_migrations.py
python backend\scripts\create_admin.py
python backend\scripts\verify_admin.py
```

If login says `Invalid staff credentials`, verify:

- `staff_users.is_active = true`
- The user has the `administrator` role through `staff_user_roles`
- Frontend and backend point at the same Supabase/PostgreSQL database
