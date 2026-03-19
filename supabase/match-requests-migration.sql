-- Migration: match_requests table for clinician matching
-- Run in Supabase SQL Editor AFTER clinicians-migration.sql + clinicians-seed.sql

create table public.match_requests (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid not null references public.clinicians(id),
  user_id uuid references public.profiles(id) on delete set null,
  patient_name text not null,
  patient_email text not null,
  medications text,
  taper_duration text,
  support_types text[] default '{}',
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'contacted', 'matched', 'declined', 'closed')),
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.match_requests enable row level security;

-- Users can create match requests
create policy "Users create match requests" on public.match_requests
  for insert with check (auth.uid() = user_id);

-- Users can read their own requests
create policy "Users read own requests" on public.match_requests
  for select using (auth.uid() = user_id);

-- Admin can manage all requests
create policy "Admin manage match requests" on public.match_requests
  for all using (auth.uid() in (
    '8572637a-2109-4471-bcb4-3163d04094d0'::uuid,
    'cf5e37af-df59-44e3-a446-3f97e5e4c558'::uuid
  ));

create index idx_match_requests_clinician on public.match_requests(clinician_id);
create index idx_match_requests_status on public.match_requests(status, created_at desc);
