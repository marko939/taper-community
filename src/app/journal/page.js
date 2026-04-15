'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useJournalStore } from '@/stores/journalStore';
import { useAssessmentStore } from '@/stores/assessmentStore';
import JournalEntryForm from '@/components/journal/JournalEntryForm';
import JournalChart from '@/components/journal/JournalChart';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import DosePercentage from '@/components/journal/DosePercentage';
import SymptomHeatmap from '@/components/journal/SymptomHeatmap';
import HowOthersFelt from '@/components/journal/HowOthersFelt';
import AssessmentCard from '@/components/journal/AssessmentCard';
import AssessmentChart from '@/components/journal/AssessmentChart';
import InvitePrompt from '@/components/journal/InvitePrompt';
import ProviderPDFButton from '@/components/journal/ProviderPDFButton';
import MilestoneShareModal from '@/components/journal/MilestoneShareModal';
import ShareJourneyModal from '@/components/journal/ShareJourneyModal';
import { detectMilestones } from '@/lib/milestones';
import { useNotificationStore } from '@/stores/notificationStore';
import { labelPHQ, labelGAD, severityColor } from '@/lib/assessments';
import { PageLoading } from '@/components/shared/LoadingSpinner';

export default function JournalPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.loading);
  const entries = useJournalStore((s) => s.entries);
  const loading = useJournalStore((s) => s.loading);
  const fetchEntries = useJournalStore((s) => s.fetchEntries);
  const addEntry = useJournalStore((s) => s.addEntry);
  const getShareLink = useJournalStore((s) => s.getShareLink);
  const assessments = useAssessmentStore((s) => s.assessments);
  const assessmentsFetchError = useAssessmentStore((s) => s.fetchError);
  const fetchAssessments = useAssessmentStore((s) => s.fetchAssessments);
  const [shareUrl, setShareUrl] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [shareMode, setShareMode] = useState(null); // 'clinical' | 'personal' | null
  const [tab, setTab] = useState('doseMood'); // 'doseMood' | 'assessments'
  const [chartType, setChartType] = useState('doseMood'); // 'doseMood' | 'assessments'
  const [inviteTrigger, setInviteTrigger] = useState(null);
  const [activeMilestone, setActiveMilestone] = useState(null);

  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchAssessments();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading) return <PageLoading />;

  if (!user) {
    return (
      <div className="space-y-6">
        <section
          className="relative overflow-hidden rounded-[24px]"
          style={{ boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)' }}
        >
          <div className="absolute inset-0">
            <img src="/hero-bg.jpg" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(42,18,80,0.35)' }} />
          <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">
                Taper Journal
              </p>
              <h1 className="font-serif text-[30px] font-semibold leading-tight text-white sm:text-[36px]">
                Share your{' '}
                <span style={{ color: '#2EC4B6' }}>taper journey</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[15px] font-semibold leading-relaxed text-white/80">
                Document your journey and share it with the people who care. Sign in to start.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-[14px] font-semibold text-white no-underline transition hover:opacity-90"
                  style={{ background: '#2EC4B6' }}
                >
                  Join Community
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-8 py-3 text-[14px] font-semibold text-white/80 no-underline transition hover:border-white/30 hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        <TaperStatsCard />
      </div>
    );
  }

  if (loading) return <PageLoading />;

  const handleSubmit = async (entry) => {
    const beforeMilestones = detectMilestones(entries, profile)
      .filter((m) => m.achieved)
      .map((m) => m.id);

    await addEntry(entry);

    const updatedEntries = useJournalStore.getState().entries;
    const afterMilestones = detectMilestones(updatedEntries, profile);
    const newlyAchieved = afterMilestones.find(
      (m) => m.achieved && !beforeMilestones.includes(m.id)
    );
    if (newlyAchieved) {
      setActiveMilestone(newlyAchieved);
      useNotificationStore.getState().createBadgeNotification(newlyAchieved);
    }

    if (entry.mood_score <= 4) {
      setInviteTrigger('low_mood');
    } else if (entries.length === 2) {
      setInviteTrigger('habit');
    }
  };

  const handleShare = async () => {
    setSharing(true);
    const token = await getShareLink();
    if (token) {
      setShareUrl(`${window.location.origin}/journal/${token}`);
    }
    setSharing(false);
  };

  // Assessment history sorted newest first
  const sortedAssessments = [...assessments].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-xl text-foreground sm:text-3xl">Taper Journal</h1>
        <p className="mt-1 text-sm text-text-muted">
          Document and share your taper progress.
        </p>
      </div>

      {tab === 'doseMood' && (
        <>
          {entries.length === 0 ? (
            /* Empty state — hero style */
            <div
              className="relative overflow-hidden rounded-2xl px-5 py-10 text-center sm:rounded-[24px] sm:px-8 sm:py-16"
              style={{ boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)' }}
            >
              <div className="absolute inset-0">
                <img src="/hero-bg.jpg" alt="" className="h-full w-full object-cover" />
              </div>
              <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(42,18,80,0.35)' }} />
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white sm:text-2xl">Start your taper journal</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
                  Your first entry begins your story — charts, insights, and a journey worth sharing.
                </p>
                <button
                  onClick={() => document.getElementById('entry-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="mt-6 inline-block rounded-lg px-6 py-2.5 text-sm font-bold transition hover:opacity-90"
                  style={{ background: 'white', color: 'var(--purple)' }}
                >
                  Log your first entry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Share buttons — above chart */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShareMode('clinical')}
                  className="btn btn-primary flex-1 text-sm"
                >
                  <svg className="mr-1.5 inline h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  Send to my prescriber
                </button>
                <button
                  onClick={() => setShareMode('personal')}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  <svg className="mr-1.5 inline h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  <span className="sm:hidden">Send to a friend</span>
                  <span className="hidden sm:inline">Show someone who supports me</span>
                </button>
              </div>

              {/* Chart — bleeds to viewport edges on mobile, card on desktop */}
              <div className="-mx-4 -mt-2 sm:mx-0 sm:mt-0 sm:card" data-chart="mood">
                <h2 className="mb-1 px-4 text-sm font-semibold text-foreground sm:mb-4 sm:px-0 sm:text-lg">Your Taper Progress</h2>
                {chartType === 'doseMood' ? (
                  <JournalChart entries={entries} assessments={assessments} />
                ) : (
                  assessments.length > 0 ? (
                    <AssessmentChart assessments={assessments} entries={entries} />
                  ) : assessmentsFetchError ? (
                    <p className="px-4 py-8 text-center text-sm text-red-600 sm:px-0">Couldn&apos;t load your assessments. Please refresh.</p>
                  ) : (
                    <p className="px-4 py-8 text-center text-sm text-text-muted sm:px-0">No assessments yet. Take a PHQ-9 or GAD-7 to see scores here.</p>
                  )
                )}
                {/* Chart type toggle */}
                <div className="mt-3 flex justify-center gap-2 px-4 pb-2 sm:px-0">
                  <button
                    onClick={() => setChartType('doseMood')}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                    style={{
                      background: chartType === 'doseMood' ? 'var(--purple)' : 'var(--purple-ghost)',
                      color: chartType === 'doseMood' ? 'white' : 'var(--text-muted)',
                    }}
                  >
                    Dose & Mood
                  </button>
                  <button
                    onClick={() => setChartType('assessments')}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                    style={{
                      background: chartType === 'assessments' ? 'var(--purple)' : 'var(--purple-ghost)',
                      color: chartType === 'assessments' ? 'white' : 'var(--text-muted)',
                    }}
                  >
                    Assessments
                  </button>
                </div>
              </div>

              {/* How Others Felt + Dose Progress — side by side under chart */}
              {entries.length >= 2 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <HowOthersFelt entries={entries} />
                  <DosePercentage entries={entries} />
                </div>
              )}
            </>
          )}

          {/* Log an Entry — always rendered so new users can create their first entry */}
          <div className="card" id="entry-form">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Log an Entry</h2>
            <JournalEntryForm onSubmit={handleSubmit} entryCount={entries.length} />
          </div>

          {/* Export */}
          {entries.length > 0 && (
            <ProviderPDFButton entries={entries} profile={profile || {}} assessments={assessments} />
          )}

          {/* Assessments section */}
          <div id="assessment-card">
            <AssessmentCard assessments={assessments} />
          </div>

          {/* Invite prompt */}
          {inviteTrigger && <InvitePrompt trigger={inviteTrigger} userId={user.id} />}

          {/* Entry History */}
          {entries.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Entry History</h2>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <JournalEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Share journey modal */}
      {shareMode && (
        <ShareJourneyModal
          mode={shareMode}
          entries={entries}
          profile={profile}
          assessments={assessments}
          onClose={() => setShareMode(null)}
        />
      )}

      {/* Milestone share modal */}
      {activeMilestone && (
        <MilestoneShareModal
          milestone={activeMilestone}
          profile={profile}
          entries={entries}
          onClose={() => setActiveMilestone(null)}
        />
      )}

      {/* Hidden off-screen charts for PDF capture (always in DOM) */}
      {entries.length > 0 && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '700px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
          <div data-chart="mood-pdf" style={{ width: '700px', height: '350px' }}>
            <JournalChart entries={entries} assessments={assessments} />
          </div>
          {assessments.length > 0 && (
            <div data-chart="assessment-pdf" style={{ width: '700px', height: '350px' }}>
              <AssessmentChart assessments={assessments} entries={entries} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaperStatsCard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('journal_entries')
        .select('user_id, drug, dose_numeric, date')
        .not('dose_numeric', 'is', null)
        .order('date', { ascending: true });

      if (!data || data.length === 0) return;

      const byUserDrug = {};
      const uniqueDrugs = new Set();

      data.forEach((e) => {
        if (!e.drug || e.dose_numeric == null) return;
        uniqueDrugs.add(e.drug);
        const key = `${e.user_id}::${e.drug}`;
        if (!byUserDrug[key]) byUserDrug[key] = { first: e.dose_numeric, latest: e.dose_numeric };
        byUserDrug[key].latest = e.dose_numeric;
      });

      let totalReduced = 0;
      Object.values(byUserDrug).forEach(({ first, latest }) => {
        if (first > latest) totalReduced += first - latest;
      });

      setStats({
        medications: uniqueDrugs.size,
        totalReduced: Math.round(totalReduced * 10) / 10,
      });
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  return (
    <div
      className="rounded-2xl border p-6"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
    >
      <h2 className="mb-4 text-center text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--purple)' }}>
        Community Impact
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-5 text-center" style={{ background: 'var(--purple-ghost)' }}>
          <div className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{stats.medications}</p>
          <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Medications in Community Journals</p>
        </div>
        <div className="rounded-xl p-5 text-center" style={{ background: 'var(--purple-ghost)' }}>
          <div className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </div>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{stats.totalReduced} mg</p>
          <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total Medication Reduced</p>
        </div>
      </div>
    </div>
  );
}
