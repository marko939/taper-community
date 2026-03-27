import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function POST(request) {
  try {
    const { userId, title, body } = await request.json();

    if (!userId || !title || !body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Look up the introductions forum
    const { data: forum, error: forumErr } = await supabase
      .from('forums')
      .select('id')
      .eq('slug', 'introductions')
      .single();

    if (forumErr || !forum) {
      console.error('[intro-post] Could not find introductions forum:', forumErr);
      return Response.json({ error: 'Introductions forum not found' }, { status: 404 });
    }

    // Create the thread
    const { data: thread, error: threadErr } = await supabase
      .from('threads')
      .insert({
        user_id: userId,
        forum_id: forum.id,
        title: title.trim(),
        body: body.trim(),
        tags: ['introduction'],
      })
      .select('id')
      .single();

    if (threadErr) {
      console.error('[intro-post] Thread insert failed:', threadErr);
      return Response.json({ error: threadErr.message }, { status: 500 });
    }

    // Link thread to introductions forum
    const { error: linkErr } = await supabase
      .from('thread_forums')
      .insert({ thread_id: thread.id, forum_id: forum.id });

    if (linkErr) {
      console.error('[intro-post] Forum link failed:', linkErr);
      // Thread was created, just log the link error
    }

    return Response.json({ success: true, threadId: thread.id });
  } catch (err) {
    console.error('[intro-post] Error:', err);
    return Response.json({ error: 'Failed to create intro post' }, { status: 500 });
  }
}
