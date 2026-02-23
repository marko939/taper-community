'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function HowOthersFelt({ entries }) {
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentDrug = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    const recent = entries.find((e) => e.drug);
    return recent?.drug || null;
  }, [entries]);

  // Calculate what % of starting dose the user is at
  const taperPct = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    const withDose = entries.filter((e) => e.drug && e.dose_numeric);
    if (withDose.length < 1) return null;
    const startingDose = withDose[withDose.length - 1].dose_numeric; // oldest entry
    const currentDose = withDose[0].dose_numeric; // most recent
    if (!startingDose || startingDose === 0) return null;
    return Math.round((currentDose / startingDose) * 100);
  }, [entries]);

  useEffect(() => {
    if (!currentDrug || taperPct === null) return;

    const fetchCommunity = async () => {
      setLoading(true);
      try {
        const supabase = createClient();

        // Fetch all public entries for this drug, grouped by user to calculate each user's taper %
        const { data } = await supabase
          .from('journal_entries')
          .select('user_id, mood_score, symptoms, dose_numeric, date')
          .eq('drug', currentDrug)
          .not('dose_numeric', 'is', null)
          .eq('is_public', true)
          .order('date', { ascending: true });

        if (data && data.length > 0) {
          // Group by user, compute their taper % at each entry
          const byUser = {};
          data.forEach((e) => {
            if (!byUser[e.user_id]) byUser[e.user_id] = [];
            byUser[e.user_id].push(e);
          });

          // Find entries where the user was at a similar taper % (+/- 10%)
          const matchingEntries = [];
          const pctRange = 10;
          Object.values(byUser).forEach((userEntries) => {
            const startDose = userEntries[0].dose_numeric; // first entry = starting dose
            if (!startDose || startDose === 0) return;
            userEntries.forEach((e) => {
              const entryPct = Math.round((e.dose_numeric / startDose) * 100);
              if (Math.abs(entryPct - taperPct) <= pctRange) {
                matchingEntries.push(e);
              }
            });
          });

          if (matchingEntries.length >= 3) {
            const moods = matchingEntries.filter((e) => e.mood_score).map((e) => e.mood_score);
            const avgMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : null;

            const symptomFreq = {};
            matchingEntries.forEach((e) => {
              (e.symptoms || []).forEach((s) => {
                symptomFreq[s] = (symptomFreq[s] || 0) + 1;
              });
            });
            const topSymptoms = Object.entries(symptomFreq)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([name, count]) => ({ name, pct: Math.round((count / matchingEntries.length) * 100) }));

            setCommunityData({
              count: matchingEntries.length,
              avgMood,
              topSymptoms,
            });
          }
        }
      } catch (err) {
        console.error('[HowOthersFelt] fetch error:', err);
      }
      setLoading(false);
    };

    fetchCommunity();
  }, [currentDrug, taperPct]);

  if (!currentDrug || taperPct === null) return null;
  if (loading) {
    return (
      <div
        className="h-24 animate-pulse rounded-xl"
        style={{ background: 'var(--surface-glass)' }}
      />
    );
  }
  if (!communityData) return null;

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: 'var(--purple-pale)', background: 'var(--purple-ghost)' }}
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--purple-pale)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--purple)' }}>
          How Others Felt at {taperPct}% of Their {currentDrug}
        </h3>
        <p className="text-[11px] text-text-subtle">
          Based on {communityData.count} public entries at a similar taper stage
        </p>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-6">
          {communityData.avgMood && (
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--purple)' }}>{communityData.avgMood}</p>
              <p className="text-[10px] text-text-subtle">Avg mood /10</p>
            </div>
          )}
          {communityData.topSymptoms.length > 0 && (
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-[10px] font-semibold text-text-subtle">Common symptoms</p>
              <div className="flex flex-wrap gap-1.5">
                {communityData.topSymptoms.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
                  >
                    {s.name} ({s.pct}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
