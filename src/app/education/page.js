import EducationPortal from '@/components/EducationPortal';

export const metadata = {
  title: 'Deprescribing Education — Medication Tapering Curriculum | TaperCommunity',
  description:
    'Clinician deprescribing curriculum. Learn about neuroadaptation, hyperbolic tapering, SSRI/SNRI/benzodiazepine protocols, and patient communication.',
  alternates: {
    canonical: '/education',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is hyperbolic tapering?',
      acceptedAnswer: { '@type': 'Answer', text: 'Hyperbolic tapering is an evidence-based dose-reduction method where cuts get proportionally smaller as the dose decreases. This follows the hyperbolic relationship between dose and serotonin transporter occupancy, minimizing withdrawal symptoms.' },
    },
    {
      '@type': 'Question',
      name: 'Why is tapering psychiatric medications so difficult?',
      acceptedAnswer: { '@type': 'Answer', text: 'Psychiatric medications cause neuroadaptation — the brain adjusts to the drug over time. When the drug is reduced too quickly, the brain cannot re-adapt fast enough, leading to withdrawal symptoms. Slower, more gradual tapers allow the brain to adjust.' },
    },
    {
      '@type': 'Question',
      name: 'What is the recommended taper rate for antidepressants?',
      acceptedAnswer: { '@type': 'Answer', text: 'The Maudsley Deprescribing Guidelines recommend reducing by approximately 10% of the current dose every 2-4 weeks. At lower doses, reductions should be proportionally smaller to account for the hyperbolic dose-receptor relationship.' },
    },
    {
      '@type': 'Question',
      name: 'What is TaperCommunity?',
      acceptedAnswer: { '@type': 'Answer', text: 'TaperCommunity is a peer support platform for people safely tapering psychiatric medications. It continues the legacy of SurvivingAntidepressants.org, providing evidence-based guidance, shared experiences, taper journals, and a deprescriber directory.' },
    },
  ],
};

/* Server-rendered curriculum outline for SEO — Googlebot indexes this even
   though the interactive portal requires JS. Hidden from sighted users via
   sr-only so it doesn't affect the visual layout. */
const CURRICULUM_OUTLINE = [
  { layer: 'Introduction', modules: ['Introduction to Deprescribing'] },
  { layer: 'Layer 1 — The Foundation', modules: [
    'What Happens at the Receptor — Neuroadaptation and receptor occupancy',
    'Withdrawal Is Not Relapse — Differentiating withdrawal from relapse',
    'The Wave-and-Window Pattern — Understanding non-linear recovery',
    'The Reinstatement Trap — When stopping fails and patients return to medication',
  ]},
  { layer: 'Layer 2 — The Protocols', modules: [
    'Hyperbolic Tapering in Practice — Building evidence-based taper schedules',
    'SSRI Deprescribing — Escitalopram, sertraline, paroxetine, fluoxetine protocols',
    'SNRI Deprescribing — Venlafaxine and duloxetine tapering',
    'Benzodiazepine Tapering — The Ashton approach for lorazepam, diazepam, and alprazolam',
    'Patient Assessment and Readiness — When to taper and when to wait',
  ]},
  { layer: 'Layer 3 — The Hard Stuff', modules: [
    'Polypharmacy — Sequencing tapers across multiple medications',
    'Protracted Withdrawal — Managing symptoms months after discontinuation',
    'The Difficult Conversations — Communicating with patients, families, and colleagues',
    'Using Data to Guide Decisions — Symptom tracking and objective measures',
  ]},
];

export default function EducationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <EducationPortal />
      {/* Server-rendered content for search engine crawlers */}
      <div className="sr-only" aria-hidden="false">
        <h1>Deprescribing Education: Medication Tapering Curriculum</h1>
        <p>
          A comprehensive, evidence-based curriculum for clinicians learning to safely
          taper psychiatric medications. Covers neuroadaptation, hyperbolic tapering,
          SSRI/SNRI/benzodiazepine protocols, and patient communication — built around
          real clinical scenarios.
        </p>
        {CURRICULUM_OUTLINE.map((section) => (
          <div key={section.layer}>
            <h3>{section.layer}</h3>
            <ul>
              {section.modules.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        ))}
        <p>
          Each module includes learning objectives, patient scenarios, video lectures
          from leading deprescribing researchers, clinical pearls, and self-assessment
          quizzes. Free to access with a TaperCommunity account.
        </p>
      </div>
    </>
  );
}
