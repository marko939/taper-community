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
  const fetchAssessments = useAssessmentStore((s) => s.fetchAssessments);
  const [shareUrl, setShareUrl] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [tab, setTab] = useState('doseMood'); // 'doseMood' | 'assessments'
  const [inviteTrigger, setInviteTrigger] = useState(null);
  const [activeMilestone, setActiveMilestone] = useState(null);

  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchAssessments();
    }
  }, [user, fetchEntries, fetchAssessments]);

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
                Track your{' '}
                <span style={{ color: '#2EC4B6' }}>taper journey</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[15px] font-semibold leading-relaxed text-white/80">
                Track your doses, symptoms, and mood over time. Sign in to start journaling.
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Taper Journal</h1>
          <p className="mt-1 text-text-muted">
            Track your doses, symptoms, and mood over time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ProviderPDFButton entries={entries} profile={profile || {}} assessments={assessments} />
          {shareUrl ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="input w-64 text-xs"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="btn-secondary text-sm"
              >
                Copy
              </button>
            </div>
          ) : (
            <button
              onClick={handleShare}
              disabled={sharing}
              className="btn-secondary text-sm"
            >
              {sharing ? 'Generating...' : 'Share Journal'}
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
        <button
          onClick={() => setTab('doseMood')}
          className="flex-1 rounded-l-xl px-4 py-2.5 text-sm font-semibold transition"
          style={{
            background: tab === 'doseMood' ? 'var(--purple)' : 'transparent',
            color: tab === 'doseMood' ? 'white' : 'var(--text-muted)',
          }}
        >
          Dose & Mood
        </button>
        <button
          onClick={() => setTab('assessments')}
          className="flex-1 rounded-r-xl px-4 py-2.5 text-sm font-semibold transition"
          style={{
            background: tab === 'assessments' ? 'var(--purple)' : 'transparent',
            color: tab === 'assessments' ? 'white' : 'var(--text-muted)',
          }}
        >
          Assessments
        </button>
      </div>

      {/* ============ DOSE & MOOD TAB ============ */}
      {tab === 'doseMood' && (
        <>
          {entries.length === 0 ? (
            /* Empty state — hero style */
            <div
              className="relative overflow-hidden rounded-[24px] px-8 py-16 text-center"
              style={{ boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)' }}
            >
              <div className="absolute inset-0">
                <img src="/hero-bg.jpg" alt="" className="h-full w-full object-cover" />
              </div>
              <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(42,18,80,0.35)' }} />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white">Start tracking your taper</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
                  Log your first entry to see dose and mood charts, symptom heatmaps, and progress insights.
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
              {/* Chart */}
              <div className="card" data-chart="mood">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Your Taper Progress</h2>
                <JournalChart entries={entries} assessments={assessments} />
              </div>

              {/* Dose Progress + How Others Felt */}
              {entries.length >= 2 && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <DosePercentage entries={entries} />
                  <HowOthersFelt entries={entries} />
                </div>
              )}

              {/* Symptom Heatmap — disabled, keep for future use */}
              {/* <SymptomHeatmap entries={entries} /> */}
            </>
          )}

          {/* Entry Form */}
          <div className="card" id="entry-form">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Log an Entry</h2>
            <JournalEntryForm onSubmit={handleSubmit} entryCount={entries.length} />
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

      {/* ============ ASSESSMENTS TAB ============ */}
      {tab === 'assessments' && (
        <>
          {assessments.length === 0 ? (
            /* Empty state — hero style */
            <div
              className="relative overflow-hidden rounded-[24px] px-8 py-16 text-center"
              style={{ boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)' }}
            >
              <div className="absolute inset-0">
                <img src="/hero-bg.jpg" alt="" className="h-full w-full object-cover" />
              </div>
              <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(42,18,80,0.35)' }} />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white">Start tracking your mental health</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
                  Take the PHQ-9 (depression) and GAD-7 (anxiety) assessments to track your mental health over time.
                </p>
                <button
                  onClick={() => document.getElementById('assessment-card')?.scrollIntoView({ behavior: 'smooth' })}
                  className="mt-6 inline-block rounded-lg px-6 py-2.5 text-sm font-bold transition hover:opacity-90"
                  style={{ background: 'white', color: 'var(--purple)' }}
                >
                  Take your first assessment
                </button>
              </div>
            </div>
          ) : (
            /* Assessment Chart */
            <div className="card" data-chart="assessment">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Assessment Scores</h2>
              <AssessmentChart assessments={assessments} entries={entries} />
            </div>
          )}

          {/* Frequency recommendation */}
          <div className="rounded-xl border p-3" style={{ borderColor: 'var(--purple-pale)', background: 'var(--purple-ghost)' }}>
            <p className="text-xs text-text-muted">
              <span className="font-semibold" style={{ color: 'var(--purple)' }}>Recommended frequency:</span>{' '}
              Take assessments every 2-4 weeks, or whenever you make a dose change. This matches clinical guidelines and helps you and your provider track meaningful trends.
            </p>
          </div>

          {/* Take Assessment Card */}
          <div id="assessment-card">
            <AssessmentCard assessments={assessments} />
          </div>

          {/* Assessment History */}
          {sortedAssessments.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Assessment History</h2>
              <div className="space-y-3">
                {sortedAssessments.map((a) => {
                  const isPHQ = a.type === 'phq9';
                  const label = isPHQ ? 'PHQ-9' : 'GAD-7';
                  const subtitle = isPHQ ? 'Depression' : 'Anxiety';
                  const severity = isPHQ ? labelPHQ(a.score) : labelGAD(a.score);
                  const color = severityColor(severity);
                  const maxScore = isPHQ ? 27 : 21;
                  const dateStr = new Date(a.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-xl border px-4 py-3"
                      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                          style={{ background: color }}
                        >
                          {a.score}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {label} <span className="font-normal text-text-subtle">— {subtitle}</span>
                          </p>
                          <p className="text-xs text-text-subtle">{dateStr}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
                          style={{ background: color }}
                        >
                          {severity}
                        </span>
                        <p className="mt-0.5 text-[10px] text-text-subtle">{a.score}/{maxScore}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
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
          <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Psychiatric Medications Tracked</p>
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
