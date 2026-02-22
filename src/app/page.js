'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import Hero from '@/components/home/Hero';
import RecentActivity from '@/components/home/RecentActivity';
import ForumSections from '@/components/home/ForumSections';
import DrugQuickLinks from '@/components/home/DrugQuickLinks';
import PatientDashboard from '@/components/home/PatientDashboard';

const DeprescribingMap = dynamic(
  () => import('@/components/home/DeprescribingMap'),
  { ssr: false }
);

export default function HomePage() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  // Signed-in: show patient dashboard
  if (user) {
    return (
      <div className="space-y-12">
        <PatientDashboard user={user} profile={profile} />
      </div>
    );
  }

  // Signed-out: show marketing/landing page
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
