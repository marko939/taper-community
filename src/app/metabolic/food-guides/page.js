import FoodGuideSwitcher from '@/components/metabolic/FoodGuideSwitcher';

export const metadata = {
  title: 'Food Guides — Metabolic Health & Diet | TaperCommunity',
  description:
    'Explore food guides for ketogenic, low-carb, anti-inflammatory, and carnivore diets. Traffic-light food lists, electrolyte guidance, and budget tips.',
  alternates: { canonical: '/metabolic/food-guides' },
};

export default function FoodGuidesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-6 sm:px-6">
      <FoodGuideSwitcher />
    </div>
  );
}
