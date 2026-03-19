-- Migration: clinicians table (migrated from hardcoded DEPRESCRIBERS array)
-- Run in Supabase SQL Editor before clinicians-seed.sql

create table public.clinicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  clinic text,
  location text,
  description text,
  source text,
  latitude double precision not null,
  longitude double precision not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.clinicians enable row level security;

-- Public read for map display
create policy "Public read active clinicians" on public.clinicians
  for select using (is_active = true);

-- Admin can manage clinicians
create policy "Admin manage clinicians" on public.clinicians
  for all using (auth.uid() in (
    '8572637a-2109-4471-bcb4-3163d04094d0'::uuid,
    'cf5e37af-df59-44e3-a446-3f97e5e4c558'::uuid
  ));

create index idx_clinicians_active on public.clinicians(is_active) where is_active = true;
