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
  const [chartTab, setChartTab] = useState('doseMood'); // 'doseMood' | 'assessments'
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
    // Snapshot milestones before adding
    const beforeMilestones = detectMilestones(entries, profile)
      .filter((m) => m.achieved)
      .map((m) => m.id);

    await addEntry(entry);

    // Check for newly achieved milestones
    const updatedEntries = useJournalStore.getState().entries;
    const afterMilestones = detectMilestones(updatedEntries, profile);
    const newlyAchieved = afterMilestones.find(
      (m) => m.achieved && !beforeMilestones.includes(m.id)
    );
    if (newlyAchieved) {
      setActiveMilestone(newlyAchieved);
    }

    // Check invite triggers
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

  return (
    <div className="space-y-8">
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

      {/* Chart with tab switcher */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Taper Progress</h2>
          <div className="flex rounded-lg border" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={() => setChartTab('doseMood')}
              className="rounded-l-lg px-3 py-1.5 text-xs font-medium transition"
              style={{
                background: chartTab === 'doseMood' ? 'var(--purple)' : 'transparent',
                color: chartTab === 'doseMood' ? 'white' : 'var(--text-muted)',
              }}
            >
              Dose & Mood
            </button>
            <button
              onClick={() => setChartTab('assessments')}
              className="rounded-r-lg px-3 py-1.5 text-xs font-medium transition"
              style={{
                background: chartTab === 'assessments' ? 'var(--purple)' : 'transparent',
                color: chartTab === 'assessments' ? 'white' : 'var(--text-muted)',
              }}
            >
              Assessments
            </button>
          </div>
        </div>
        {chartTab === 'doseMood' ? (
          <JournalChart entries={entries} assessments={assessments} />
        ) : (
          <AssessmentChart assessments={assessments} />
        )}
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

      {/* Assessment Card */}
      <AssessmentCard assessments={assessments} />

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Log an Entry</h2>
        <JournalEntryForm onSubmit={handleSubmit} entryCount={entries.length} />
      </div>

      {/* Invite prompt after entry submission */}
      {inviteTrigger && <InvitePrompt trigger={inviteTrigger} userId={user.id} />}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Entry History</h2>
        {entries.length === 0 ? (
          <p className="text-text-muted">
            No entries yet. Start logging to track your progress.
          </p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

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
