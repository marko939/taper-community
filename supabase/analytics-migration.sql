-- ============================================================
-- ANALYTICS MIGRATION
-- Run this in Supabase SQL Editor before using /admin/analytics
-- ============================================================

-- Add is_admin to profiles if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set Marko as admin
UPDATE public.profiles SET is_admin = true
WHERE id = '8572637a-2109-4471-bcb4-3163d04094d0';

-- ============================================================
-- RPC: analytics_journal_stats
-- Returns aggregate journal/taper tracker stats (bypasses RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION public.analytics_journal_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'users_with_entries', (SELECT COUNT(DISTINCT user_id) FROM public.journal_entries),
    'checkins_today', (SELECT COUNT(*) FROM public.journal_entries WHERE created_at >= CURRENT_DATE),
    'checkins_this_week', (SELECT COUNT(*) FROM public.journal_entries WHERE created_at >= DATE_TRUNC('week', NOW())),
    'checkins_this_month', (SELECT COUNT(*) FROM public.journal_entries WHERE created_at >= DATE_TRUNC('month', NOW())),
    'avg_checkins_per_user_per_week', (
      SELECT COALESCE(ROUND(AVG(cnt)::numeric, 1), 0)
      FROM (
        SELECT user_id, COUNT(*) as cnt
        FROM public.journal_entries
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY user_id
      ) sub
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- ============================================================
-- RPC: analytics_signup_series
-- Returns daily signup counts for the given number of days
-- ============================================================
CREATE OR REPLACE FUNCTION public.analytics_signup_series(days_back integer DEFAULT 30)
RETURNS TABLE(date date, new_users bigint, cumulative bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH daily AS (
    SELECT
      DATE_TRUNC('day', p.joined_at)::date AS d,
      COUNT(*) AS cnt
    FROM public.profiles p
    WHERE p.joined_at >= NOW() - (days_back || ' days')::interval
    GROUP BY d
  )
  SELECT
    daily.d AS date,
    daily.cnt AS new_users,
    SUM(daily.cnt) OVER (ORDER BY daily.d) AS cumulative
  FROM daily
  ORDER BY daily.d ASC;
END;
$$;

-- ============================================================
-- RPC: analytics_retention
-- Returns D1/D7/D30 retention rates
-- ============================================================
CREATE OR REPLACE FUNCTION public.analytics_retention()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  d1_cohort bigint;
  d1_returned bigint;
  d7_cohort bigint;
  d7_returned bigint;
  d30_cohort bigint;
  d30_returned bigint;
BEGIN
  -- D1: users who signed up 1-2 days ago, came back within 24h
  SELECT COUNT(*) INTO d1_cohort
  FROM public.profiles
  WHERE joined_at BETWEEN NOW() - INTERVAL '2 days' AND NOW() - INTERVAL '1 day';

  SELECT COUNT(DISTINCT p.id) INTO d1_returned
  FROM public.profiles p
  WHERE p.joined_at BETWEEN NOW() - INTERVAL '2 days' AND NOW() - INTERVAL '1 day'
    AND (
      EXISTS (SELECT 1 FROM public.threads t WHERE t.user_id = p.id AND t.created_at > p.joined_at + INTERVAL '1 hour')
      OR EXISTS (SELECT 1 FROM public.replies r WHERE r.user_id = p.id AND r.created_at > p.joined_at + INTERVAL '1 hour')
    );

  -- D7: users who signed up 7-14 days ago
  SELECT COUNT(*) INTO d7_cohort
  FROM public.profiles
  WHERE joined_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days';

  SELECT COUNT(DISTINCT p.id) INTO d7_returned
  FROM public.profiles p
  WHERE p.joined_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'
    AND (
      EXISTS (SELECT 1 FROM public.threads t WHERE t.user_id = p.id AND t.created_at > p.joined_at + INTERVAL '7 days')
      OR EXISTS (SELECT 1 FROM public.replies r WHERE r.user_id = p.id AND r.created_at > p.joined_at + INTERVAL '7 days')
    );

  -- D30: users who signed up 30-60 days ago
  SELECT COUNT(*) INTO d30_cohort
  FROM public.profiles
  WHERE joined_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days';

  SELECT COUNT(DISTINCT p.id) INTO d30_returned
  FROM public.profiles p
  WHERE p.joined_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
    AND (
      EXISTS (SELECT 1 FROM public.threads t WHERE t.user_id = p.id AND t.created_at > p.joined_at + INTERVAL '30 days')
      OR EXISTS (SELECT 1 FROM public.replies r WHERE r.user_id = p.id AND r.created_at > p.joined_at + INTERVAL '30 days')
    );

  SELECT json_build_object(
    'd1_cohort', d1_cohort,
    'd1_returned', d1_returned,
    'd1_pct', CASE WHEN d1_cohort > 0 THEN ROUND(d1_returned::numeric / d1_cohort * 100, 1) ELSE 0 END,
    'd7_cohort', d7_cohort,
    'd7_returned', d7_returned,
    'd7_pct', CASE WHEN d7_cohort > 0 THEN ROUND(d7_returned::numeric / d7_cohort * 100, 1) ELSE 0 END,
    'd30_cohort', d30_cohort,
    'd30_returned', d30_returned,
    'd30_pct', CASE WHEN d30_cohort > 0 THEN ROUND(d30_returned::numeric / d30_cohort * 100, 1) ELSE 0 END
  ) INTO result;
  RETURN result;
END;
$$;

-- Grant execute to authenticated users (admin check happens in app code)
GRANT EXECUTE ON FUNCTION public.analytics_journal_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_signup_series(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_retention() TO authenticated;
