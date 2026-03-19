-- Migration: shared_journeys table for shareable taper journey links
-- Run in Supabase SQL Editor before deploying this feature

create table public.shared_journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  journey_snapshot jsonb,
  share_context text not null check (share_context in ('clinical', 'personal')),
  is_active boolean default true,
  view_count int default 0,
  created_at timestamptz default now(),
  expires_at timestamptz
);

alter table public.shared_journeys enable row level security;

-- Owner can manage their shares
create policy "Users manage own shares" on public.shared_journeys
  for all using (auth.uid() = user_id);

-- Public can read active shares (for /share/[uuid] page)
create policy "Public read active shares" on public.shared_journeys
  for select using (is_active = true);

create index idx_shared_journeys_user on public.shared_journeys(user_id);
