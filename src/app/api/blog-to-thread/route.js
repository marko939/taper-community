import { createClient } from '@supabase/supabase-js';

const ADMIN_USER_ID = '8572637a-2109-4471-bcb4-3163d04094d0';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function POST(request) {
  try {
    const { blog_post_id, forum_slugs } = await request.json();

    if (!blog_post_id || !Array.isArray(forum_slugs) || forum_slugs.length === 0) {
      return Response.json(
        { error: 'Missing required fields: blog_post_id (string) and forum_slugs (non-empty array)' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Fetch the blog post
    const { data: post, error: postErr } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, tags, published, forum_thread_id')
      .eq('id', blog_post_id)
      .single();

    if (postErr || !post) {
      return Response.json({ error: 'Blog post not found' }, { status: 404 });
    }

    if (!post.published) {
      return Response.json({ error: 'Blog post is not published' }, { status: 400 });
    }

    if (post.forum_thread_id) {
      return Response.json(
        { error: 'Blog post already has a forum thread', threadId: post.forum_thread_id },
        { status: 409 }
      );
    }

    // Look up forums by slug
    const { data: forums, error: forumsErr } = await supabase
      .from('forums')
      .select('id, slug')
      .in('slug', forum_slugs);

    if (forumsErr || !forums || forums.length === 0) {
      return Response.json({ error: 'No matching forums found for slugs: ' + forum_slugs.join(', ') }, { status: 404 });
    }

    // Also check drug_slug for drug-specific forums
    let allForums = forums;
    if (forums.length < forum_slugs.length) {
      const missingSlugs = forum_slugs.filter((s) => !forums.find((f) => f.slug === s));
      if (missingSlugs.length > 0) {
        const { data: drugForums } = await supabase
          .from('forums')
          .select('id, slug, drug_slug')
          .in('drug_slug', missingSlugs);
        if (drugForums && drugForums.length > 0) {
          allForums = [...forums, ...drugForums];
        }
      }
    }

    if (allForums.length === 0) {
      return Response.json({ error: 'No matching forums found' }, { status: 404 });
    }

    // Build thread body: excerpt + link to full article
    const excerpt = post.excerpt || '';
    const body = excerpt
      ? `${excerpt}\n\n[Read the full article →](/resources/blog/${post.slug})`
      : `[Read the full article →](/resources/blog/${post.slug})`;

    const tags = post.tags && post.tags.length > 0 ? post.tags : ['blog'];

    // Create the thread
    const { data: thread, error: threadErr } = await supabase
      .from('threads')
      .insert({
        user_id: ADMIN_USER_ID,
        forum_id: allForums[0].id,
        title: post.title,
        body,
        tags,
      })
      .select('id')
      .single();

    if (threadErr) {
      console.error('[blog-to-thread] Thread insert failed:', threadErr);
      return Response.json({ error: threadErr.message }, { status: 500 });
    }

    // Link thread to all selected forums
    const forumLinks = allForums.map((f) => ({
      thread_id: thread.id,
      forum_id: f.id,
    }));

    const { error: linkErr } = await supabase
      .from('thread_forums')
      .insert(forumLinks);

    if (linkErr) {
      console.error('[blog-to-thread] Forum link failed:', linkErr);
    }

    // Update blog post with the thread id
    const { error: updateErr } = await supabase
      .from('blog_posts')
      .update({ forum_thread_id: thread.id })
      .eq('id', blog_post_id);

    if (updateErr) {
      console.error('[blog-to-thread] Blog post update failed:', updateErr);
    }

    return Response.json({
      success: true,
      threadId: thread.id,
      forums: allForums.map((f) => f.slug || f.drug_slug),
    });
  } catch (err) {
    console.error('[blog-to-thread] Error:', err);
    return Response.json({ error: 'Failed to create forum thread' }, { status: 500 });
  }
}
