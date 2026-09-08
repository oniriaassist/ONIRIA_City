# Local MySQL Setup

Roho supports MySQL 8.4 only.

1. Start MySQL.
2. Create the database if needed:

```sql
CREATE DATABASE IF NOT EXISTS oniria_city CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Copy and fill env files:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

4. Configure `backend/.env` with either `DATABASE_URL` or `MYSQL_*`.
5. Apply migrations and seed data:

```powershell
python backend\scripts\run_migrations.py
```

6. Bootstrap an administrator:

```powershell
python backend\scripts\create_admin.py
python backend\scripts\verify_admin.py
```

7. Start services:

```powershell
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 7000
cd frontend
npm run dev
```

## Verify Enquiries

Submit a public enquiry, then verify:

- API response includes a reference number.
- MySQL has the row in `enquiries`.
- MySQL has the associated row in `leads`.
- Admin pages `/admin/enquiries` and `/admin/leads` show the record after staff login.
