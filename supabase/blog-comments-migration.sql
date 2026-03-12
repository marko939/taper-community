-- Blog comments table
CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  vote_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_comments_post ON blog_comments(blog_post_id, created_at);

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blog comments" ON blog_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can create blog comments" ON blog_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update blog comments" ON blog_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owner can delete blog comments" ON blog_comments FOR DELETE USING (auth.uid() = user_id);

-- Add comment_count to blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS comment_count INT DEFAULT 0;
