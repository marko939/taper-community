import { createClient } from '@supabase/supabase-js';
import { DRUG_LIST } from '@/lib/drugs';

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  const staticPages = [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/forums`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/education`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/resources`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/deprescribers`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/drugs`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/auth/signin`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/auth/signup`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/join`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/compare/survivingantidepressants`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/compare/benzobuddies`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const drugPages = DRUG_LIST.map((drug) => ({
    url: `${siteUrl}/drugs/${drug.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const forumPages = DRUG_LIST.map((drug) => ({
    url: `${siteUrl}/forums/${drug.slug}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  // Fetch published blog posts for sitemap
  let blogPages = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true);

    if (posts) {
      blogPages = posts.map((post) => ({
        url: `${siteUrl}/resources/blog/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : undefined,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }
  } catch {
    // Supabase unavailable at build time — skip blog pages
  }

  return [...staticPages, ...drugPages, ...forumPages, ...blogPages];
}
