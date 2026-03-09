-- Migration: Add user b2fb8e00 as moderator + founding member
-- Run this in Supabase SQL Editor

-- 1. Set founding member badge
update public.profiles
set is_founding_member = true
where id = 'b2fb8e00-bbd0-489b-a762-945fa811861f';

-- 2. Update RLS policies to include new mod

-- Threads: update
drop policy if exists "Admin can update any thread" on public.threads;
create policy "Admin can update any thread" on public.threads
  for update using (auth.uid() in (
    '8572637a-2109-4471-bcb4-3163d04094d0'::uuid,
    'b2fb8e00-bbd0-489b-a762-945fa811861f'::uuid
  ));

-- Threads: delete
drop policy if exists "Admin can delete any thread" on public.threads;
create policy "Admin can delete any thread" on public.threads
  for delete using (auth.uid() in (
    '8572637a-2109-4471-bcb4-3163d04094d0'::uuid,
    'b2fb8e00-bbd0-489b-a762-945fa811861f'::uuid
  ));

-- Replies: delete
drop policy if exists "Admin can delete any reply" on public.replies;
create policy "Admin can delete any reply" on public.replies
  for delete using (auth.uid() in (
    '8572637a-2109-4471-bcb4-3163d04094d0'::uuid,
    'b2fb8e00-bbd0-489b-a762-945fa811861f'::uuid
  ));
