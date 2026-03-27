-- Fix blog_comments foreign key: point to profiles instead of auth.users
-- so Supabase can resolve the profiles:user_id(...) join.
ALTER TABLE blog_comments DROP CONSTRAINT blog_comments_user_id_fkey;
ALTER TABLE blog_comments ADD CONSTRAINT blog_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id);
