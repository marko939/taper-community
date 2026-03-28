-- Add forum_thread_id to blog_posts to track cross-posted forum threads
ALTER TABLE blog_posts
ADD COLUMN forum_thread_id uuid REFERENCES threads(id) ON DELETE SET NULL;
