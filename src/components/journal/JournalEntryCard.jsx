'use client';

import Link from 'next/link';
import { MOOD_LABELS } from '@/lib/constants';

function moodColor(score) {
  if (score <= 3) return 'text-red-500';
  if (score <= 5) return 'text-amber-500';
  if (score <= 7) return 'text-blue-500';
  return 'text-green-500';
}

export default function JournalEntryCard({ entry, forumNames }) {
  const {
    date, drug, current_dose, dose_numeric, symptoms = [], mood_score, notes,
    is_public, published_forums = [], thread_ids = [],
  } = entry;

  return (
    <div className="card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>
            {drug && (
              <span className="rounded-full bg-accent-blue/10 px-2.5 py-0.5 text-xs font-medium text-accent-blue">
                {drug} {current_dose && `— ${current_dose}`}
              </span>
            )}
          </div>

          {symptoms.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {symptoms.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-text-subtle"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {notes && (
            <p className="mt-2 text-sm text-text-muted line-clamp-2">{notes}</p>
          )}

          {/* Sharing indicators */}
          {(is_public || published_forums.length > 0) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {is_public && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Public
                </span>
              )}
              {published_forums.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple/5 px-2 py-0.5 text-xs" style={{ color: 'var(--purple)' }}>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Posted to {published_forums.length} forum{published_forums.length !== 1 ? 's' : ''}
                  {forumNames && forumNames.length > 0 && (
                    <span className="text-text-subtle"> ({forumNames.join(', ')})</span>
                  )}
                </span>
              )}
              {thread_ids.length > 0 && thread_ids.map((tid) => (
                <Link
                  key={tid}
                  href={`/thread/${tid}`}
                  className="text-xs text-accent-blue hover:underline"
                >
                  View thread
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center">
          <span className={`text-2xl font-bold ${moodColor(mood_score)}`}>
            {mood_score}
          </span>
          <span className="text-xs text-text-subtle">{MOOD_LABELS[mood_score]}</span>
          {dose_numeric && (
            <span className="mt-1 text-xs text-accent-blue">{dose_numeric}mg</span>
          )}
        </div>
      </div>
    </div>
  );
}
