'use client';

import { useState } from 'react';
import Avatar from '@/components/shared/Avatar';
import JournalChart from '@/components/journal/JournalChart';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import AssessmentChart from '@/components/journal/AssessmentChart';
import ProviderPDFButton from '@/components/journal/ProviderPDFButton';
import { TAPER_STAGES } from '@/lib/constants';

export default function JourneyClient({ data, username }) {
  const { profile, entries, assessments } = data;
  const [chartTab, setChartTab] = useState('doseMood');
  const stageLabel = TAPER_STAGES.find((s) => s.value === profile.taper_stage)?.label;

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      {/* Profile Header */}
      <div className="flex items-start gap-4">
        <Avatar name={profile.display_name || username} avatarUrl={profile.avatar_url} size="xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{profile.display_name || username}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-muted">
            {profile.drug && <span>{profile.drug}</span>}
            {stageLabel && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
              >
                {stageLabel}
              </span>
            )}
          </div>
          {profile.bio && <p className="mt-2 text-sm text-text-muted">{profile.bio}</p>}
          {profile.drug_signature && (
            <p className="mt-1 text-xs italic text-text-subtle">{profile.drug_signature}</p>
          )}
        </div>
        <ProviderPDFButton entries={entries} profile={profile} assessments={assessments} />
      </div>

      {/* Chart */}
      {entries.length > 0 && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Taper Progress</h2>
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
              {assessments.length > 0 && (
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
              )}
            </div>
          </div>
          {chartTab === 'doseMood' ? (
            <JournalChart entries={entries} assessments={assessments} />
          ) : (
            <AssessmentChart assessments={assessments} />
          )}
        </div>
      )}

      {/* Public Journal Entries */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Journal Entries ({entries.length})
        </h2>
        {entries.length === 0 ? (
          <p className="text-text-muted">No public entries yet.</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
