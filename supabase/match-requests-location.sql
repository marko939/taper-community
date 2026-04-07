-- Migration: Add assigned_location to match_requests for manual location override
-- Run in Supabase SQL Editor

ALTER TABLE public.match_requests ADD COLUMN IF NOT EXISTS assigned_location text;
