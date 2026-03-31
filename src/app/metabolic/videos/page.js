import VideoGrid from '@/components/metabolic/VideoGrid';

export const metadata = {
  title: 'Videos & Talks — Metabolic Health & Diet | TaperCommunity',
  description:
    'Watch curated talks from Dr. Chris Palmer, Dr. Georgia Ede, and other metabolic psychiatry researchers. Beginner to deep dive.',
  alternates: { canonical: '/metabolic/videos' },
};

export default function VideosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-6 sm:px-6">
      <VideoGrid />
    </div>
  );
}
