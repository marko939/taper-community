-- ============================================================
-- PAGE VIEWS TRACKING
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  session_id text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (including anonymous visitors)
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- Only service role can read (analytics API uses service role)
CREATE POLICY "Service role reads page views" ON public.page_views
  FOR SELECT USING (false);

-- Index for analytics queries
CREATE INDEX idx_page_views_created ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_path ON public.page_views(path, created_at DESC);
CREATE INDEX idx_page_views_session ON public.page_views(session_id);
