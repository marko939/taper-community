-- Migration: Add 'metabolic' forum category with 4 sub-forums
-- Run against your Supabase database

-- 1. Drop existing category CHECK constraint and re-add with 'metabolic'
ALTER TABLE public.forums
  DROP CONSTRAINT IF EXISTS forums_category_check;

ALTER TABLE public.forums
  ADD CONSTRAINT forums_category_check
  CHECK (category IN ('drug', 'general', 'resources', 'start', 'community', 'tapering', 'research', 'lifestyle', 'feedback', 'our-community', 'metabolic'));

-- 2. Insert the 2 metabolic forums
INSERT INTO public.forums (name, slug, drug_slug, category, description) VALUES
  ('Diet & Research', 'metabolic-diet-research', NULL, 'metabolic', 'Compare dietary approaches, discuss scientific papers, and explore emerging research on metabolic psychiatry.'),
  ('Food, Recipes & Supplements', 'metabolic-food-supplements', NULL, 'metabolic', 'Meal ideas, recipes, electrolytes, supplements, and practical nutrition tips for brain health during your taper.')
ON CONFLICT (slug) DO NOTHING;
