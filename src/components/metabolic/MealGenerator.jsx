'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DietBadge from './DietBadge';

const DIET_OPTIONS = [
  { value: 'ketogenic', label: 'Ketogenic', color: 'indigo' },
  { value: 'low-carb', label: 'Low-Carb', color: 'teal' },
  { value: 'anti-inflammatory', label: 'Anti-Inflammatory', color: 'amber' },
];

export default function MealGenerator() {
  const searchParams = useSearchParams();
  const [selectedDiet, setSelectedDiet] = useState('');
  const [ingredient, setIngredient] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-select diet from URL param
  useEffect(() => {
    const preselected = searchParams.get('diet');
    if (preselected && DIET_OPTIONS.some((d) => d.value === preselected)) {
      setSelectedDiet(preselected);
    }
  }, [searchParams]);

  async function handleGenerate() {
    if (!selectedDiet) {
      setErrorMsg('Please select a diet type before generating.');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch('/api/meal-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diet: selectedDiet, ingredient: ingredient.trim() || null }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Something went wrong — please try again in a moment.');
        setState('error');
        return;
      }

      setResult(data);
      setState('success');
    } catch {
      setErrorMsg('Something went wrong — please try again in a moment.');
      setState('error');
    }
  }

  function handleTryDifferentDiet() {
    setSelectedDiet('');
    setIngredient('');
    setResult(null);
    setState('idle');
    setErrorMsg('');
  }

  const dietOption = DIET_OPTIONS.find((d) => d.value === selectedDiet);

  return (
    <div className="mx-auto max-w-2xl">
      <h1
        className="text-2xl font-bold sm:text-3xl"
        style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--foreground)' }}
      >
        Meal Idea Generator
      </h1>
      <p className="mt-2 text-[15px]" style={{ color: 'var(--text-muted)' }}>
        Pick a diet, add an ingredient you have, and get a simple meal idea.
      </p>

      {/* Diet selector */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          I&apos;m eating:
        </label>
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedDiet(option.value)}
              className="rounded-full border px-4 py-2 text-sm font-medium transition"
              style={{
                borderColor: selectedDiet === option.value ? 'var(--metabolic-green)' : 'var(--border-subtle)',
                background: selectedDiet === option.value ? 'var(--metabolic-green)' : 'var(--surface-strong)',
                color: selectedDiet === option.value ? '#fff' : 'var(--text-muted)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredient input */}
      <div className="mt-5">
        <label htmlFor="ingredient" className="mb-1 block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          I have this ingredient (optional):
        </label>
        <input
          id="ingredient"
          type="text"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && selectedDiet) handleGenerate(); }}
          placeholder="e.g. chicken, eggs, salmon, spinach..."
          maxLength={60}
          className="input w-full"
        />
      </div>

      {/* Submit */}
      <div className="mt-5">
        <button
          onClick={handleGenerate}
          disabled={state === 'loading'}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
          style={{ background: 'var(--metabolic-green)' }}
        >
          {state === 'loading' ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : (
            'Generate meal idea'
          )}
        </button>
      </div>

      {/* Error */}
      {state === 'error' && errorMsg && (
        <div className="mt-4 rounded-xl border p-3" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
          <p className="text-sm" style={{ color: '#991B1B' }}>{errorMsg}</p>
        </div>
      )}

      {/* Result */}
      {state === 'success' && result && (
        <div
          className="mt-6 rounded-2xl border p-6"
          style={{ background: 'var(--surface-strong)', borderColor: 'var(--border-subtle)' }}
          role="region"
          aria-live="polite"
          aria-label="Generated meal idea"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              {result.meal_name}
            </h2>
            {dietOption && <DietBadge label={result.diet_label || dietOption.label} color={dietOption.color} />}
          </div>

          {result.why_it_works && (
            <div className="mt-4">
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Why this works</p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.why_it_works}</p>
            </div>
          )}

          {result.tapering_note && (
            <div
              className="mt-4 rounded-xl border-l-4 px-4 py-3"
              style={{ borderColor: 'var(--metabolic-green)', background: 'var(--metabolic-green-ghost)' }}
            >
              <p className="text-sm" style={{ color: 'var(--metabolic-green-dark)' }}>
                <span className="font-semibold">Tapering note:</span> {result.tapering_note}
              </p>
            </div>
          )}

          {result.ingredients && (
            <div className="mt-4">
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Ingredients</p>
              <ul className="mt-2 space-y-1">
                {result.ingredients.map((ing, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--metabolic-green)' }}>•</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.steps && (
            <div className="mt-4">
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Steps</p>
              <ol className="mt-2 space-y-2">
                {result.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ background: 'var(--metabolic-green)' }}
                    >
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleGenerate}
              className="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:bg-purple-ghost"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              Generate another
            </button>
            <button
              onClick={handleTryDifferentDiet}
              className="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:bg-purple-ghost"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              Try a different diet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
