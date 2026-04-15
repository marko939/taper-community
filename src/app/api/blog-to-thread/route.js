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
    const { blog_post_id, forum_slugs } = await request.json();

    if (!blog_post_id || !Array.isArray(forum_slugs) || forum_slugs.length === 0) {
      return Response.json(
        { error: 'Missing required fields: blog_post_id (string) and forum_slugs (non-empty array)' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: post, error: postErr } = await supabase
      .from('blog_posts')
      .select('id, title, slug, published, forum_slugs')
      .eq('id', blog_post_id)
      .single();

    if (postErr || !post) {
      return Response.json({ error: 'Blog post not found' }, { status: 404 });
    }

    if (!post.published) {
      return Response.json({ error: 'Blog post is not published' }, { status: 400 });
    }

    const { data: forums } = await supabase
      .from('forums')
      .select('slug, drug_slug');

    const validSlugs = new Set();
    for (const f of (forums || [])) {
      if (f.slug) validSlugs.add(f.slug);
      if (f.drug_slug) validSlugs.add(f.drug_slug);
    }

    const verified = forum_slugs.filter((s) => validSlugs.has(s));
    if (verified.length === 0) {
      return Response.json({ error: 'No matching forums found for slugs: ' + forum_slugs.join(', ') }, { status: 404 });
    }

    const { error: updateErr } = await supabase
      .from('blog_posts')
      .update({ forum_slugs: verified })
      .eq('id', blog_post_id);

    if (updateErr) {
      console.error('[blog-to-thread] Update failed:', updateErr);
      return Response.json({ error: updateErr.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      forum_slugs: verified,
    });
  } catch (err) {
    console.error('[blog-to-thread] Error:', err);
    return Response.json({ error: 'Failed to assign blog post to forums' }, { status: 500 });
  }
}
