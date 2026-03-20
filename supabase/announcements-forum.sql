-- Add Announcements forum
INSERT INTO public.forums (name, slug, drug_slug, category, description)
VALUES (
  'Announcements',
  'announcements',
  NULL,
  'general',
  'Official announcements and updates from the TaperCommunity team.'
)
ON CONFLICT (slug) DO NOTHING;
