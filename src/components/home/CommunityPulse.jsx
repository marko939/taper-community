'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CommunityPulse() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      // Parallel queries
      const [threadsRes, repliesRes, journalRes] = await Promise.all([
        supabase.from('threads').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
        supabase.from('replies').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
        supabase.from('journal_entries').select('mood_score, symptoms').gte('created_at', oneWeekAgo),
      ]);

      const journalData = journalRes.data || [];
      const moods = journalData.filter((e) => e.mood_score).map((e) => e.mood_score);
      const avgMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : null;

      // Find trending symptom
      const symptomFreq = {};
      journalData.forEach((e) => {
        (e.symptoms || []).forEach((s) => {
          symptomFreq[s] = (symptomFreq[s] || 0) + 1;
        });
      });
      const topSymptom = Object.entries(symptomFreq).sort((a, b) => b[1] - a[1])[0];

      setStats({
        threads: threadsRes.count || 0,
        replies: repliesRes.count || 0,
        checkIns: journalData.length,
        avgMood,
        topSymptom: topSymptom ? topSymptom[0] : null,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Community This Week</h2>
        <div className="h-20 animate-pulse rounded-xl" style={{ background: 'var(--surface-glass)' }} />
      </section>
    );
  }

  if (!stats) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-foreground">Community This Week</h2>
      <div
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--border-subtle)' }}
      >
        <StatCell label="New threads" value={stats.threads} icon="thread" />
        <StatCell label="Replies" value={stats.replies} icon="reply" />
        <StatCell label="Check-ins" value={stats.checkIns} icon="checkin" />
        <StatCell
          label="Avg mood"
          value={stats.avgMood ? `${stats.avgMood}/10` : '--'}
          icon="mood"
          subtitle={stats.topSymptom ? `Top: ${stats.topSymptom}` : null}
        />
      </div>
    </section>
  );
}

function StatCell({ label, value, icon, subtitle }) {
  const iconColor = 'var(--purple)';
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-3" style={{ background: 'var(--surface-strong)' }}>
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: 'var(--purple-ghost)' }}
      >
        {icon === 'thread' && (
          <svg className="h-3.5 w-3.5" style={{ color: iconColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        )}
        {icon === 'reply' && (
          <svg className="h-3.5 w-3.5" style={{ color: iconColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
        )}
        {icon === 'checkin' && (
          <svg className="h-3.5 w-3.5" style={{ color: iconColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {icon === 'mood' && (
          <svg className="h-3.5 w-3.5" style={{ color: iconColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-tight text-foreground">{value}</p>
        <p className="text-[10px] leading-tight text-text-subtle">{label}</p>
        {subtitle && <p className="text-[9px] leading-tight text-text-subtle">{subtitle}</p>}
      </div>
    </div>
  );
}
