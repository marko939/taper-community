import DietComparison from '@/components/metabolic/DietComparison';

export const metadata = {
  title: 'Diet Approaches for Deprescribing — Metabolic Health | TaperCommunity',
  description:
    'Compare ketogenic, low-carb, anti-inflammatory, and carnivore diets for supporting medication tapering. Evidence ratings and tapering fit.',
  alternates: { canonical: '/metabolic/diets' },
};

export default function DietsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-6 sm:px-6">
      <DietComparison />
    </div>
  );
}
