# Production Deployment Checklist

1. Use Supabase PostgreSQL.
2. Set backend `DATABASE_URL` to the Supabase pooled connection string.
3. Deploy backend on Vercel from `backend`.
4. Deploy frontend on Vercel from `frontend`.
5. Run `python backend\scripts\run_migrations.py`.
6. Run `python backend\scripts\create_admin.py`.
7. Run `python backend\scripts\verify_admin.py`.
8. Submit an enquiry and verify it in `/admin/enquiries` and `/admin/leads`.
9. Keep all secrets in Supabase/Vercel environment variables only.
