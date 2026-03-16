-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  body TEXT NOT NULL,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  meta_description TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  comment_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, created_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can read published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Authenticated users can read all posts (for admin)
CREATE POLICY "Auth users can read all blog posts" ON blog_posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Author can insert
CREATE POLICY "Author can create blog posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Author can update
CREATE POLICY "Author can update blog posts" ON blog_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Author can delete
CREATE POLICY "Author can delete blog posts" ON blog_posts
  FOR DELETE USING (auth.uid() = author_id);
