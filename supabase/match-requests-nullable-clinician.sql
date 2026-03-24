-- Migration: Allow match_requests without a specific clinician
-- For onboarding "help me find a clinician" requests where no clinician is selected yet.
-- Run in Supabase SQL Editor AFTER match-requests-migration.sql

ALTER TABLE public.match_requests ALTER COLUMN clinician_id DROP NOT NULL;
