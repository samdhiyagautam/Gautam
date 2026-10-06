# Going live with Supabase (15 minutes)

The code is ready. Supabase is the only missing piece for admin login,
content persistence, resume uploads, and magic-link auth. Follow these steps
in order.

## 1. Create the project

1. Go to https://supabase.com/dashboard → New project.
2. Save the database password somewhere safe (you will not need it in code).
3. Open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> The app never uses the `service_role` key. Do not put it in env vars.

## 2. Apply the database migrations

Open **SQL Editor** → New query, then run each file in order
(`supabase/migrations/` in this repo):

1. `001_portfolio_cms.sql` — tables, RLS policies, `portfolio-assets` bucket.
2. `002_harden_is_admin.sql` — hardened `is_admin()` helper.

Both are idempotent (safe to re-run).

## 3. Create your admin user (two places, same email)

**A. Supabase Auth user** (required — the app uses `shouldCreateUser: false`,
so magic links only work for pre-existing auth users):

1. Go to **Authentication → Users → Add user → Create new user**.
2. Enter your email, check **Auto Confirm User**, save.
   (No password needed — you will sign in via magic link.)

**B. Allowlist row** (required — RLS + the app check this table):

```sql
insert into public.admin_users (email) values ('you@example.com');
```

Use the exact same email as in step A, and as `ADMIN_EMAIL`.

## 4. Configure magic-link redirects

Go to **Authentication → URL Configuration** and add to **Redirect URLs**:

- `http://localhost:3000/api/auth/callback` (local dev)
- `https://YOUR-DOMAIN/api/auth/callback` (production)

## 5. Set environment variables

Local (`.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=you@example.com
```

Production (Vercel → Project → Settings → Environment Variables): same keys,
plus `NEXT_PUBLIC_SITE_URL=https://YOUR-DOMAIN` and the Resend keys below.

## 6. Verify (acceptance test)

1. `npm run dev` → open `http://localhost:3000/admin`.
2. You are redirected to `/admin/auth`. Enter your email → Send Magic Link.
3. Click the link in your inbox → you land on `/admin` (not `?error=`).
4. **Profile**: change the headline → Save → toast success → refresh →
   value persists → open `/` → new headline visible.
5. **Projects**: Add Project (draft) → appears in admin table as draft →
   open `/admin/projects/<id>/preview` → preview renders → Publish →
   appears on `/projects`. Delete the test project after.
6. Repeat edit → save → refresh → persists for Experience, Skills, Resume
   (upload a test PDF → Publish → visible on `/resume`), SEO.

## 7. Optional: contact delivery (Resend)

1. https://resend.com → API Keys → create key → `RESEND_API_KEY`.
2. Set `CONTACT_TO_EMAIL` to the inbox that receives messages.
3. Without these, the form honestly shows a mailto fallback (no fake sends).

## Troubleshooting

| Symptom | Cause → Fix |
|---|---|
| `?error=exchange-failed` | Expired link, wrong redirect URL allowlist, or clock skew → request a new link |
| `?error=forbidden` | Email not in `admin_users` (or case mismatch) → run the INSERT |
| Magic link never arrives | Auth user doesn't exist (`shouldCreateUser: false`) → step 3A; check spam |
| Admin saves fail with 503 | Env vars empty at runtime → restart dev server / redeploy Vercel |
| Resume upload fails | Bucket missing → re-run migration 001; max 5 MB, PDF only |
