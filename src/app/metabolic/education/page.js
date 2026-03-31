import MetabolicEducation from '@/components/metabolic/MetabolicEducation';

export const metadata = {
  title: 'Metabolic Psychiatry for Deprescribing — Education Hub | TaperCommunity',
  description:
    'Learn how diet supports medication tapering. Blood sugar, mitochondria, inflammation, and metabolic psychiatry — all through the lens of deprescribing.',
  alternates: { canonical: '/metabolic/education' },
};

export default function EducationHubPage() {
  return <MetabolicEducation />;
}
