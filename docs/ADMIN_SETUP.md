# Admin Setup

Create the first administrator from a trusted local machine, not from the browser.

Set in `backend/.env`:

```text
DATABASE_URL=<SUPABASE_SESSION_POOLER_OR_DIRECT_URL>
ONIRIA_ADMIN_FULL_NAME=ONIRIA Administrator
ONIRIA_ADMIN_EMAIL=<ADMIN EMAIL>
ONIRIA_ADMIN_PASSWORD=<STRONG PASSWORD>
ONIRIA_ADMIN_PASSWORD_CONFIRM=<SAME STRONG PASSWORD>
ONIRIA_ADMIN_UPDATE_PASSWORD=false
```

For a fresh database:

```powershell
python backend\scripts\run_migrations.py --seed
python backend\scripts\create_admin.py
python backend\scripts\verify_admin.py
```

After creation, remove the bootstrap password values from production environments. The runtime login uses the password hash stored in PostgreSQL.
