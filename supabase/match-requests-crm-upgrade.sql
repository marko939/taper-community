-- Migration: Add CRM features to match_requests
-- Adds flagged column for priority flagging and sort_order for manual reordering
-- Run in Supabase SQL Editor AFTER match-requests-migration.sql

ALTER TABLE public.match_requests ADD COLUMN IF NOT EXISTS flagged boolean DEFAULT false;
ALTER TABLE public.match_requests ADD COLUMN IF NOT EXISTS sort_order integer;

CREATE INDEX IF NOT EXISTS idx_match_requests_flagged ON public.match_requests(flagged, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_requests_sort_order ON public.match_requests(sort_order);
