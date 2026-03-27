import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import BlogPostContent from '@/components/blog/BlogPostContent';

async function getPost(slug) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('id, title, slug, body, cover_image_url, tags, published, meta_description, created_at, updated_at')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  return data;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found — TaperCommunity' };

  const description = post.meta_description || post.body?.slice(0, 155).replace(/\n/g, ' ') || '';

  return {
    title: `${post.title} — TaperCommunity`,
    description,
    alternates: { canonical: `/resources/blog/${slug}` },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-foreground">Post not found</p>
        <Link href="/resources" className="mt-4 inline-block text-sm text-purple hover:underline">
          Back to Resources
        </Link>
      </div>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Organization', name: 'TaperCommunity' },
    publisher: {
      '@type': 'Organization',
      name: 'TaperCommunity',
      logo: { '@type': 'ImageObject', url: 'https://taper.community/tapercommunity-logo.png' },
    },
    description: post.meta_description || post.body?.slice(0, 160),
    image: post.cover_image_url || 'https://taper.community/tapercommunity-logo.png',
    mainEntityOfPage: `https://taper.community/resources/blog/${slug}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://taper.community' },
      { '@type': 'ListItem', position: 2, name: 'Resources', item: 'https://taper.community/resources' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://taper.community/resources/blog/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogPostContent post={post} />
    </>
  );
}
