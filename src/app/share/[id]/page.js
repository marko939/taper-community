import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ShareClient from './ShareClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: async () => (await cookies()).getAll() } }
  );

  const { data } = await supabase
    .from('shared_journeys')
    .select('journey_snapshot, share_context')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (!data) return { title: 'Shared Taper Journey — TaperCommunity' };

  const snap = data.journey_snapshot;
  const drug = snap?.profile?.drug || 'medication';
  const name = snap?.profile?.display_name || 'Someone';

  return {
    title: `${name}'s ${drug} Taper — TaperCommunity`,
    description: `Follow ${name}'s ${drug} taper journey on TaperCommunity.`,
    openGraph: {
      title: `${name}'s ${drug} Taper Journey`,
      description: `See how ${name} is progressing through their ${drug} taper.`,
      siteName: 'TaperCommunity',
    },
  };
}

export default async function SharePage({ params }) {
  const { id } = await params;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: async () => (await cookies()).getAll() } }
  );

  const { data, error } = await supabase
    .from('shared_journeys')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) notFound();

  // Increment view count (fire-and-forget, no await)
  supabase
    .from('shared_journeys')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', id)
    .then(() => {});

  return <ShareClient share={data} />;
}
