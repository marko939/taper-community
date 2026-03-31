'use client';

import { useState } from 'react';
import { DIETS } from '@/lib/metabolic/diets';
import FoodGuide from './FoodGuide';

const BADGE_COLORS = {
  indigo: { bg: 'var(--metabolic-indigo-light)', color: '#4338CA', border: '#C7D2FE' },
  teal: { bg: 'var(--metabolic-green-light)', color: 'var(--metabolic-green-dark)', border: '#99F6E4' },
  amber: { bg: 'var(--metabolic-amber-light)', color: '#B45309', border: '#FDE68A' },
  gray: { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' },
};

export default function FoodGuideSwitcher() {
  const [activeSlug, setActiveSlug] = useState('ketogenic');

  return (
    <div>
      <h1
        className="text-2xl font-bold sm:text-3xl"
        style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--foreground)' }}
      >
        Food Guides
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        Select a diet to see what to eat, electrolyte guidance, budget tips, and simple meal ideas.
      </p>

      {/* Diet switcher */}
      <div className="mt-4 flex flex-wrap gap-2">
        {DIETS.map((diet) => {
          const isActive = diet.slug === activeSlug;
          const colors = BADGE_COLORS[diet.badgeColor] || BADGE_COLORS.teal;
          return (
            <button
              key={diet.slug}
              onClick={() => setActiveSlug(diet.slug)}
              className="rounded-full border px-4 py-2 text-sm font-medium transition"
              style={{
                borderColor: isActive ? colors.border : 'var(--border-subtle)',
                background: isActive ? colors.bg : 'var(--surface-strong)',
                color: isActive ? colors.color : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {diet.name}
            </button>
          );
        })}
      </div>

      {/* Food guide content */}
      <div className="mt-6">
        <FoodGuide slug={activeSlug} />
      </div>
    </div>
  );
}
