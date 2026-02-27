'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/blog';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export default function AnalyticsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signupRange, setSignupRange] = useState('last30');
  const [lastUpdated, setLastUpdated] = useState(null);

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

          {/* Posts by Forum */}
          <ForumBreakdownChart forums={data.forumBreakdown} />

          {/* Time to First Post */}
          <TimeToFirstPost data={data.timeToFirstPost} />

          {/* Taper Tracker Adoption */}
          <TaperTrackerSection tracker={data.taperTracker} />

          {/* Site Traffic */}
          <PageViewsSection pageViews={data.pageViews} />

          {/* Period Comparisons — DoD / WoW / MoM */}
          {data.periodComparisons && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ComparisonTable title="Day over Day" data={data.periodComparisons.daily} labels={['Today', 'Yesterday', 'DoD']} />
              <ComparisonTable title="Week over Week" data={data.periodComparisons.weekly} labels={['This Week', 'Last Week', 'WoW']} />
              <ComparisonTable title="Month over Month" data={data.periodComparisons.monthly} labels={['This Month', 'Last Month', 'MoM']} />
            </div>
          )}

          {/* 13. QoQ / YoY */}
          {data.periodComparisons && (
            <div className="grid gap-4 sm:grid-cols-2">
              <ComparisonTable title="Quarter over Quarter" data={data.periodComparisons.quarterly} labels={['This Quarter', 'Last Quarter', 'QoQ']} />
              <ComparisonTable title="Year over Year" data={data.periodComparisons.yearly} labels={['This Year', 'Last Year', 'YoY']} />
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

function ComparisonTable({ title, data, labels }) {
  if (!data) return null;

  const metrics = Object.entries(data).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    ...val,
  }));

  return (
    <Card>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
      <table className="w-full text-xs">
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
            <tr key={m.name} className="border-b last:border-0" style={{ borderColor: 'var(--border-light)' }}>
              <td className="py-2 font-medium text-foreground">{m.name}</td>
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
    { label: 'Reply Rate', value: `${engagement.replyRate}%`, sub: 'Threads with replies (30d)' },
    { label: 'Avg Replies / Thread', value: engagement.avgRepliesPerThread, sub: 'For threads with replies' },
    {
      label: 'Time to First Reply',
      value: engagement.avgTimeToFirstReplyHours ? `${engagement.avgTimeToFirstReplyHours}h` : 'N/A',
      sub: 'Average hours',
      color: engagement.avgTimeToFirstReplyHours == null ? null
        : engagement.avgTimeToFirstReplyHours < 1 ? '#10B981'
        : engagement.avgTimeToFirstReplyHours < 24 ? '#F59E0B' : '#EF4444',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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

function ForumBreakdownChart({ forums }) {
  if (!forums || forums.length === 0) return <SectionUnavailable label="Posts by Forum" />;

  return (
    <Card>
      <h2 className="text-sm font-semibold text-foreground">Posts by Forum (30 days)</h2>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={forums} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} width={120} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" name="Posts" fill="#5B2E91" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
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
  if (!pageViews) return <SectionUnavailable label="Site Traffic" />;

  return (
    <div className="space-y-4">
      {/* Traffic stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <p className="text-xs font-medium text-text-muted">Page Views Today</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#5B2E91' }}>{pageViews.today.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-text-muted">Visitors Today</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#2EC4B6' }}>{pageViews.uniqueToday.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-text-muted">Views This Week</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#5B2E91' }}>{pageViews.thisWeek.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-text-muted">Visitors This Week</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#2EC4B6' }}>{pageViews.uniqueThisWeek.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-text-muted">Views This Month</p>
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
