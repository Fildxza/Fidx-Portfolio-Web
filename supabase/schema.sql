-- ============================================================================
-- Fildza Portfolio — Supabase schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query)
-- after creating a new project. Safe to re-run: uses IF NOT EXISTS guards.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- experience
-- ----------------------------------------------------------------------------
create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text not null,
  location text,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  bullets text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- education
-- ----------------------------------------------------------------------------
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  credential text not null,
  field text,
  start_date date not null,
  end_date date,
  score text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- projects
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  long_description text,
  tech_stack text[] not null default '{}',
  repo_url text,
  live_url text,
  image_url text,
  is_pinned boolean not null default false,
  is_featured boolean not null default false,
  source text not null default 'manual' check (source in ('manual', 'github')),
  github_repo_name text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- skill_categories + skills
-- ----------------------------------------------------------------------------
create table if not exists public.skill_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.skill_categories(id) on delete cascade,
  name text not null,
  proficiency int check (proficiency between 0 and 100),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists skills_category_id_idx on public.skills(category_id);

-- ----------------------------------------------------------------------------
-- certificates
-- ----------------------------------------------------------------------------
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  issue_date date,
  credential_url text,
  file_url text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- achievements
-- ----------------------------------------------------------------------------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- social_links
-- ----------------------------------------------------------------------------
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- site_settings — key/value store for resume URL, profile photo URL, etc.
-- ----------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- contact_messages
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);

-- ============================================================================
-- updated_at trigger helper
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.experience;
create trigger set_updated_at before update on public.experience
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.education;
create trigger set_updated_at before update on public.education
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.projects;
create trigger set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.experience enable row level security;
alter table public.education enable row level security;
alter table public.projects enable row level security;
alter table public.skill_categories enable row level security;
alter table public.skills enable row level security;
alter table public.certificates enable row level security;
alter table public.achievements enable row level security;
alter table public.social_links enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;

-- Public (anon + authenticated) can read all portfolio content.
create policy "public read experience" on public.experience for select using (true);
create policy "public read education" on public.education for select using (true);
create policy "public read projects" on public.projects for select using (true);
create policy "public read skill_categories" on public.skill_categories for select using (true);
create policy "public read skills" on public.skills for select using (true);
create policy "public read certificates" on public.certificates for select using (true);
create policy "public read achievements" on public.achievements for select using (true);
create policy "public read social_links" on public.social_links for select using (true);
create policy "public read site_settings" on public.site_settings for select using (true);

-- Only authenticated (the admin, signed in via Supabase Auth) can write.
create policy "admin write experience" on public.experience for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write education" on public.education for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write projects" on public.projects for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write skill_categories" on public.skill_categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write skills" on public.skills for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write certificates" on public.certificates for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write achievements" on public.achievements for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write social_links" on public.social_links for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write site_settings" on public.site_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- contact_messages: anyone can submit, only the admin can read/manage.
create policy "public insert contact_messages" on public.contact_messages for insert
  with check (true);
create policy "admin read contact_messages" on public.contact_messages for select
  using (auth.role() = 'authenticated');
create policy "admin update contact_messages" on public.contact_messages for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin delete contact_messages" on public.contact_messages for delete
  using (auth.role() = 'authenticated');

-- ============================================================================
-- Storage buckets
-- ============================================================================
insert into storage.buckets (id, name, public)
values
  ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

create policy "public read portfolio-media" on storage.objects for select
  using (bucket_id = 'portfolio-media');

create policy "admin write portfolio-media" on storage.objects for insert
  with check (bucket_id = 'portfolio-media' and auth.role() = 'authenticated');

create policy "admin update portfolio-media" on storage.objects for update
  using (bucket_id = 'portfolio-media' and auth.role() = 'authenticated');

create policy "admin delete portfolio-media" on storage.objects for delete
  using (bucket_id = 'portfolio-media' and auth.role() = 'authenticated');
