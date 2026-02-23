'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Taper Journal</h1>
        <p className="mt-3 text-text-muted">
          Track your doses, symptoms, and mood over time. Sign in to start journaling.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/auth/signin" className="btn btn-secondary text-sm no-underline">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn btn-primary text-sm no-underline">
            Join Community
          </Link>
        </div>
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
              <div className="card">
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

              {/* Symptom Heatmap */}
              <SymptomHeatmap entries={entries} />
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
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Assessment Scores</h2>
              <AssessmentChart assessments={assessments} />
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
    </div>
  );
}
