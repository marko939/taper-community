-- Migration: Create guide_downloads table for lead magnet email capture
-- Run this in Supabase SQL Editor before deploying

CREATE TABLE IF NOT EXISTS public.guide_downloads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  downloaded_at timestamptz DEFAULT now() NOT NULL
);

-- Unique constraint on email (one entry per email, ignore duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS guide_downloads_email_idx ON public.guide_downloads (email);

-- Enable RLS
ALTER TABLE public.guide_downloads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (email capture from non-authenticated visitors)
CREATE POLICY "Anyone can insert guide downloads"
  ON public.guide_downloads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service role can read (for admin/export purposes)
CREATE POLICY "Service role can read guide downloads"
  ON public.guide_downloads
  FOR SELECT
  TO service_role
  USING (true);
