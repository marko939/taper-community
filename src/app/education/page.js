import Link from 'next/link';

export const metadata = {
  title: 'Education — TaperCommunity',
  description:
    'Learn about tapering methods, how to distinguish withdrawal from relapse, and the windows and waves pattern of recovery.',
};

export default function EducationPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div>
        <h1 className="text-4xl font-semibold text-foreground">Education</h1>
        <p className="mt-3 text-lg text-text-muted">
          Evidence-based information on safely reducing psychiatric medications.
          Based on the Maudsley Deprescribing Guidelines, Ashton Manual, and
          15+ years of peer experience from SurvivingAntidepressants.org.
        </p>
      </div>

      <section className="card">
        <h2 className="text-2xl font-semibold text-foreground">Tapering Methods</h2>
        <div className="mt-4 space-y-6 text-sm leading-relaxed text-text-muted">
          <div>
            <h3 className="text-lg font-semibold text-accent-blue">Water Titration</h3>
            <p className="mt-2">
              Dissolve a tablet in a precise volume of water to create a liquid solution for
              accurate dosing.
            </p>
            <ol className="mt-3 list-inside list-decimal space-y-1 text-text-muted">
              <li>Dissolve one tablet in a measured volume of water (e.g., 100mL)</li>
              <li>Calculate concentration (e.g., 10mg tablet &divide; 100mL = 0.1mg/mL)</li>
              <li>Measure your dose with an oral syringe</li>
              <li>Discard the remainder &mdash; make fresh daily</li>
            </ol>
            <p className="mt-2 text-xs text-amber-600">
              Not all medications dissolve well in water. Check with your pharmacist. Extended-release
              formulations should NOT be dissolved.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-accent-blue">Bead Counting</h3>
            <p className="mt-2">
              For capsule medications (like Effexor XR, Cymbalta) that contain countable pellets/beads.
            </p>
            <ol className="mt-3 list-inside list-decimal space-y-1 text-text-muted">
              <li>Open the capsule carefully over a clean surface</li>
              <li>Count total beads to establish your baseline</li>
              <li>Remove a small number (5&ndash;10% of total)</li>
              <li>Return remaining beads and close the capsule</li>
              <li>Use a jewelry scale for precision</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-accent-blue">Liquid Formulation</h3>
            <p className="mt-2">
              Many SSRIs are available as manufacturer-made liquid/oral solution. This is the most
              precise method. Ask your prescriber or pharmacist about availability for your specific
              medication.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-accent-blue">Compounding Pharmacy</h3>
            <p className="mt-2">
              A compounding pharmacy can prepare custom-dose capsules or liquid formulations at
              specific doses not commercially available. Essential for drugs like Pristiq that
              cannot be split.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-semibold text-foreground">Withdrawal vs. Relapse</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-text-muted">
          <p>
            One of the most critical skills in tapering: distinguishing withdrawal symptoms from
            a return of the original condition. Many people are incorrectly told their withdrawal
            symptoms mean they &quot;need&quot; the medication.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-4">
              <h3 className="font-semibold text-accent-blue">Withdrawal</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-text-muted">
                <li>Starts within days of a dose change</li>
                <li>Physical symptoms: brain zaps, dizziness, nausea</li>
                <li>Symptoms improve over weeks</li>
                <li>Often includes novel symptoms never had before</li>
                <li>Pattern of &quot;windows and waves&quot;</li>
              </ul>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <h3 className="font-semibold text-amber-600">Relapse</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-text-muted">
                <li>Gradual onset weeks/months after stabilizing</li>
                <li>Resembles original condition closely</li>
                <li>Symptoms familiar from before medication</li>
                <li>No novel physical symptoms</li>
                <li>Persistent rather than wave-like</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-amber-600">
            If you&apos;re unsure, please consult a clinician who understands withdrawal.
            Use the{' '}
            <Link href="/journal" className="underline">
              Taper Journal
            </Link>{' '}
            to track your symptoms over time &mdash; the pattern will become clearer.
          </p>
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-semibold text-foreground">Windows and Waves</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-text-muted">
          <p>
            Recovery from withdrawal is not linear. Most people experience a pattern of
            <strong className="text-foreground"> windows</strong> (periods of feeling normal or better) and
            <strong className="text-foreground"> waves</strong> (periods where symptoms return or intensify).
          </p>
          <p>
            Over time, windows get longer and waves get shorter and milder. This pattern can
            persist for months after completing a taper. Knowing this is normal helps prevent
            the panic that can come during a wave.
          </p>
        </div>
      </section>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border-subtle bg-surface-glass p-8 text-center sm:flex-row sm:text-left">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">Ready to get started?</h2>
          <p className="mt-1 text-sm text-text-muted">
            Start tracking your journey in your Taper Journal and connect with the community.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/journal" className="btn btn-secondary text-sm">
            Open Journal
          </Link>
          <Link href="/forums" className="btn btn-primary text-sm">
            Browse Forums
          </Link>
        </div>
      </div>
    </div>
  );
}
