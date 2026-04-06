import Link from 'next/link';

export const metadata = {
  title: 'TaperCommunity vs BenzoBuddies — Compare Tapering Communities',
  description:
    'Compare TaperCommunity and BenzoBuddies. TC covers all drug classes with shareable taper journals, education, and a deprescriber directory.',
  alternates: { canonical: '/compare/benzobuddies' },
};

const FEATURES = [
  { feature: 'Active forums', tc: true, competitor: true, note: 'Both have active peer support forums' },
  { feature: 'Shareable taper journal', tc: true, competitor: false, note: 'Document doses, symptoms, and milestones — share with your prescriber' },
  { feature: 'Deprescriber directory', tc: true, competitor: false, note: '57+ verified providers' },
  { feature: 'Drug education portal', tc: true, competitor: false, note: '31 drug profiles + deprescribing curriculum' },
  { feature: 'Tapering protocols', tc: true, competitor: true, note: 'TC provides phased reduction schedules per drug' },
  { feature: 'Drug class coverage', tc: 'All classes', competitor: 'Benzos only', note: 'TC covers SSRIs, SNRIs, antipsychotics, and more' },
  { feature: 'Ashton Manual reference', tc: true, competitor: true, note: 'TC links Ashton Manual + Maudsley guidance per drug' },
  { feature: 'Mobile-friendly', tc: true, competitor: false, note: 'Modern responsive design' },
  { feature: 'Free to use', tc: true, competitor: true, note: 'Both are free communities' },
];

function Check() {
  return (
    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function Cross() {
  return (
    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function CompareBenzoBuddiesPage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center">
        <p className="section-eyebrow">Compare</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          TaperCommunity vs BenzoBuddies
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">
          BenzoBuddies is a well-known community focused on benzodiazepine withdrawal support.
          TaperCommunity covers all psychiatric drug classes with shareable taper journals,
          a deprescribing provider directory, and comprehensive drug education.
        </p>
      </section>

      {/* Comparison Table */}
      <section className="glass-panel overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--purple), var(--purple-light))' }} />
        <div className="overflow-x-auto p-6 sm:p-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="pb-3 pr-4 text-left text-xs font-semibold text-text-muted">Feature</th>
                <th className="pb-3 pr-4 text-center text-xs font-bold text-purple">TaperCommunity</th>
                <th className="pb-3 pr-4 text-center text-xs font-semibold text-text-muted">BenzoBuddies</th>
                <th className="pb-3 text-left text-xs font-semibold text-text-subtle">Notes</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((row, i) => (
                <tr key={i} className={i < FEATURES.length - 1 ? 'border-b border-border-subtle/50' : ''}>
                  <td className="py-3.5 pr-4 font-medium text-foreground">{row.feature}</td>
                  <td className="py-3.5 pr-4 text-center">
                    {row.tc === true ? <Check /> : <span className="text-sm font-medium text-purple">{row.tc}</span>}
                  </td>
                  <td className="py-3.5 pr-4 text-center">
                    {row.competitor === true ? <Check /> : row.competitor === false ? <Cross /> : <span className="text-sm text-text-muted">{row.competitor}</span>}
                  </td>
                  <td className="py-3.5 text-xs text-text-subtle">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why TC for benzo tapers */}
      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: 'Beyond Benzos',
            desc: 'Many members taper multiple drugs simultaneously. TC covers SSRIs, SNRIs, antipsychotics, Z-drugs, gabapentinoids, and more — all in one place.',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            ),
          },
          {
            title: 'Shareable Taper Journal',
            desc: 'Document every dose change with timestamps and symptoms. Spot patterns, identify holds, and share your progress with your prescriber.',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            ),
          },
          {
            title: 'Find a Deprescriber',
            desc: '57+ providers experienced with benzodiazepine tapering. Many follow Ashton Manual protocols and accept telehealth appointments.',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            ),
          },
        ].map((card) => (
          <div key={card.title} className="glass-panel p-6">
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
            >
              {card.icon}
            </div>
            <h3 className="text-sm font-bold text-foreground">{card.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">{card.desc}</p>
          </div>
        ))}
      </section>

      {/* Benzo-specific content */}
      <section className="glass-panel p-6 sm:p-8">
        <p className="section-eyebrow">Benzodiazepine Support on TC</p>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          TaperCommunity hosts dedicated forums and drug profiles for every major benzodiazepine
          including Xanax (alprazolam), Klonopin (clonazepam), Ativan (lorazepam), and Valium (diazepam).
          Each drug profile includes Ashton Manual guidance, Maudsley deprescribing recommendations,
          evidence-based tapering protocols, withdrawal timelines, and community-sourced practical tips.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          The taper journal lets you document benzodiazepine-specific concerns like interdose withdrawal,
          tolerance withdrawal, and the protracted symptoms that can persist well beyond acute withdrawal.
          Members in our benzo forums share strategies for liquid titration, compounding pharmacies,
          and working with prescribers who understand slow tapers.
        </p>
      </section>

      {/* CTA */}
      <section className="rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg, var(--purple-ghost), var(--surface-strong))' }}>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Ready to start your taper journey?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-text-muted">
          Join 100+ members who are safely tapering with peer support, shared taper journals, and access to deprescribing providers.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="btn btn-primary px-8 py-3 text-sm no-underline"
          >
            Join for Free
          </Link>
          <Link
            href="/drugs"
            className="btn btn-secondary px-8 py-3 text-sm no-underline"
          >
            Browse Drug Profiles
          </Link>
        </div>
        <p className="mt-4 text-xs text-text-subtle">Free forever. No credit card required.</p>
      </section>
    </div>
  );
}
