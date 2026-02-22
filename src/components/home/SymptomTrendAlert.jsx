'use client';

import { useMemo } from 'react';

function analyzeTrend(entries) {
  if (!entries || entries.length < 3) return null;

  const recent = entries.slice(0, 5); // last 5 entries

  // Check declining mood trend
  const moods = recent.filter((e) => e.mood_score != null).map((e) => e.mood_score);
  let moodDeclining = false;
  if (moods.length >= 3) {
    let declines = 0;
    for (let i = 0; i < moods.length - 1; i++) {
      if (moods[i] < moods[i + 1]) declines++;
    }
    moodDeclining = declines >= 2;
  }

  // Check increasing symptom count
  const symptomCounts = recent.filter((e) => e.symptoms).map((e) => e.symptoms.length);
  let symptomsIncreasing = false;
  if (symptomCounts.length >= 3) {
    let increases = 0;
    for (let i = 0; i < symptomCounts.length - 1; i++) {
      if (symptomCounts[i] > symptomCounts[i + 1]) increases++;
    }
    symptomsIncreasing = increases >= 2;
  }

  // Find trending symptom (most common in recent entries)
  const symptomFreq = {};
  recent.forEach((e) => {
    (e.symptoms || []).forEach((s) => {
      symptomFreq[s] = (symptomFreq[s] || 0) + 1;
    });
  });
  const topSymptom = Object.entries(symptomFreq).sort((a, b) => b[1] - a[1])[0];

  if (moodDeclining && symptomsIncreasing) {
    return {
      level: 'warning',
      title: 'Mood declining, symptoms increasing',
      message: 'Your last few entries show a pattern of declining mood and more symptoms. Consider reaching out to your clinician.',
      topSymptom: topSymptom ? topSymptom[0] : null,
    };
  }
  if (moodDeclining) {
    return {
      level: 'caution',
      title: 'Mood trending down',
      message: 'Your mood has been declining over the last few entries. This may be temporary — keep logging to track the pattern.',
      topSymptom: topSymptom ? topSymptom[0] : null,
    };
  }
  if (symptomsIncreasing) {
    return {
      level: 'caution',
      title: 'More symptoms recently',
      message: `You've logged more symptoms in recent entries${topSymptom ? `, especially ${topSymptom[0]}` : ''}. Consider holding your dose if you're actively tapering.`,
      topSymptom: topSymptom ? topSymptom[0] : null,
    };
  }

  // Positive trend
  if (moods.length >= 3) {
    let improvements = 0;
    for (let i = 0; i < moods.length - 1; i++) {
      if (moods[i] > moods[i + 1]) improvements++;
    }
    if (improvements >= 2) {
      return {
        level: 'positive',
        title: 'Mood is improving',
        message: 'Your mood has been trending upward. Keep going!',
        topSymptom: null,
      };
    }
  }

  return null;
}

const LEVEL_STYLES = {
  warning: {
    border: '#EF4444',
    bg: 'rgba(239,68,68,0.06)',
    iconColor: '#EF4444',
    textColor: '#991B1B',
  },
  caution: {
    border: '#F59E0B',
    bg: 'rgba(245,158,11,0.06)',
    iconColor: '#F59E0B',
    textColor: '#92400E',
  },
  positive: {
    border: '#2EC4B6',
    bg: 'rgba(46,196,182,0.06)',
    iconColor: '#2EC4B6',
    textColor: '#065F46',
  },
};

export default function SymptomTrendAlert({ entries }) {
  const trend = useMemo(() => analyzeTrend(entries), [entries]);

  if (!trend) return null;

  const styles = LEVEL_STYLES[trend.level];

  return (
    <section>
      <div
        className="flex items-start gap-3 rounded-xl border px-4 py-3.5"
        style={{ borderColor: styles.border, background: styles.bg }}
      >
        {trend.level === 'positive' ? (
          <svg className="mt-0.5 h-5 w-5 shrink-0" style={{ color: styles.iconColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
          </svg>
        ) : (
          <svg className="mt-0.5 h-5 w-5 shrink-0" style={{ color: styles.iconColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: styles.textColor }}>{trend.title}</p>
          <p className="mt-0.5 text-xs" style={{ color: styles.textColor, opacity: 0.8 }}>{trend.message}</p>
        </div>
      </div>
    </section>
  );
}
