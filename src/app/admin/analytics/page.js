'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/blog';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';

export default function AnalyticsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signupRange, setSignupRange] = useState('last30');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pendingMatchCount, setPendingMatchCount] = useState(0);
  const [lookingForClinicianCount, setLookingForClinicianCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Unauthorized');
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin(user?.id)) fetchData();
  }, [user, fetchData]);

  useEffect(() => {
    if (!isAdmin(user?.id)) return;
    const supabase = createClient();
    supabase
      .from('match_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingMatchCount(count || 0));
    supabase
      .from('clinician_help_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setLookingForClinicianCount(count || 0))
      .catch(() => {});
  }, [user]);

  if (authLoading) return <LoadingSkeleton />;

  if (!user || !isAdmin(user.id)) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-foreground">Not authorized</p>
        <p className="mt-2 text-sm text-text-muted">You do not have permission to access this page.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-purple hover:underline">Back to Home</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-foreground">Error loading analytics</p>
        <p className="mt-2 text-sm text-text-muted">{error}</p>
        <button onClick={fetchData} className="btn btn-primary mt-4 text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-eyebrow">Admin</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-foreground">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/match-requests"
            className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium text-foreground no-underline transition hover:border-purple"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Match Requests
            {pendingMatchCount > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {pendingMatchCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/looking-for-clinician"
            className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium text-foreground no-underline transition hover:border-purple"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Looking for Clinician
            {lookingForClinicianCount > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white" style={{ background: '#5B2E91' }}>
                {lookingForClinicianCount}
              </span>
            )}
          </Link>
          {lastUpdated && (
            <span className="text-xs text-text-subtle">Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium text-foreground transition hover:border-purple"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
          >
            {loading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-purple border-t-transparent" />
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            )}
            Refresh
          </button>
        </div>
      </div>

      {loading && !data ? (
        <LoadingSkeleton />
      ) : data ? (
        <>
          {/* 1. Top Line Stats */}
          <TopLineCards stats={data.topLine} />

          {/* 2. New Signups Bar Chart */}
          <SignupBarChart series={data.signupSeries} range={signupRange} setRange={setSignupRange} />

          {/* 3. Retention */}
          <RetentionCards retention={data.retention} />
          <RetentionCohortTable cohorts={data.retentionCohorts} />

          {/* 4. Daily Posts & Comments */}
          <DailyActivityChart activity={data.dailyActivity} />

          {/* 5. Activity by Hour */}
          <PeakHoursChart hours={data.peakHours} />

          {/* 6. Engagement Depth */}
          <EngagementCards engagement={data.engagement} />

          {/* New vs Returning + Churn Risk */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NewVsReturningCard data={data.newVsReturning} />
            <ChurnRiskCard data={data.churnRisk} />
            <ThreadFunnelCard data={data.threadFunnel} />
          </div>

          {/* Top Members */}
          <TopMembersTable members={data.topMembers} />

          {/* Taper Tracker Adoption */}
          <TaperTrackerSection tracker={data.taperTracker} />

          {/* Clinician Interest */}
          <ClinicianInterestCard data={data.clinicianInterest} />

          {/* Site Traffic */}
          {data.plausible ? (
            <PlausibleSection plausible={data.plausible} />
          ) : (
            <PlausibleUnavailableCard />
          )}

          {/* Period Comparisons — DoD / WoW / MoM */}
          {data.periodComparisons && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ComparisonTable title="Day over Day" data={data.periodComparisons.daily} labels={['Today', 'Yesterday', 'DoD']} historicalSeries={data.periodHistorical?.daily} />
              <ComparisonTable title="Week over Week" data={data.periodComparisons.weekly} labels={['This Week', 'Last Week', 'WoW']} historicalSeries={data.periodHistorical?.weekly} />
              <ComparisonTable title="Month over Month" data={data.periodComparisons.monthly} labels={['This Month', 'Last Month', 'MoM']} historicalSeries={data.periodHistorical?.monthly} />
            </div>
          )}

          {/* QoQ / YoY */}
          {data.periodComparisons && (
            <div className="grid gap-4 sm:grid-cols-2">
              <ComparisonTable title="Quarter over Quarter" data={data.periodComparisons.quarterly} labels={['This Quarter', 'Last Quarter', 'QoQ']} historicalSeries={data.periodHistorical?.quarterly} />
              <ComparisonTable title="Year over Year" data={data.periodComparisons.yearly} labels={['This Year', 'Last Year', 'YoY']} historicalSeries={data.periodHistorical?.yearly} />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Section Components
// ═══════════════════════════════════════════════════════

function TopLineCards({ stats }) {
  if (!stats) return <SectionUnavailable label="Top Line Stats" />;

  const cards = [
    { label: 'Total Members', value: stats.totalMembers, color: '#5B2E91' },
    { label: 'Posts Today', value: stats.postsToday, color: '#5B2E91' },
    { label: 'Comments Today', value: stats.commentsToday, color: '#2EC4B6' },
    { label: 'Active This Week', value: stats.activeThisWeek, color: '#34A853' },
    { label: 'Taper Trackers', value: stats.taperTrackersActive, color: '#E8A838' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(c => (
        <Card key={c.label}>
          <p className="text-xs font-medium text-text-muted">{c.label}</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: c.color }}>{c.value.toLocaleString()}</p>
        </Card>
      ))}
    </div>
  );
}

function SignupBarChart({ series, range, setRange }) {
  if (!series) return <SectionUnavailable label="Signup Growth" />;

  const ranges = [
    { key: 'last7', label: '7 Days' },
    { key: 'last30', label: '30 Days' },
    { key: 'last90', label: '90 Days' },
  ];

  const chartData = (series[range] || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'New Signups': Number(d.new_users),
  }));

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-foreground">New Signups Per Day</h2>
        <div className="flex gap-1">
          {ranges.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className="rounded-lg px-2.5 py-1 text-[11px] font-medium transition"
              style={{
                background: range === r.key ? 'var(--purple-pale)' : 'transparent',
                color: range === r.key ? 'var(--purple)' : 'var(--text-muted)',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-64">
        {chartData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-subtle)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="New Signups" fill="#5B2E91" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

function ComparisonTable({ title, data, labels, historicalSeries }) {
  if (!data) return null;
  const [expanded, setExpanded] = useState(false);
  const [drillMetric, setDrillMetric] = useState(null); // e.g. 'signups'

  const metricKeys = Object.keys(data);
  const metrics = metricKeys.map(key => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    ...data[key],
  }));

  const chartData = metrics.map(m => ({
    name: m.name,
    [labels[0]]: m.current,
    [labels[1]]: m.previous,
  }));

  const metricColors = { signups: '#5B2E91', posts: '#2EC4B6', comments: '#E8A838', active: '#34A853' };

  // Build drill-down chart data from historical series
  const drillChartData = drillMetric && historicalSeries
    ? historicalSeries.map(d => ({ label: d.label, [drillMetric]: d[drillMetric] }))
    : null;

  const handleMetricClick = (key) => {
    if (!historicalSeries) return;
    setDrillMetric(drillMetric === key ? null : key);
    if (!expanded) setExpanded(true);
  };

  return (
    <Card>
      <button
        onClick={() => { setExpanded(!expanded); if (expanded) setDrillMetric(null); }}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
        <svg
          className="h-4 w-4 text-text-subtle transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && !drillMetric && (
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey={labels[0]} fill="#5B2E91" radius={[4, 4, 0, 0]} />
              <Bar dataKey={labels[1]} fill="#B8A0D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {expanded && drillMetric && drillChartData && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              {drillMetric.charAt(0).toUpperCase() + drillMetric.slice(1)} — Historical Trend
            </p>
            <button
              onClick={() => setDrillMetric(null)}
              className="rounded-lg px-2 py-0.5 text-[11px] font-medium text-purple transition hover:bg-purple-ghost"
            >
              ← Back to overview
            </button>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drillChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-subtle)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey={drillMetric} fill={metricColors[drillMetric] || '#5B2E91'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <th className="pb-2 text-left font-medium text-text-subtle">Metric</th>
            <th className="pb-2 text-right font-medium text-text-subtle">{labels[0]}</th>
            <th className="pb-2 text-right font-medium text-text-subtle">{labels[1]}</th>
            <th className="pb-2 text-right font-medium text-text-subtle">{labels[2]}</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map(m => (
            <tr
              key={m.key}
              className="border-b last:border-0 transition"
              style={{
                borderColor: 'var(--border-light)',
                cursor: historicalSeries ? 'pointer' : 'default',
                background: drillMetric === m.key ? 'var(--purple-pale)' : 'transparent',
              }}
              onClick={() => handleMetricClick(m.key)}
            >
              <td className="py-2 font-medium text-foreground">
                <span className="inline-flex items-center gap-1.5">
                  {historicalSeries && (
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: metricColors[m.key] || '#5B2E91' }} />
                  )}
                  {m.name}
                </span>
              </td>
              <td className="py-2 text-right font-semibold text-foreground">{m.current.toLocaleString()}</td>
              <td className="py-2 text-right text-text-muted">{m.previous.toLocaleString()}</td>
              <td className="py-2 text-right"><ChangeIndicator value={m.change} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function DailyActivityChart({ activity }) {
  if (!activity) return <SectionUnavailable label="Daily Activity" />;

  return (
    <Card>
      <h2 className="text-sm font-semibold text-foreground">Daily Posts & Comments (30 days)</h2>
      <div className="mt-4 h-64">
        {activity.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
                tickFormatter={v => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="posts" name="Posts" fill="#5B2E91" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comments" name="Comments" fill="#2EC4B6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

function RetentionCards({ retention }) {
  if (!retention) return <SectionUnavailable label="Retention" />;

  const [retentionView, setRetentionView] = useState('current');

  // Support both old (flat) and new (nested) data shapes
  const currentData = retention.current || retention;
  const alltimeData = retention.alltime || retention;
  const activeData = retentionView === 'current' ? currentData : alltimeData;

  const metrics = [
    { label: 'D1 Retention', value: activeData.d1_pct, cohort: activeData.d1_cohort, returned: activeData.d1_returned, benchGood: 40, benchGreat: 60 },
    { label: 'D7 Retention', value: activeData.d7_pct, cohort: activeData.d7_cohort, returned: activeData.d7_returned, benchGood: 20, benchGreat: 40 },
    { label: 'D30 Retention', value: activeData.d30_pct, cohort: activeData.d30_cohort, returned: activeData.d30_returned, benchGood: 10, benchGreat: 25 },
  ];

  const tabs = [
    { key: 'current', label: 'Current Cohort', desc: 'Recent signups in each window' },
    { key: 'alltime', label: 'All-Time', desc: 'Every user who ever signed up' },
  ];

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">Retention</h2>
          <div className="flex gap-1 rounded-lg p-0.5" style={{ background: 'var(--surface-strong)' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setRetentionView(tab.key)}
              className="rounded-md px-3 py-1.5 text-[11px] font-medium transition"
              style={{
                background: retentionView === tab.key ? 'var(--purple)' : 'transparent',
                color: retentionView === tab.key ? '#fff' : 'var(--text-muted)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-text-subtle">
          {tabs.find(t => t.key === retentionView)?.desc}
        </span>
        </div>
        <p className="mt-1 text-[10px] text-text-subtle">Measures users who return after signup (any activity: visiting, posting, replying, voting, or journaling)</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map(m => {
          const color = m.value >= m.benchGreat ? '#10B981' : m.value >= m.benchGood ? '#F59E0B' : '#EF4444';
          return (
            <Card key={m.label}>
              <p className="text-xs font-medium text-text-muted">{m.label}</p>
              <p className="mt-1 text-3xl font-bold" style={{ color }}>{m.value}%</p>
              <p className="mt-1 text-[11px] text-text-subtle">{m.returned ?? 0} of {m.cohort ?? 0} users returned</p>
              <p className="mt-2 text-[10px] text-text-subtle">Good: &gt;{m.benchGood}% &middot; Great: &gt;{m.benchGreat}%</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function RetentionCohortTable({ cohorts }) {
  if (!cohorts || cohorts.length === 0) return null;

  // Find max weeks across all cohorts
  const maxWeeks = Math.max(...cohorts.map(c => c.weeksElapsed), 0);
  const weekCols = Array.from({ length: Math.min(maxWeeks + 1, 8) }, (_, i) => i);

  const cellColor = (pct) => {
    if (pct == null) return 'transparent';
    if (pct >= 60) return 'rgba(16,185,129,0.25)';
    if (pct >= 40) return 'rgba(16,185,129,0.15)';
    if (pct >= 20) return 'rgba(245,158,11,0.15)';
    if (pct > 0) return 'rgba(239,68,68,0.1)';
    return 'rgba(239,68,68,0.05)';
  };

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-foreground">Retention by Signup Cohort</h2>
      <p className="mb-3 text-[10px] text-text-subtle">Each row is a weekly signup cohort. Cells show % of users active in that week after signup.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <th className="pb-2 pr-3 text-left font-medium text-text-subtle">Cohort</th>
              <th className="pb-2 pr-3 text-right font-medium text-text-subtle">Size</th>
              {weekCols.map(w => (
                <th key={w} className="pb-2 px-2 text-center font-medium text-text-subtle">
                  {w === 0 ? 'W0' : `W${w}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map(c => (
              <tr key={c.cohort} className="border-b last:border-0" style={{ borderColor: 'var(--border-light)' }}>
                <td className="py-2 pr-3 font-medium text-foreground whitespace-nowrap">{c.cohort}</td>
                <td className="py-2 pr-3 text-right text-text-muted">{c.size}</td>
                {weekCols.map(w => {
                  const val = c[`week${w}`];
                  const available = w <= c.weeksElapsed;
                  return (
                    <td key={w} className="py-2 px-2 text-center" style={{
                      background: available ? cellColor(val) : 'transparent',
                      borderRadius: 4,
                    }}>
                      {available ? (
                        <span className="font-semibold" style={{
                          color: val >= 40 ? '#10B981' : val >= 20 ? '#F59E0B' : val > 0 ? '#EF4444' : 'var(--text-subtle)',
                        }}>
                          {val}%
                        </span>
                      ) : (
                        <span className="text-text-subtle">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PeakHoursChart({ hours }) {
  if (!hours) return <SectionUnavailable label="Peak Hours" />;

  const offset = new Date().getTimezoneOffset() / -60;
  const adjusted = hours.map(h => ({
    hour: `${((h.hour + offset + 24) % 24).toString().padStart(2, '0')}:00`,
    count: h.count,
  }));

  return (
    <Card>
      <h2 className="text-sm font-semibold text-foreground">Activity by Hour (30 days)</h2>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={adjusted}>
            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text-subtle)' }} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-subtle)' }} width={30} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" name="Activity" fill="#7B4FAF" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function EngagementCards({ engagement }) {
  if (!engagement) return <SectionUnavailable label="Engagement" />;

  const cards = [
    { label: 'Posts / Active User', value: engagement.postsPerActiveUser, sub: 'This week' },
    { label: 'Avg Replies / Thread', value: engagement.avgRepliesPerThread, sub: 'For threads with replies (30d)' },
    {
      label: 'Time to First Post or Reply',
      value: engagement.avgTimeToFirstPostOrReplyHours != null ? `${engagement.avgTimeToFirstPostOrReplyHours}h` : 'N/A',
      sub: `${engagement.usersWhoPosted ?? 0} of ${engagement.totalUsers ?? 0} members`,
      color: engagement.avgTimeToFirstPostOrReplyHours == null ? null
        : engagement.avgTimeToFirstPostOrReplyHours < 1 ? '#10B981'
        : engagement.avgTimeToFirstPostOrReplyHours < 24 ? '#F59E0B' : '#EF4444',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cards.map(c => (
        <Card key={c.label}>
          <p className="text-xs font-medium text-text-muted">{c.label}</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: c.color || '#5B2E91' }}>{c.value}</p>
          <p className="mt-0.5 text-[10px] text-text-subtle">{c.sub}</p>
        </Card>
      ))}
    </div>
  );
}

function NewVsReturningCard({ data }) {
  if (!data) return <SectionUnavailable label="New vs Returning" />;
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Active Today</p>
      <div className="mt-3 flex items-end gap-6">
        <div>
          <p className="text-2xl font-bold" style={{ color: '#2EC4B6' }}>{data.newActive}</p>
          <p className="text-[11px] text-text-subtle">New (joined &lt;7d)</p>
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: '#5B2E91' }}>{data.returningActive}</p>
          <p className="text-[11px] text-text-subtle">Returning</p>
        </div>
      </div>
    </Card>
  );
}

function ChurnRiskCard({ data }) {
  if (!data) return <SectionUnavailable label="Churn Risk" />;
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Churn Risk</p>
      <p className="mt-2 text-2xl font-bold" style={{ color: data.atRisk > 0 ? '#EF4444' : '#10B981' }}>
        {data.atRisk}
      </p>
      <p className="mt-1 text-[11px] text-text-subtle">
        Members who posted in first week but silent for 14+ days
      </p>
      <p className="text-[10px] text-text-subtle">
        Out of {data.firstWeekPosters} first-week posters
      </p>
    </Card>
  );
}

function ThreadFunnelCard({ data }) {
  if (!data || data.total === 0) return <SectionUnavailable label="Thread Funnel" />;

  const pct = (n) => data.total > 0 ? Math.round((n / data.total) * 100) : 0;

  const steps = [
    { label: 'Total threads', count: data.total, pct: 100 },
    { label: 'Got 1+ reply', count: data.got1, pct: pct(data.got1) },
    { label: 'Got 3+ replies', count: data.got3, pct: pct(data.got3) },
    { label: 'Got 5+ replies', count: data.got5, pct: pct(data.got5) },
    { label: 'Got 10+ replies', count: data.got10, pct: pct(data.got10) },
  ];

  return (
    <Card>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Thread Engagement Funnel (30d)</p>
      <div className="space-y-1.5">
        {steps.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="h-5 rounded" style={{ width: `${Math.max(s.pct, 4)}%`, background: '#5B2E91', opacity: 0.15 + (s.pct / 100) * 0.85 }} />
            <span className="whitespace-nowrap text-[11px] text-text-muted">
              {s.label}: <strong className="text-foreground">{s.count}</strong> ({s.pct}%)
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TopMembersTable({ members }) {
  if (!members || members.length === 0) return <SectionUnavailable label="Top Members" />;

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-foreground">Top Members This Week</h2>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <th className="pb-2 text-left font-medium text-text-subtle">#</th>
            <th className="pb-2 text-left font-medium text-text-subtle">Member</th>
            <th className="pb-2 text-right font-medium text-text-subtle">Posts</th>
            <th className="pb-2 text-right font-medium text-text-subtle">Comments</th>
            <th className="pb-2 text-right font-medium text-text-subtle">Total</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr key={m.id} className="border-b last:border-0" style={{ borderColor: 'var(--border-light)' }}>
              <td className="py-2 font-semibold text-text-subtle">{i + 1}</td>
              <td className="py-2 font-medium text-foreground">{m.name}</td>
              <td className="py-2 text-right text-foreground">{m.posts}</td>
              <td className="py-2 text-right text-foreground">{m.comments}</td>
              <td className="py-2 text-right font-semibold" style={{ color: '#5B2E91' }}>{m.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function TimeToFirstPost({ data }) {
  if (!data) return <SectionUnavailable label="Time to First Post" />;

  const color = data.avgHours == null ? 'var(--text-muted)'
    : data.avgHours < 1 ? '#10B981'
    : data.avgHours < 24 ? '#F59E0B' : '#EF4444';

  return (
    <Card>
      <p className="text-xs font-medium text-text-muted">Avg Time to First Post</p>
      <p className="mt-1 text-2xl font-bold" style={{ color }}>
        {data.avgHours != null ? `${data.avgHours}h` : 'N/A'}
      </p>
      <p className="mt-1 text-[11px] text-text-subtle">
        {data.usersWhoPosted} of {data.totalUsers} members have posted
      </p>
    </Card>
  );
}

function PageViewsSection({ pageViews }) {
  if (!pageViews) return <SectionUnavailable label="Page Views (Custom Tracking)" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">Page Views (Custom Tracking)</h2>
        <span className="text-[10px] text-text-subtle">Logged-in member views only, excludes admin</span>
      </div>
      {/* Traffic stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <p className="text-xs font-medium text-text-muted">Views Today</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#5B2E91' }}>{pageViews.today.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-text-muted">Sessions Today</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#2EC4B6' }}>{pageViews.uniqueToday.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-text-muted">Views (7d)</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#5B2E91' }}>{pageViews.thisWeek.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-text-muted">Sessions (7d)</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#2EC4B6' }}>{pageViews.uniqueThisWeek.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-text-muted">Views (30d)</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#5B2E91' }}>{pageViews.thisMonth.toLocaleString()}</p>
        </Card>
      </div>

      {/* Daily page views chart */}
      {pageViews.dailySeries && pageViews.dailySeries.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-foreground">Page Views Per Day (30 days)</h2>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pageViews.dailySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
                  tickFormatter={v => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="views" name="Page Views" fill="#7B4FAF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Top pages + referrers side by side */}
      <div className="grid gap-4 sm:grid-cols-2">
        {pageViews.topPages && pageViews.topPages.length > 0 && (
          <Card>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Top Pages (7 days)</h3>
            <div className="space-y-1.5">
              {pageViews.topPages.map(p => (
                <div key={p.path} className="flex items-center justify-between text-xs">
                  <span className="truncate text-foreground" style={{ maxWidth: '70%' }}>{p.path}</span>
                  <span className="font-semibold" style={{ color: '#5B2E91' }}>{p.views}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        {pageViews.topReferrers && pageViews.topReferrers.length > 0 && (
          <Card>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Top Referrers (7 days)</h3>
            <div className="space-y-1.5">
              {pageViews.topReferrers.map(r => (
                <div key={r.source} className="flex items-center justify-between text-xs">
                  <span className="truncate text-foreground" style={{ maxWidth: '70%' }}>{r.source}</span>
                  <span className="font-semibold" style={{ color: '#2EC4B6' }}>{r.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function TaperTrackerSection({ tracker }) {
  if (!tracker) return <SectionUnavailable label="Taper Tracker Adoption" />;

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-foreground">Taper Tracker Adoption</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs font-medium text-text-muted">Adoption Rate</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#E8A838' }}>{tracker.adoptionPct}%</p>
          <p className="text-[10px] text-text-subtle">{tracker.usersWithEntries} of {tracker.totalMembers} members</p>
        </div>
        <div>
          <p className="text-xs font-medium text-text-muted">Check-ins Today</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{tracker.checkinsToday}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-text-muted">Check-ins This Week</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{tracker.checkinsThisWeek}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-text-muted">Avg / User / Week</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{tracker.avgCheckinsPerUserPerWeek}</p>
        </div>
      </div>
    </Card>
  );
}

function ClinicianInterestCard({ data }) {
  if (!data) return <SectionUnavailable label="Clinician Interest" />;

  const total = data.withClinician + data.withoutClinician;
  const lookingPct = data.withoutClinician > 0
    ? Math.round((data.lookingForClinician / data.withoutClinician) * 100)
    : 0;

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-foreground">Clinician Interest (Onboarding)</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs font-medium text-text-muted">Has Clinician</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#10B981' }}>{data.withClinician}</p>
          <p className="text-[10px] text-text-subtle">of {total} who answered</p>
        </div>
        <div>
          <p className="text-xs font-medium text-text-muted">No Clinician</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#F59E0B' }}>{data.withoutClinician}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-text-muted">Looking for Clinician</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#5B2E91' }}>{data.lookingForClinician}</p>
          <p className="text-[10px] text-text-subtle">{lookingPct}% of those without</p>
        </div>
        <div>
          <p className="text-xs font-medium text-text-muted">Declined Help</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#EF4444' }}>{data.withoutClinician - data.lookingForClinician}</p>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════
// Plausible Analytics
// ═══════════════════════════════════════════════════════

function PlausibleSection({ plausible }) {
  if (!plausible) return <SectionUnavailable label="Site Traffic (Plausible)" />;

  const { realtime, today, week, month, timeseries, topPages, topSources, topCountries } = plausible;

  const fmtDuration = (s) => {
    if (!s) return '0s';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const periods = [
    { label: 'Today', d: today },
    { label: '7 Days', d: week },
    { label: '30 Days', d: month },
  ];

  return (
    <div className="space-y-4">
      {/* Header with realtime */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-foreground">Site Traffic (Plausible)</h2>
        {realtime != null && (
          <span className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: 'rgba(46,196,182,0.12)', color: '#2EC4B6' }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#2EC4B6', animation: 'pulse 2s infinite' }} />
            {realtime} online now
          </span>
        )}
      </div>

      {/* Partial error warning */}
      {plausible._errors && plausible._errors.length > 0 && (
        <p className="rounded-lg px-3 py-2 text-xs text-text-muted"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          Some Plausible data unavailable: {plausible._errors.join(', ')}
        </p>
      )}

      {/* Aggregate stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {periods.map(({ label, d }) => (
          <Card key={label}>
            <p className="mb-3 text-xs font-semibold text-text-muted">{label}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-text-subtle">Visitors</p>
                <p className="text-lg font-bold text-foreground">{d?.visitors?.value?.toLocaleString() ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-subtle">Pageviews</p>
                <p className="text-lg font-bold text-foreground">{d?.pageviews?.value?.toLocaleString() ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-subtle">Bounce Rate</p>
                <p className="text-lg font-bold text-foreground">{d?.bounce_rate?.value != null ? `${d.bounce_rate.value}%` : '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-subtle">Avg Duration</p>
                <p className="text-lg font-bold text-foreground">{fmtDuration(d?.visit_duration?.value)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 30-day traffic timeseries */}
      {timeseries && timeseries.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-foreground">Daily Traffic (30 days)</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeseries.map(d => ({
                date: d.date,
                Visitors: d.visitors,
                Pageviews: d.pageviews,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
                  tickFormatter={v => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Visitors" fill="#2EC4B6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pageviews" fill="#5B2E91" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Breakdowns grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Top Pages */}
        {topPages?.length > 0 && (
          <Card>
            <h3 className="mb-3 text-xs font-semibold text-text-muted">Top Pages (7d)</h3>
            <div className="space-y-2">
              {topPages.map((p) => (
                <div key={p.page} className="flex items-center justify-between text-xs">
                  <span className="truncate text-foreground" style={{ maxWidth: '65%' }}>{p.page}</span>
                  <span className="font-semibold" style={{ color: '#2EC4B6' }}>{p.visitors}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Sources */}
        {topSources?.length > 0 && (
          <Card>
            <h3 className="mb-3 text-xs font-semibold text-text-muted">Top Sources (7d)</h3>
            <div className="space-y-2">
              {topSources.map((s) => (
                <div key={s.source} className="flex items-center justify-between text-xs">
                  <span className="truncate text-foreground" style={{ maxWidth: '65%' }}>{s.source}</span>
                  <span className="font-semibold" style={{ color: '#E8A838' }}>{s.visitors}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Countries */}
        {topCountries?.length > 0 && (
          <Card>
            <h3 className="mb-3 text-xs font-semibold text-text-muted">Top Countries (7d)</h3>
            <div className="space-y-2">
              {topCountries.map((c) => (
                <div key={c.country} className="flex items-center justify-between text-xs">
                  <span className="truncate text-foreground" style={{ maxWidth: '65%' }}>{c.country}</span>
                  <span className="font-semibold" style={{ color: '#9B5DE5' }}>{c.visitors}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Shared
// ═══════════════════════════════════════════════════════

const tooltipStyle = { background: 'var(--surface-strong)', border: '1px solid var(--border-subtle)', borderRadius: 12, fontSize: 12 };

function Card({ children }) {
  return (
    <div className="rounded-2xl border p-5 transition"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)', boxShadow: 'var(--shadow-soft)' }}>
      {children}
    </div>
  );
}

function ChangeIndicator({ value }) {
  if (value === 0) return <span className="text-text-subtle">&mdash;</span>;
  const isPositive = value > 0;
  return (
    <span className="inline-flex items-center gap-0.5 font-semibold"
      style={{ color: isPositive ? '#10B981' : '#EF4444' }}>
      {isPositive ? '+' : ''}{value}%
      <span className="text-[10px]">{isPositive ? '\u2191' : '\u2193'}</span>
    </span>
  );
}

function PlausibleUnavailableCard() {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: 'rgba(239,68,68,0.1)' }}>
          <svg className="h-4 w-4" style={{ color: '#EF4444' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Plausible Analytics Unavailable</p>
          <p className="text-xs text-text-muted">
            Could not fetch data from Plausible. Check that PLAUSIBLE_API_KEY and PLAUSIBLE_SITE_ID are set in your environment variables.
          </p>
        </div>
      </div>
    </Card>
  );
}

function SectionUnavailable({ label }) {
  return <Card><p className="text-sm text-text-muted">{label}: <span className="italic">Data unavailable</span></p></Card>;
}

function EmptyChart() {
  return <div className="flex h-full items-center justify-center"><p className="text-sm text-text-subtle">No data for this period</p></div>;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 py-8">
      <div className="h-8 w-48 animate-pulse rounded-xl" style={{ background: 'var(--border-subtle)' }} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl" style={{ background: 'var(--border-subtle)' }} />)}
      </div>
      <div className="h-72 animate-pulse rounded-2xl" style={{ background: 'var(--border-subtle)' }} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl" style={{ background: 'var(--border-subtle)' }} />)}
      </div>
    </div>
  );
}
