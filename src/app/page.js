'use client';

import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import RecentActivity from '@/components/home/RecentActivity';
import ForumSections from '@/components/home/ForumSections';
import DrugQuickLinks from '@/components/home/DrugQuickLinks';

const DeprescribingMap = dynamic(
  () => import('@/components/home/DeprescribingMap'),
  { ssr: false }
);

export default function HomePage() {
  return (
    <div className="space-y-12">
      <Hero />
      <RecentActivity />
      <ForumSections />
      <DrugQuickLinks />
      <DeprescribingMap compact />
    </div>
  );
}
