import Link from 'next/link';

export const metadata = {
  title: 'About TaperCommunity — Continuing the SA.org Legacy',
  description:
    'TaperCommunity continues the mission of SurvivingAntidepressants.org, providing peer support for safely tapering psychiatric medications.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-4xl font-semibold text-foreground">About TaperCommunity</h1>
        <p className="mt-4 text-lg leading-relaxed text-text-muted">
          TaperCommunity is a peer support forum for people tapering psychiatric medications.
          We continue the mission of SurvivingAntidepressants.org (SA.org), which provided
          15+ years of invaluable support before going read-only in January 2026.
        </p>
      </div>

      <section className="card">
        <h2 className="text-2xl font-semibold text-accent-blue">The SA.org Legacy</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-muted">
          <p>
            SurvivingAntidepressants.org was the gold-standard peer support community for
            psychiatric drug withdrawal. Founded in 2011, it accumulated thousands of personal
            tapering stories, pioneered the 10% tapering rule in the peer community, and helped
            countless people safely reduce their medications.
          </p>
          <p>
            When SA.org went read-only, the community lost its primary gathering place.
            TaperCommunity was built to fill that gap — replicating SA.org&apos;s depth of
            information architecture while providing a modern, accessible experience.
          </p>
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-semibold text-foreground">Our Principles</h2>
        <div className="mt-4 space-y-4">
          {[
            {
              title: 'Gradual, individualized tapering',
              text: 'We advocate for the 10% rule: reduce by no more than 10% of your current dose. Every person is different — there is no one-size-fits-all taper schedule.',
            },
            {
              title: 'Peer support, not medical advice',
              text: 'We are peers sharing our experiences, not doctors. We never give specific dosing advice. All medication decisions should be made with a qualified healthcare provider.',
            },
            {
              title: 'Evidence-based information',
              text: 'Our guidelines reference the Maudsley Deprescribing Guidelines, the Ashton Manual, and published clinical research. We distinguish between peer experience and clinical evidence.',
            },
            {
              title: 'Respect for autonomy',
              text: 'Each person has the right to make informed decisions about their own medication. We provide information and support — never judgment.',
            },
          ].map((principle) => (
            <div key={principle.title} className="flex gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-blue" />
              <div>
                <h3 className="font-semibold text-foreground">{principle.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{principle.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-semibold text-foreground">How It Works</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-text-muted">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                step: '1',
                title: 'Read the Guidelines',
                text: 'Start with our tapering guidelines to understand the 10% rule and available methods.',
              },
              {
                step: '2',
                title: 'Set Up Your Profile',
                text: 'Add your drug history signature and create your Introduction topic.',
              },
              {
                step: '3',
                title: 'Join the Conversation',
                text: 'Browse drug-specific forums, share your experience, and learn from others.',
              },
              {
                step: '4',
                title: 'Track Your Progress',
                text: 'Use the Taper Journal to log daily symptoms, mood, and dose changes.',
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-border-subtle p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/10 text-sm font-bold text-accent-blue">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card border-amber-200 bg-amber-50/50">
        <h2 className="text-xl font-semibold text-amber-600">Important Disclaimer</h2>
        <p className="mt-3 text-sm leading-relaxed text-amber-700">
          TaperCommunity is a peer support platform. Content shared here is based on personal
          experiences and should not replace professional medical advice. Never adjust your
          medication without consulting a qualified healthcare provider. Withdrawal from
          psychiatric medication can be dangerous — always taper under medical supervision.
          If you are in crisis, call the 988 Suicide &amp; Crisis Lifeline.
        </p>
      </section>

      <div className="flex flex-col items-center gap-4 py-4 text-center sm:flex-row sm:text-left">
        <div className="flex-1">
          <p className="text-text-muted">Ready to join?</p>
        </div>
        <div className="flex gap-3">
          <Link href="/education" className="btn btn-secondary text-sm">
            Education
          </Link>
          <Link href="/auth/signup" className="btn btn-primary text-sm">
            Join Community
          </Link>
        </div>
      </div>
    </div>
  );
}
