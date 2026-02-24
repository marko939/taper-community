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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--purple)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

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
