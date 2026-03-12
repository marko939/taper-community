import { createClient } from '@/lib/supabase/server';
import ForumsPageClient from '@/components/forums/ForumsPageClient';

export const metadata = {
  title: 'Forums — Medication Tapering Community | TaperCommunity',
  description: 'Connect with others tapering psychiatric medications. Drug-specific forums for SSRIs, SNRIs, benzos, and more. Share experiences and get peer support.',
  alternates: { canonical: '/forums' },
};

export default async function ForumsPage() {
  // Server-fetch forums + recent threads for SEO — Googlebot gets real content
  let forums = [];
  let recentThreads = [];

  try {
    const supabase = await createClient();
    const { data: forumData } = await supabase
      .from('forums')
      .select('id, name, slug, drug_slug, description, category, drug_class, post_count')
      .order('name');
    forums = forumData || [];

    const { data: threadData } = await supabase
      .from('threads')
      .select('id, title, created_at, profiles:user_id(display_name), thread_forums(forums:forum_id(name))')
      .order('created_at', { ascending: false })
      .limit(50);
    recentThreads = threadData || [];
  } catch {
    // Fail silently — client component will fetch its own data
  }

  return (
    <>
      <ForumsPageClient />
      {/* Server-rendered content for search engine crawlers */}
      <div className="sr-only" aria-hidden="false">
        <h1>TaperCommunity Forums — Medication Tapering Peer Support</h1>
        <p>
          Connect with others who understand your tapering journey. Browse forums by
          topic or find your medication-specific community. Drug-specific forums for
          SSRIs, SNRIs, benzodiazepines, TCAs, antipsychotics, and more.
        </p>
        <h2>Forum Categories</h2>
        <ul>
          {forums.map((f) => (
            <li key={f.id}>
              <a href={`/forums/${f.drug_slug || f.slug}`}>
                {f.name} — {f.description || f.category} ({f.post_count ?? 0} posts)
              </a>
            </li>
          ))}
        </ul>
        <h2>Recent Discussions</h2>
        <ul>
          {recentThreads.map((t) => (
            <li key={t.id}>
              <a href={`/thread/${t.id}`}>
                {t.title}
              </a>
              {' — '}
              {t.profiles?.display_name || 'Member'}
              {t.thread_forums?.[0]?.forums?.name && ` in ${t.thread_forums[0].forums.name}`}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
