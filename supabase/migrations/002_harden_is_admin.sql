-- Hardened public.is_admin(): pinned search_path and fully qualified names.
-- Prevents search_path hijacking of the security-definer helper used by
-- every admin RLS policy. Safe to re-run (drops and recreates the function).

drop function if exists public.is_admin();

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- Restrict direct execution: the function is only useful inside RLS policies.
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated, service_role;
