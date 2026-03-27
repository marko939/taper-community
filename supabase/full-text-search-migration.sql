-- Full-Text Search Migration
-- Adds tsvector generated columns and GIN indexes for comprehensive search
-- across threads (title + body) and replies (body)

-- 1. Add FTS column to threads (combines title and body)
ALTER TABLE threads ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_threads_fts ON threads USING gin(fts);

-- 2. Add FTS column to replies (body only)
ALTER TABLE replies ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(body, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_replies_fts ON replies USING gin(fts);

-- 3. Unified search function across threads and replies
CREATE OR REPLACE FUNCTION search_all(search_query text, result_limit int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  type text,
  title text,
  body_preview text,
  thread_id uuid,
  author_id uuid,
  author_name text,
  author_avatar text,
  created_at timestamptz,
  rank real
) AS $$
BEGIN
  RETURN QUERY

  -- Search threads (title + body)
  SELECT
    t.id,
    'thread'::text AS type,
    t.title,
    left(t.body, 200) AS body_preview,
    t.id AS thread_id,
    t.user_id AS author_id,
    p.display_name AS author_name,
    p.avatar_url AS author_avatar,
    t.created_at,
    ts_rank(t.fts, websearch_to_tsquery('english', search_query)) AS rank
  FROM threads t
  JOIN profiles p ON p.id = t.user_id
  WHERE t.fts @@ websearch_to_tsquery('english', search_query)

  UNION ALL

  -- Search replies (body)
  SELECT
    r.id,
    'reply'::text AS type,
    null::text AS title,
    left(r.body, 200) AS body_preview,
    r.thread_id,
    r.user_id AS author_id,
    p.display_name AS author_name,
    p.avatar_url AS author_avatar,
    r.created_at,
    ts_rank(r.fts, websearch_to_tsquery('english', search_query)) AS rank
  FROM replies r
  JOIN profiles p ON p.id = r.user_id
  WHERE r.fts @@ websearch_to_tsquery('english', search_query)

  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;
