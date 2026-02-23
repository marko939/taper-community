export const MILESTONES = [
  {
    id: 'days_30',
    emoji: '📅',
    label: '30 Days of Tracking',
    check: (entries) => {
      if (entries.length < 2) return false;
      const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
      const first = new Date(sorted[0].date);
      const last = new Date(sorted[sorted.length - 1].date);
      return (last - first) / (1000 * 60 * 60 * 24) >= 30;
    },
  },
  {
    id: 'days_60',
    emoji: '🗓️',
    label: '60 Days of Tracking',
    check: (entries) => {
      if (entries.length < 2) return false;
      const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
      const first = new Date(sorted[0].date);
      const last = new Date(sorted[sorted.length - 1].date);
      return (last - first) / (1000 * 60 * 60 * 24) >= 60;
    },
  },
  {
    id: 'days_90',
    emoji: '🏆',
    label: '90 Days of Tracking',
    check: (entries) => {
      if (entries.length < 2) return false;
      const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
      const first = new Date(sorted[0].date);
      const last = new Date(sorted[sorted.length - 1].date);
      return (last - first) / (1000 * 60 * 60 * 24) >= 90;
    },
  },
  {
    id: 'days_180',
    emoji: '⭐',
    label: '180 Days of Tracking',
    check: (entries) => {
      if (entries.length < 2) return false;
      const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
      const first = new Date(sorted[0].date);
      const last = new Date(sorted[sorted.length - 1].date);
      return (last - first) / (1000 * 60 * 60 * 24) >= 180;
    },
  },
  {
    id: 'days_365',
    emoji: '🎉',
    label: '1 Year of Tracking',
    check: (entries) => {
      if (entries.length < 2) return false;
      const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
      const first = new Date(sorted[0].date);
      const last = new Date(sorted[sorted.length - 1].date);
      return (last - first) / (1000 * 60 * 60 * 24) >= 365;
    },
  },
  {
    id: 'dose_75',
    emoji: '💪',
    label: '75% Dose Reduction',
    check: (entries) => {
      const doses = entries.filter((e) => e.dose_numeric).map((e) => e.dose_numeric);
      if (doses.length < 2) return false;
      const first = doses[doses.length - 1]; // oldest (entries sorted desc)
      const last = doses[0]; // newest
      return last <= first * 0.25;
    },
  },
  {
    id: 'taper_completed',
    emoji: '🎊',
    label: 'Taper Completed',
    check: (_entries, profile) => profile?.taper_stage === 'completed',
  },
  {
    id: 'mood_streak_7',
    emoji: '🌟',
    label: '7-Day Mood Streak',
    check: (entries) => {
      const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
      let streak = 0;
      for (const entry of sorted) {
        if (entry.mood_score >= 7) {
          streak++;
          if (streak >= 7) return true;
        } else {
          streak = 0;
        }
      }
      return false;
    },
  },
];

export function detectMilestones(entries, profile) {
  return MILESTONES.map((m) => ({
    ...m,
    achieved: m.check(entries, profile),
  }));
}

export function getShareableText(milestone, profile, entries) {
  const drug = profile?.drug || 'my medication';
  const doses = entries.filter((e) => e.dose_numeric).map((e) => e.dose_numeric);
  const startDose = doses.length > 0 ? doses[doses.length - 1] : null;
  const currentDose = doses.length > 0 ? doses[0] : null;
  const doseText = startDose && currentDose ? `${startDose}mg → ${currentDose}mg` : '';

  switch (milestone.id) {
    case 'days_30':
    case 'days_60':
    case 'days_90':
    case 'days_180':
    case 'days_365': {
      const days = milestone.id.split('_')[1];
      return `I've been tapering ${drug} for ${days} days${doseText ? ` — ${doseText}` : ''}`;
    }
    case 'dose_75':
      return `I've reduced my ${drug} dose by 75%${doseText ? ` (${doseText})` : ''}`;
    case 'taper_completed':
      return `I completed my ${drug} taper!${doseText ? ` ${doseText}` : ''}`;
    case 'mood_streak_7':
      return `7-day good mood streak while tapering ${drug}`;
    default:
      return milestone.label;
  }
}
