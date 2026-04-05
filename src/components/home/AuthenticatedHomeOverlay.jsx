'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Hero from '@/components/home/Hero';
import PatientDashboard from '@/components/home/PatientDashboard';
import InvitePrompt from '@/components/journal/InvitePrompt';
import { useRouteCleanup } from '@/hooks/useRouteCleanup';

export default function AuthenticatedHomeOverlay() {
  useRouteCleanup();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    const landing = document.getElementById('landing-content');
    if (!landing) return;
    landing.style.display = user ? 'none' : '';
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="space-y-12">
      <Hero />
      <PatientDashboard user={user} profile={profile} />
      <InvitePrompt trigger="habit" userId={user.id} />
    </div>
  );
}
