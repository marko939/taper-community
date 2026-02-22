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

  const currentDose = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    const recent = entries.find((e) => e.dose_numeric);
    return recent?.dose_numeric || null;
  }, [entries]);

  useEffect(() => {
    if (!currentDrug || !currentDose) return;

    const fetchCommunity = async () => {
      setLoading(true);
      const supabase = createClient();
      const doseRange = currentDose * 0.3; // +/- 30% range

      const { data } = await supabase
        .from('journal_entries')
        .select('mood_score, symptoms, dose_numeric')
        .eq('drug', currentDrug)
        .gte('dose_numeric', currentDose - doseRange)
        .lte('dose_numeric', currentDose + doseRange)
        .eq('is_public', true)
        .limit(100);

      if (data && data.length >= 3) {
        const moods = data.filter((e) => e.mood_score).map((e) => e.mood_score);
        const avgMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : null;

        const symptomFreq = {};
        data.forEach((e) => {
          (e.symptoms || []).forEach((s) => {
            symptomFreq[s] = (symptomFreq[s] || 0) + 1;
          });
        });
        const topSymptoms = Object.entries(symptomFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, pct: Math.round((count / data.length) * 100) }));

        setCommunityData({
          count: data.length,
          avgMood,
          topSymptoms,
        });
      }
      setLoading(false);
    };

    fetchCommunity();
  }, [currentDrug, currentDose]);

  if (!currentDrug || !currentDose) return null;
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
          How Others Felt at ~{currentDose}mg {currentDrug}
        </h3>
        <p className="text-[11px] text-text-subtle">
          Based on {communityData.count} public entries at similar doses
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
