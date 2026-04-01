import { Suspense } from 'react';
import MealGenerator from '@/components/metabolic/MealGenerator';
import MetabolicNav from '@/components/metabolic/MetabolicNav';

export const metadata = {
  title: 'AI Meal Idea Generator — Metabolic Health & Diet | TaperCommunity',
  description:
    'Generate simple, budget-friendly meal ideas tailored to ketogenic, low-carb, or anti-inflammatory diets. Designed for people tapering psychiatric medications.',
  alternates: { canonical: '/tools/meal-generator' },
};

export default function MealGeneratorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <MetabolicNav />
      <Suspense fallback={<div className="py-12 text-center text-sm" style={{ color: 'var(--text-subtle)' }}>Loading...</div>}>
        <MealGenerator />
      </Suspense>
    </div>
  );
}
