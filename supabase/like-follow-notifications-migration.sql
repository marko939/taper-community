-- Add post_like and new_follower notification types
-- When someone likes a user's post or follows them, a notification is created.

-- Step 1: Widen the notification type constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('thread_reply', 'reply_mention', 'badge', 'achievement', 'forum_new_thread', 'post_like', 'new_follower'));

-- Step 2: RLS — allow authenticated users to insert notifications (as actor)
-- This is needed for client-side notification creation (follows, badges)
CREATE POLICY "Auth users create notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- Step 3: RLS — allow actors to delete their own unread notifications (for unlike/unfollow cleanup)
CREATE POLICY "Actors delete own unread notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = actor_id AND read = false);
