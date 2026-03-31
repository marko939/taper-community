import MetabolicLanding from '@/components/metabolic/MetabolicLanding';

export const metadata = {
  title: 'Metabolic Health During Your Taper — Diet & Deprescribing | TaperCommunity',
  description:
    'How metabolic psychiatry and dietary interventions can support medication tapering. Ketogenic, low-carb, and anti-inflammatory approaches for people deprescribing psychiatric medications.',
  alternates: {
    canonical: '/metabolic',
  },
};

export default function MetabolicPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-6 sm:px-6">
      <MetabolicLanding />
    </div>
  );
}
