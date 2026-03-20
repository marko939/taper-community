-- Add forum_new_thread notification type and trigger
-- When a new thread is created, notify all followers of the forum(s) it belongs to.

-- Step 1: Widen the notification type constraint to allow 'forum_new_thread'
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('thread_reply', 'reply_mention', 'badge', 'achievement', 'forum_new_thread'));

-- Step 2: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_thread_notify_followers()
RETURNS trigger AS $$
DECLARE
  v_actor_name text;
  v_forum record;
  v_recipients uuid[];
  v_recipient uuid;
  v_title text;
  v_body text;
BEGIN
  BEGIN
    SELECT display_name INTO v_actor_name FROM public.profiles WHERE id = new.user_id;

    -- Get all forums this thread belongs to (via thread_forums junction)
    FOR v_forum IN
      SELECT f.id, f.name FROM public.thread_forums tf
      JOIN public.forums f ON f.id = tf.forum_id
      WHERE tf.thread_id = new.id
    LOOP
      SELECT array_agg(DISTINCT ff.follower_id) INTO v_recipients
      FROM public.forum_follows ff
      WHERE ff.forum_id = v_forum.id
        AND ff.follower_id != new.user_id;

      v_title := v_actor_name || ' posted in "' || v_forum.name || '"';
      v_body := left(new.title, 200);

      IF v_recipients IS NOT NULL THEN
        FOREACH v_recipient IN ARRAY v_recipients LOOP
          INSERT INTO public.notifications (user_id, type, thread_id, actor_id, title, body)
          VALUES (v_recipient, 'forum_new_thread', new.id, new.user_id, v_title, v_body);
        END LOOP;
      END IF;
    END LOOP;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'handle_new_thread_notify_followers failed: %', sqlerrm;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger (drop first if exists to be safe)
DROP TRIGGER IF EXISTS on_thread_notify_forum_followers ON public.threads;
CREATE TRIGGER on_thread_notify_forum_followers
  AFTER INSERT ON public.threads
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_thread_notify_followers();
