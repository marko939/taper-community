import EducationPortal from '@/components/EducationPortal';

export const metadata = {
  title: 'Education — TaperCommunity',
  description:
    'Clinician deprescribing curriculum. Learn about neuroadaptation, hyperbolic tapering, SSRI/SNRI/benzodiazepine protocols, and patient communication.',
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

export default function EducationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <EducationPortal />
    </>
  );
}
