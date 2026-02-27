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
-- Returns D1/D7/D30 retention rates for current cohort + all-time
-- "Returned" = any activity: post, reply, vote, helpful vote, or journal entry
-- ============================================================
CREATE OR REPLACE FUNCTION public.analytics_retention()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  -- Current cohort
  c_d1_cohort bigint; c_d1_returned bigint;
  c_d7_cohort bigint; c_d7_returned bigint;
  c_d30_cohort bigint; c_d30_returned bigint;
  -- All-time
  a_d1_cohort bigint; a_d1_returned bigint;
  a_d7_cohort bigint; a_d7_returned bigint;
  a_d30_cohort bigint; a_d30_returned bigint;
BEGIN
  -- ── CURRENT COHORT ──

  -- D1: users who signed up 1-2 days ago
  SELECT COUNT(*) INTO c_d1_cohort
  FROM public.profiles
  WHERE joined_at BETWEEN NOW() - INTERVAL '2 days' AND NOW() - INTERVAL '1 day';

  SELECT COUNT(DISTINCT p.id) INTO c_d1_returned
  FROM public.profiles p
  WHERE p.joined_at BETWEEN NOW() - INTERVAL '2 days' AND NOW() - INTERVAL '1 day'
    AND (
      EXISTS (SELECT 1 FROM public.threads t WHERE t.user_id = p.id AND t.created_at > p.joined_at + INTERVAL '1 hour')
      OR EXISTS (SELECT 1 FROM public.replies r WHERE r.user_id = p.id AND r.created_at > p.joined_at + INTERVAL '1 hour')
      OR EXISTS (SELECT 1 FROM public.thread_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '1 hour')
      OR EXISTS (SELECT 1 FROM public.reply_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '1 hour')
      OR EXISTS (SELECT 1 FROM public.helpful_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '1 hour')
      OR EXISTS (SELECT 1 FROM public.journal_entries j WHERE j.user_id = p.id AND j.created_at > p.joined_at + INTERVAL '1 hour')
    );

  -- D7: users who signed up 7-14 days ago
  SELECT COUNT(*) INTO c_d7_cohort
  FROM public.profiles
  WHERE joined_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days';

  SELECT COUNT(DISTINCT p.id) INTO c_d7_returned
  FROM public.profiles p
  WHERE p.joined_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'
    AND (
      EXISTS (SELECT 1 FROM public.threads t WHERE t.user_id = p.id AND t.created_at > p.joined_at + INTERVAL '7 days')
      OR EXISTS (SELECT 1 FROM public.replies r WHERE r.user_id = p.id AND r.created_at > p.joined_at + INTERVAL '7 days')
      OR EXISTS (SELECT 1 FROM public.thread_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '7 days')
      OR EXISTS (SELECT 1 FROM public.reply_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '7 days')
      OR EXISTS (SELECT 1 FROM public.helpful_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '7 days')
      OR EXISTS (SELECT 1 FROM public.journal_entries j WHERE j.user_id = p.id AND j.created_at > p.joined_at + INTERVAL '7 days')
    );

  -- D30: users who signed up 30-60 days ago
  SELECT COUNT(*) INTO c_d30_cohort
  FROM public.profiles
  WHERE joined_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days';

  SELECT COUNT(DISTINCT p.id) INTO c_d30_returned
  FROM public.profiles p
  WHERE p.joined_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
    AND (
      EXISTS (SELECT 1 FROM public.threads t WHERE t.user_id = p.id AND t.created_at > p.joined_at + INTERVAL '30 days')
      OR EXISTS (SELECT 1 FROM public.replies r WHERE r.user_id = p.id AND r.created_at > p.joined_at + INTERVAL '30 days')
      OR EXISTS (SELECT 1 FROM public.thread_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '30 days')
      OR EXISTS (SELECT 1 FROM public.reply_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '30 days')
      OR EXISTS (SELECT 1 FROM public.helpful_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '30 days')
      OR EXISTS (SELECT 1 FROM public.journal_entries j WHERE j.user_id = p.id AND j.created_at > p.joined_at + INTERVAL '30 days')
    );

  -- ── ALL-TIME ──

  -- D1: all users who signed up more than 1 day ago
  SELECT COUNT(*) INTO a_d1_cohort
  FROM public.profiles
  WHERE joined_at < NOW() - INTERVAL '1 day';

  SELECT COUNT(DISTINCT p.id) INTO a_d1_returned
  FROM public.profiles p
  WHERE p.joined_at < NOW() - INTERVAL '1 day'
    AND (
      EXISTS (SELECT 1 FROM public.threads t WHERE t.user_id = p.id AND t.created_at > p.joined_at + INTERVAL '1 hour')
      OR EXISTS (SELECT 1 FROM public.replies r WHERE r.user_id = p.id AND r.created_at > p.joined_at + INTERVAL '1 hour')
      OR EXISTS (SELECT 1 FROM public.thread_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '1 hour')
      OR EXISTS (SELECT 1 FROM public.reply_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '1 hour')
      OR EXISTS (SELECT 1 FROM public.helpful_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '1 hour')
      OR EXISTS (SELECT 1 FROM public.journal_entries j WHERE j.user_id = p.id AND j.created_at > p.joined_at + INTERVAL '1 hour')
    );

  -- D7: all users who signed up more than 7 days ago
  SELECT COUNT(*) INTO a_d7_cohort
  FROM public.profiles
  WHERE joined_at < NOW() - INTERVAL '7 days';

  SELECT COUNT(DISTINCT p.id) INTO a_d7_returned
  FROM public.profiles p
  WHERE p.joined_at < NOW() - INTERVAL '7 days'
    AND (
      EXISTS (SELECT 1 FROM public.threads t WHERE t.user_id = p.id AND t.created_at > p.joined_at + INTERVAL '7 days')
      OR EXISTS (SELECT 1 FROM public.replies r WHERE r.user_id = p.id AND r.created_at > p.joined_at + INTERVAL '7 days')
      OR EXISTS (SELECT 1 FROM public.thread_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '7 days')
      OR EXISTS (SELECT 1 FROM public.reply_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '7 days')
      OR EXISTS (SELECT 1 FROM public.helpful_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '7 days')
      OR EXISTS (SELECT 1 FROM public.journal_entries j WHERE j.user_id = p.id AND j.created_at > p.joined_at + INTERVAL '7 days')
    );

  -- D30: all users who signed up more than 30 days ago
  SELECT COUNT(*) INTO a_d30_cohort
  FROM public.profiles
  WHERE joined_at < NOW() - INTERVAL '30 days';

  SELECT COUNT(DISTINCT p.id) INTO a_d30_returned
  FROM public.profiles p
  WHERE p.joined_at < NOW() - INTERVAL '30 days'
    AND (
      EXISTS (SELECT 1 FROM public.threads t WHERE t.user_id = p.id AND t.created_at > p.joined_at + INTERVAL '30 days')
      OR EXISTS (SELECT 1 FROM public.replies r WHERE r.user_id = p.id AND r.created_at > p.joined_at + INTERVAL '30 days')
      OR EXISTS (SELECT 1 FROM public.thread_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '30 days')
      OR EXISTS (SELECT 1 FROM public.reply_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '30 days')
      OR EXISTS (SELECT 1 FROM public.helpful_votes v WHERE v.user_id = p.id AND v.created_at > p.joined_at + INTERVAL '30 days')
      OR EXISTS (SELECT 1 FROM public.journal_entries j WHERE j.user_id = p.id AND j.created_at > p.joined_at + INTERVAL '30 days')
    );

  SELECT json_build_object(
    'current', json_build_object(
      'd1_cohort', c_d1_cohort, 'd1_returned', c_d1_returned,
      'd1_pct', CASE WHEN c_d1_cohort > 0 THEN ROUND(c_d1_returned::numeric / c_d1_cohort * 100, 1) ELSE 0 END,
      'd7_cohort', c_d7_cohort, 'd7_returned', c_d7_returned,
      'd7_pct', CASE WHEN c_d7_cohort > 0 THEN ROUND(c_d7_returned::numeric / c_d7_cohort * 100, 1) ELSE 0 END,
      'd30_cohort', c_d30_cohort, 'd30_returned', c_d30_returned,
      'd30_pct', CASE WHEN c_d30_cohort > 0 THEN ROUND(c_d30_returned::numeric / c_d30_cohort * 100, 1) ELSE 0 END
    ),
    'alltime', json_build_object(
      'd1_cohort', a_d1_cohort, 'd1_returned', a_d1_returned,
      'd1_pct', CASE WHEN a_d1_cohort > 0 THEN ROUND(a_d1_returned::numeric / a_d1_cohort * 100, 1) ELSE 0 END,
      'd7_cohort', a_d7_cohort, 'd7_returned', a_d7_returned,
      'd7_pct', CASE WHEN a_d7_cohort > 0 THEN ROUND(a_d7_returned::numeric / a_d7_cohort * 100, 1) ELSE 0 END,
      'd30_cohort', a_d30_cohort, 'd30_returned', a_d30_returned,
      'd30_pct', CASE WHEN a_d30_cohort > 0 THEN ROUND(a_d30_returned::numeric / a_d30_cohort * 100, 1) ELSE 0 END
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- Grant execute to authenticated users (admin check happens in app code)
GRANT EXECUTE ON FUNCTION public.analytics_journal_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_signup_series(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_retention() TO authenticated;
