'use client';

import Link from 'next/link';
import { getDietBySlug } from '@/lib/metabolic/diets';
import DietBadge from './DietBadge';
import Accordion from './Accordion';

function FoodList({ title, items, color, bgColor, borderColor }) {
  return (
    <div className="rounded-xl border-l-4 p-4" style={{ borderColor: borderColor, background: bgColor }}>
      <h3 className="mb-3 text-sm font-bold" style={{ color }}>{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="text-base">{item.icon}</span>
            <span>{item.item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FoodGuide({ slug }) {
  const diet = getDietBySlug(slug);

  if (!diet) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Diet not found</h1>
        <Link href="/metabolic/diets" className="mt-4 inline-block text-sm" style={{ color: 'var(--metabolic-green)' }}>
          View all diet approaches
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1
          className="text-2xl font-bold sm:text-3xl"
          style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--foreground)' }}
        >
          {diet.name} Food Guide
        </h1>
        <DietBadge label={diet.name} color={diet.badgeColor} />
      </div>
      <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {diet.description}
      </p>

      {/* Traffic light food lists */}
      <div className="mt-8 space-y-4">
        <FoodList
          title="Eat freely"
          items={diet.foods.eatFreely}
          color="#166534"
          bgColor="#F0FDF4"
          borderColor="#22C55E"
        />
        <FoodList
          title="Eat occasionally"
          items={diet.foods.eatOccasionally}
          color="#92400E"
          bgColor="#FFFBEB"
          borderColor="#F59E0B"
        />
        <FoodList
          title="Minimize or avoid"
          items={diet.foods.minimize}
          color="#991B1B"
          bgColor="#FEF2F2"
          borderColor="#EF4444"
        />
      </div>

      {/* Electrolytes callout */}
      <div
        className="mt-8 rounded-2xl border p-5"
        style={{
          background: 'var(--metabolic-green-ghost)',
          borderColor: 'var(--metabolic-green-light)',
        }}
      >
        <h2 className="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--metabolic-green-dark)' }}>
          <span>⚡</span> Electrolytes — why they matter during keto and tapering
        </h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--metabolic-green-dark)' }}>
          {diet.electrolytes.why}
        </p>
        <div className="mt-4 space-y-3">
          {diet.electrolytes.minerals.map((mineral) => (
            <div key={mineral.name} className="rounded-xl bg-white/60 p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{mineral.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>{mineral.amount}</span>
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{mineral.sources}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Budget tips */}
      <div className="mt-6">
        <Accordion title="Budget-friendly tips">
          <ul className="space-y-2">
            {diet.budgetTips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--metabolic-green)' }}>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Accordion>
      </div>

      {/* Low-effort meals */}
      <div className="mt-8">
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
          Low-effort meals for low-energy days
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-subtle)' }}>
          Simple meals you can make when motivation is low. No complicated recipes — just practical food.
        </p>
        <div className="mt-4 space-y-3">
          {diet.lowEffortMeals.map((meal) => (
            <div
              key={meal.name}
              className="rounded-xl border p-4"
              style={{ background: 'var(--surface-strong)', borderColor: 'var(--border-subtle)' }}
            >
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{meal.name}</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{meal.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Meal Generator CTA */}
      <div
        className="mt-8 flex flex-col items-center gap-3 rounded-2xl border p-6 text-center"
        style={{ background: 'var(--metabolic-green-ghost)', borderColor: 'var(--metabolic-green-light)' }}
      >
        <span className="text-2xl">🤖</span>
        <p className="text-sm font-medium" style={{ color: 'var(--metabolic-green-dark)' }}>
          Want a personalized meal idea? Try our AI-powered meal generator.
        </p>
        <Link
          href={`/tools/meal-generator?diet=${diet.slug}`}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold no-underline transition"
          style={{ background: 'var(--metabolic-green)', color: '#fff' }}
        >
          Generate a meal idea with AI
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Sources */}
      <div className="mt-10 border-t pt-6" style={{ borderColor: 'var(--border-subtle)' }}>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-subtle)' }}>Reference sources</h3>
        <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          <li><a href="https://dietdoctor.com/low-carb/foods" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--metabolic-green)' }}>Diet Doctor — Food guides</a></li>
          <li><a href="https://metabolicmind.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--metabolic-green)' }}>Metabolic Mind</a></li>
          <li><a href="https://diagnosisdiet.com/food-guides" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--metabolic-green)' }}>Georgia Ede — Food guides</a></li>
        </ul>
      </div>
    </div>
  );
}
