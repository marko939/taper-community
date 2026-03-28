-- Add forum_thread_id to blog_posts to track cross-posted forum threads
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS forum_thread_id uuid REFERENCES threads(id) ON DELETE SET NULL;

-- Add forum_slugs array to blog_posts so they appear in forum listings
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS forum_slugs TEXT[] DEFAULT '{}';
