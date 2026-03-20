-- Fix: Include thread followers in reply notifications
-- Previously only notified thread author + previous repliers.
-- Now also notifies users who explicitly followed the thread via thread_follows table.

CREATE OR REPLACE FUNCTION public.handle_reply_notify()
RETURNS trigger AS $$
DECLARE
  v_thread record;
  v_actor_name text;
  v_recipients uuid[];
  v_recipient uuid;
  v_title text;
  v_body text;
BEGIN
  BEGIN
    SELECT id, user_id, title INTO v_thread
      FROM public.threads WHERE id = new.thread_id;

    SELECT display_name INTO v_actor_name
      FROM public.profiles WHERE id = new.user_id;

    v_title := v_actor_name || ' replied to "' || left(v_thread.title, 80) || '"';
    v_body := left(new.body, 200);

    SELECT array_agg(DISTINCT uid) INTO v_recipients
    FROM (
      SELECT v_thread.user_id AS uid
      UNION
      SELECT r.user_id AS uid FROM public.replies r WHERE r.thread_id = new.thread_id
      UNION
      SELECT tf.user_id AS uid FROM public.thread_follows tf WHERE tf.thread_id = new.thread_id
    ) participants
    WHERE uid != new.user_id;

    IF v_recipients IS NOT NULL THEN
      FOREACH v_recipient IN ARRAY v_recipients LOOP
        INSERT INTO public.notifications (user_id, type, thread_id, reply_id, actor_id, title, body)
        VALUES (v_recipient, 'thread_reply', new.thread_id, new.id, new.user_id, v_title, v_body);
      END LOOP;
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'handle_reply_notify failed: %', sqlerrm;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
