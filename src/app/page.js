'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import Hero from '@/components/home/Hero';
import CommunityPulse from '@/components/home/CommunityPulse';
import ForumSections from '@/components/home/ForumSections';
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
      <CommunityPulse large />
      <ForumSections />
      <DeprescribingMap compact />
    </div>
  );
}
