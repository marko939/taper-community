-- Migration: clinician_crm table (admin-only CRM for clinician outreach)
-- Run in Supabase SQL Editor before clinician-crm-seed.sql

create table public.clinician_crm (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credentials text,
  clinic text,
  state text,
  address text,
  phone text,
  email_website text,
  description text,
  source text,
  category text,
  practice_type text,
  status text not null default 'new'
    check (status in ('new','contacted','responded','onboarded','declined','inactive')),
  admin_notes text,
  flagged boolean default false,
  sort_order integer,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.clinician_crm enable row level security;

-- Admin-only access (no public read — this is internal CRM data)
create policy "Admin manage clinician_crm" on public.clinician_crm
  for all using (auth.uid() in (
    '8572637a-2109-4471-bcb4-3163d04094d0'::uuid,
    'cf5e37af-df59-44e3-a446-3f97e5e4c558'::uuid
  ));

create index idx_clinician_crm_status on public.clinician_crm(status);
create index idx_clinician_crm_state on public.clinician_crm(state);
create index idx_clinician_crm_flagged on public.clinician_crm(flagged) where flagged = true;
create index idx_clinician_crm_sort on public.clinician_crm(sort_order);
