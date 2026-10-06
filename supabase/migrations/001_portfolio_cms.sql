-- Portfolio CMS schema: profiles, experience, skills, projects, resume, SEO + site settings.
-- Run with `supabase db push` or paste into the Supabase SQL editor.
-- After applying: INSERT your admin email into admin_users, then set the
-- NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.

-- Extensions ----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Admin allowlist ------------------------------------------------------------
-- Only emails listed here may write portfolio content. Auth itself is handled
-- by Supabase Auth (magic links); these policies add the admin-only layer.
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

-- Helper: true when the current JWT belongs to an allowlisted admin.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admin_users
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- Shared updated-at trigger ---------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Site profile (single published row drives hero / about / contact) ----------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  headline text not null default '',
  hero_description text not null default '',
  about text not null default '',
  location text not null default '',
  email text not null default '',
  phone text not null default '',
  linkedin text not null default '',
  github text not null default '',
  open_to_work boolean not null default true,
  cta_text text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Experience ------------------------------------------------------------------
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null default '',
  designation text not null default '',
  start_date text not null default '',
  end_date text,
  is_current boolean not null default false,
  description text not null default '',
  responsibilities jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  technologies text[] not null default '{}',
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_experiences_updated on public.experiences;
create trigger trg_experiences_updated
  before update on public.experiences
  for each row execute function public.touch_updated_at();

-- Skills ----------------------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('data-analytics', 'web-development', 'ai-automation', 'creative-technology')),
  proficiency text not null default 'familiar'
    check (proficiency in ('core', 'applied', 'working-knowledge', 'familiar')),
  description text not null default '',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_skills_updated on public.skills;
create trigger trg_skills_updated
  before update on public.skills
  for each row execute function public.touch_updated_at();

-- Projects --------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('data-analytics', 'ai-automation', 'web-applications', 'creative-technology')),
  problem text not null default '',
  approach text not null default '',
  solution text not null default '',
  role text not null default '',
  technologies text[] not null default '{}',
  key_features text[] not null default '{}',
  outcome text not null default '',
  github_url text not null default '',
  live_demo_url text not null default '',
  case_study_url text not null default '',
  thumbnail text not null default '',
  screenshots text[] not null default '{}',
  is_featured boolean not null default false,
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- Resume versions --------------------------------------------------------------
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_url text not null,
  file_size integer not null default 0 check (file_size >= 0),
  version text not null default 'v1.0',
  status text not null default 'draft' check (status in ('draft', 'published')),
  uploaded_at timestamptz not null default now()
);

-- SEO settings (single published row) ------------------------------------------
create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  page_title text not null default '',
  meta_description text not null default '',
  og_image text not null default '/og-image.png',
  twitter_card text not null default 'summary_large_image',
  structured_data jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_seo_updated on public.seo_settings;
create trigger trg_seo_updated
  before update on public.seo_settings
  for each row execute function public.touch_updated_at();

-- Generic site settings (key/value for flags, social links, CTAs) --------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- Row Level Security ------------------------------------------------------------
alter table public.admin_users    enable row level security;
alter table public.profiles       enable row level security;
alter table public.experiences    enable row level security;
alter table public.skills         enable row level security;
alter table public.projects       enable row level security;
alter table public.resumes        enable row level security;
alter table public.seo_settings   enable row level security;
alter table public.site_settings  enable row level security;

-- Public read access: published rows only (portfolio must never leak drafts).
drop policy if exists "public read published profiles" on public.profiles;
create policy "public read published profiles" on public.profiles
  for select using (status = 'published');

drop policy if exists "public read published experiences" on public.experiences;
create policy "public read published experiences" on public.experiences
  for select using (status = 'published');

drop policy if exists "public read active skills" on public.skills;
create policy "public read active skills" on public.skills
  for select using (is_active = true);

drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects" on public.projects
  for select using (status = 'published');

drop policy if exists "public read published resumes" on public.resumes;
create policy "public read published resumes" on public.resumes
  for select using (status = 'published');

drop policy if exists "public read published seo" on public.seo_settings;
create policy "public read published seo" on public.seo_settings
  for select using (status = 'published');

drop policy if exists "public read site settings" on public.site_settings;
create policy "public read site settings" on public.site_settings
  for select using (true);

-- Admin write access: allowlisted emails only (all tables, all operations).
drop policy if exists "admin full access profiles" on public.profiles;
create policy "admin full access profiles" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access experiences" on public.experiences;
create policy "admin full access experiences" on public.experiences
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access skills" on public.skills;
create policy "admin full access skills" on public.skills
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access projects" on public.projects;
create policy "admin full access projects" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access resumes" on public.resumes;
create policy "admin full access resumes" on public.resumes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access seo" on public.seo_settings;
create policy "admin full access seo" on public.seo_settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access site settings" on public.site_settings;
create policy "admin full access site settings" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Admins can read their own allowlist row (needed for UI checks); only
-- service-role / dashboard SQL can insert the first admin email.
drop policy if exists "admins read allowlist" on public.admin_users;
create policy "admins read allowlist" on public.admin_users
  for select using (public.is_admin());

-- Storage -----------------------------------------------------------------------
-- Public bucket for resume PDF, thumbnails, screenshots, OG images.
insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

drop policy if exists "public read portfolio assets" on storage.objects;
create policy "public read portfolio assets" on storage.objects
  for select using (bucket_id = 'portfolio-assets');

drop policy if exists "admin write portfolio assets" on storage.objects;
create policy "admin write portfolio assets" on storage.objects
  for all using (bucket_id = 'portfolio-assets' and public.is_admin())
  with check (bucket_id = 'portfolio-assets' and public.is_admin());

-- Seed the owner as admin (replace with the real address before applying) ------
-- insert into public.admin_users (email) values ('[ADD YOUR ADMIN EMAIL]');
