-- TaperCommunity Database Schema
-- Run in Supabase SQL Editor

-- ============================================================
-- PROFILES — extends auth.users
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default 'Anonymous',
  drug text,
  taper_stage text,
  has_clinician boolean default false,
  post_count integer default 0,
  is_peer_advisor boolean default false,
  drug_signature text,
  introduction_thread_id uuid,
  location text,
  bio text,
  avatar_url text,
  joined_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles read" on public.profiles
  for select using (true);

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  -- Auto-follow admin account
  insert into public.user_follows (follower_id, followed_id)
  values (new.id, '8572637a-2109-4471-bcb4-3163d04094d0');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FORUMS
-- ============================================================
create table public.forums (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  drug_slug text unique,
  category text not null check (category in ('drug', 'general', 'resources', 'start', 'community', 'tapering', 'research', 'lifestyle', 'feedback')),
  slug text unique,
  description text,
  post_count integer default 0,
  created_at timestamptz default now()
);

alter table public.forums enable row level security;

create policy "Public forums read" on public.forums
  for select using (true);

-- ============================================================
-- THREADS
-- ============================================================
create table public.threads (
  id uuid primary key default gen_random_uuid(),
  forum_id uuid not null references public.forums(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  tags text[] default '{}',
  reply_count integer default 0,
  view_count integer default 0,
  vote_score integer default 0,
  pinned boolean default false,
  created_at timestamptz default now()
);

alter table public.threads enable row level security;

create policy "Public threads read" on public.threads
  for select using (true);

create policy "Auth users create threads" on public.threads
  for insert with check (auth.uid() = user_id);

create policy "Users update own threads" on public.threads
  for update using (auth.uid() = user_id);

create policy "Admin can update any thread" on public.threads
  for update using (auth.uid() = '8572637a-2109-4471-bcb4-3163d04094d0'::uuid);

create policy "Users delete own threads" on public.threads
  for delete using (auth.uid() = user_id);

create policy "Admin can delete any thread" on public.threads
  for delete using (auth.uid() = '8572637a-2109-4471-bcb4-3163d04094d0'::uuid);

-- Increment forum post_count + user post_count on new thread
create or replace function public.handle_new_thread()
returns trigger as $$
begin
  update public.forums set post_count = post_count + 1 where id = new.forum_id;
  update public.profiles set post_count = post_count + 1 where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_thread_created
  after insert on public.threads
  for each row execute function public.handle_new_thread();

-- ============================================================
-- REPLIES
-- ============================================================
create table public.replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  helpful_count integer default 0,
  vote_score integer default 0,
  created_at timestamptz default now()
);

alter table public.replies enable row level security;

create policy "Public replies read" on public.replies
  for select using (true);

create policy "Auth users create replies" on public.replies
  for insert with check (auth.uid() = user_id);

create policy "Users update own replies" on public.replies
  for update using (auth.uid() = user_id);

create policy "Users delete own replies" on public.replies
  for delete using (auth.uid() = user_id);

create policy "Admin can delete any reply" on public.replies
  for delete using (auth.uid() = '8572637a-2109-4471-bcb4-3163d04094d0'::uuid);

-- Increment thread reply_count + user post_count on new reply
create or replace function public.handle_new_reply()
returns trigger as $$
begin
  update public.threads set reply_count = reply_count + 1 where id = new.thread_id;
  update public.profiles set post_count = post_count + 1 where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_reply_created
  after insert on public.replies
  for each row execute function public.handle_new_reply();

-- ============================================================
-- HELPFUL VOTES (prevents double-voting)
-- ============================================================
create table public.helpful_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  reply_id uuid not null references public.replies(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, reply_id)
);

alter table public.helpful_votes enable row level security;

create policy "Public votes read" on public.helpful_votes
  for select using (true);

create policy "Auth users vote" on public.helpful_votes
  for insert with check (auth.uid() = user_id);

create policy "Users remove own vote" on public.helpful_votes
  for delete using (auth.uid() = user_id);

-- ============================================================
-- JOURNAL ENTRIES (private to owner)
-- ============================================================
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  drug text,
  current_dose text,
  dose_numeric real,
  symptoms text[] default '{}',
  mood_score integer check (mood_score between 1 and 10),
  notes text,
  created_at timestamptz default now()
);

alter table public.journal_entries enable row level security;

create policy "Users read own journal" on public.journal_entries
  for select using (auth.uid() = user_id);

create policy "Users create journal entries" on public.journal_entries
  for insert with check (auth.uid() = user_id);

create policy "Users update own entries" on public.journal_entries
  for update using (auth.uid() = user_id);

create policy "Users delete own entries" on public.journal_entries
  for delete using (auth.uid() = user_id);

-- ============================================================
-- JOURNAL SHARES (shareable public links)
-- ============================================================
create table public.journal_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  share_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz default now()
);

alter table public.journal_shares enable row level security;

create policy "Users manage own shares" on public.journal_shares
  for all using (auth.uid() = user_id);

create policy "Public read shares by token" on public.journal_shares
  for select using (true);

-- Public read policy for shared journal entries (via share token join)
create policy "Public read shared journals" on public.journal_entries
  for select using (
    exists (
      select 1 from public.journal_shares
      where journal_shares.user_id = journal_entries.user_id
    )
  );

-- ============================================================
-- THREAD VOTES (Reddit-style up/down voting)
-- ============================================================
create table public.thread_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  thread_id uuid not null references public.threads(id) on delete cascade,
  vote_type text not null check (vote_type in ('up', 'down')),
  created_at timestamptz default now(),
  primary key (user_id, thread_id)
);

alter table public.thread_votes enable row level security;

create policy "Public thread votes read" on public.thread_votes
  for select using (true);

create policy "Auth users vote on threads" on public.thread_votes
  for insert with check (auth.uid() = user_id);

create policy "Users remove own thread vote" on public.thread_votes
  for delete using (auth.uid() = user_id);

create policy "Users update own thread vote" on public.thread_votes
  for update using (auth.uid() = user_id);

-- ============================================================
-- REPLY VOTES (Reddit-style up/down voting)
-- ============================================================
create table public.reply_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  reply_id uuid not null references public.replies(id) on delete cascade,
  vote_type text not null check (vote_type in ('up', 'down')),
  created_at timestamptz default now(),
  primary key (user_id, reply_id)
);

alter table public.reply_votes enable row level security;

create policy "Public reply votes read" on public.reply_votes
  for select using (true);

create policy "Auth users vote on replies" on public.reply_votes
  for insert with check (auth.uid() = user_id);

create policy "Users remove own reply vote" on public.reply_votes
  for delete using (auth.uid() = user_id);

create policy "Users update own reply vote" on public.reply_votes
  for update using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_threads_forum on public.threads(forum_id, created_at desc);
create index idx_threads_user on public.threads(user_id);
create index idx_replies_thread on public.replies(thread_id, created_at);
create index idx_journal_user_date on public.journal_entries(user_id, date desc);
create index idx_journal_shares_token on public.journal_shares(share_token);
create index idx_forums_drug_slug on public.forums(drug_slug);
create index idx_forums_slug on public.forums(slug);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
alter table public.profiles add column if not exists email_notifications boolean default true;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('thread_reply', 'reply_mention')),
  thread_id uuid not null references public.threads(id) on delete cascade,
  reply_id uuid not null references public.replies(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  read boolean default false,
  emailed boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users read own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create index idx_notifications_user_read on public.notifications(user_id, read, created_at desc);

-- Trigger: create notifications when a reply is posted
create or replace function public.handle_reply_notify()
returns trigger as $$
declare
  v_thread record;
  v_actor_name text;
  v_recipients uuid[];
  v_recipient uuid;
  v_title text;
  v_body text;
begin
  -- Get thread info
  select id, user_id, title into v_thread
    from public.threads where id = new.thread_id;

  -- Get actor display name
  select display_name into v_actor_name
    from public.profiles where id = new.user_id;

  -- Build notification text
  v_title := v_actor_name || ' replied to "' || left(v_thread.title, 80) || '"';
  v_body := left(new.body, 200);

  -- Collect recipients: thread author + all previous repliers, excluding the reply author
  select array_agg(distinct uid) into v_recipients
  from (
    select v_thread.user_id as uid
    union
    select r.user_id as uid from public.replies r where r.thread_id = new.thread_id
  ) participants
  where uid != new.user_id;

  -- Insert a notification for each recipient
  if v_recipients is not null then
    foreach v_recipient in array v_recipients loop
      insert into public.notifications (user_id, type, thread_id, reply_id, actor_id, title, body)
      values (v_recipient, 'thread_reply', new.thread_id, new.id, new.user_id, v_title, v_body);
    end loop;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_reply_notify
  after insert on public.replies
  for each row execute function public.handle_reply_notify();

-- ============================================================
-- USER FOLLOWS
-- ============================================================
create table public.user_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, followed_id)
);

alter table public.user_follows enable row level security;

create policy "Public follows read" on public.user_follows
  for select using (true);

create policy "Auth users follow" on public.user_follows
  for insert with check (auth.uid() = follower_id);

create policy "Users unfollow" on public.user_follows
  for delete using (auth.uid() = follower_id);

create index idx_follows_followed on public.user_follows(followed_id);
create index idx_follows_follower on public.user_follows(follower_id);
