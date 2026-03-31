import FoodGuide from '@/components/metabolic/FoodGuide';
import { DIET_SLUGS, getDietBySlug } from '@/lib/metabolic/diets';

export function generateStaticParams() {
  return DIET_SLUGS.map((diet) => ({ diet }));
}

export async function generateMetadata({ params }) {
  const { diet: dietSlug } = await params;
  const diet = getDietBySlug(dietSlug);
  if (!diet) return { title: 'Food Guide — TaperCommunity' };
  return {
    title: `${diet.name} Food Guide — Metabolic Health & Diet | TaperCommunity`,
    description: `${diet.name} food guide: what to eat freely, occasionally, and avoid. Electrolyte guidance, budget tips, and low-effort meals for tapering.`,
    alternates: { canonical: `/metabolic/food-guides/${diet.slug}` },
  };
}

export default async function FoodGuidePage({ params }) {
  const { diet } = await params;
  return (
    <div className="mx-auto max-w-4xl px-4 pb-6 sm:px-6">
      <FoodGuide slug={diet} />
    </div>
  );
}
