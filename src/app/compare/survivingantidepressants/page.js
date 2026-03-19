import Link from 'next/link';

export const metadata = {
  title: 'TaperCommunity vs SurvivingAntidepressants.org — SA.org Alternative',
  description:
    'Looking for a SurvivingAntidepressants.org alternative? TaperCommunity offers active forums, shareable taper journals, and 57+ deprescribing providers.',
  alternates: { canonical: '/compare/survivingantidepressants' },
};

const FEATURES = [
  { feature: 'Active forums', tc: true, competitor: true, note: 'SA.org forums have had extended downtime' },
  { feature: 'Shareable taper journal', tc: true, competitor: false, note: 'Document doses, symptoms, and milestones — share with your prescriber' },
  { feature: 'Deprescriber directory', tc: true, competitor: false, note: '57+ verified providers' },
  { feature: 'Drug education portal', tc: true, competitor: false, note: '31 drug profiles with evidence-based content' },
  { feature: 'Tapering protocols', tc: true, competitor: true, note: 'TC provides phased reduction schedules' },
  { feature: 'Drug class coverage', tc: 'All classes', competitor: 'Antidepressants', note: 'TC covers benzos, antipsychotics, and more' },
  { feature: 'Mobile-friendly', tc: true, competitor: false, note: 'Modern responsive design' },
  { feature: 'Free to use', tc: true, competitor: true, note: 'Both free, TC has no ads' },
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

export default function CompareSAPage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center">
        <p className="section-eyebrow">Compare</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          TaperCommunity vs SurvivingAntidepressants.org
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">
          SurvivingAntidepressants.org was a pioneering resource for antidepressant tapering support.
          TaperCommunity builds on that foundation with modern tools, expanded drug coverage, and a
          growing community of members safely tapering under peer support.
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
                <th className="pb-3 pr-4 text-center text-xs font-semibold text-text-muted">SA.org</th>
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

      {/* Why people switch */}
      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: 'Taper Journal',
            desc: 'Document every dose change, symptom, and pattern. Share your progress directly with your prescriber.',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            ),
          },
          {
            title: 'Deprescriber Directory',
            desc: '57+ providers experienced with deprescribing. Filter by drug class, insurance, and telehealth availability.',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            ),
          },
          {
            title: 'All Drug Classes',
            desc: 'Not just antidepressants. TC covers benzodiazepines, antipsychotics, Z-drugs, gabapentinoids, and more.',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
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

      {/* Heritage section */}
      <section className="glass-panel p-6 sm:p-8">
        <p className="section-eyebrow">The SA.org Legacy</p>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          SurvivingAntidepressants.org was one of the first online communities dedicated to psychiatric
          medication tapering. Founded by Altostrata, SA.org provided critical peer support to thousands
          of people withdrawing from antidepressants. Its forums documented real-world tapering experiences
          that were absent from clinical literature at the time.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          TaperCommunity carries that mission forward with modern tools: shareable taper journals
          for documenting dose changes and symptoms, 31 comprehensive drug profiles with evidence-based
          tapering protocols, a directory of deprescribing-aware providers, and active community forums
          covering all psychiatric drug classes.
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
