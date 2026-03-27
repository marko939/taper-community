'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { DRUG_LIST } from '@/lib/drugs';

export default function DrugAutocomplete({ value, onChange, placeholder = 'Search for a medication...' }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  // Filter drugs by query (name or generic, case-insensitive)
  const filtered = query.trim().length > 0
    ? DRUG_LIST.filter((d) => {
        const q = query.trim().toLowerCase();
        return d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q);
      })
    : DRUG_LIST;

  // Include "Other" option at the end
  const results = [...filtered, { name: 'Other', generic: 'not listed', slug: 'other', _isOther: true }];

  // Sync external value changes
  useEffect(() => {
    if (value && value !== query) {
      const drug = DRUG_LIST.find((d) => d.name === value);
      setQuery(drug ? `${drug.name} (${drug.generic})` : value === 'other' ? 'Other' : value);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectDrug = useCallback((drug) => {
    if (drug._isOther) {
      onChange('other');
      setQuery('Other');
    } else {
      onChange(drug.name);
      setQuery(`${drug.name} (${drug.generic})`);
    }
    setOpen(false);
    setActiveIndex(-1);
  }, [onChange]);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          selectDrug(results[activeIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex];
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group filtered results by class for display
  const groupedResults = {};
  for (const drug of results) {
    if (drug._isOther) continue;
    const cls = drug.class || 'Other';
    if (!groupedResults[cls]) groupedResults[cls] = [];
    groupedResults[cls].push(drug);
  }

  // Highlight matching text
  const highlight = (text) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-bold" style={{ color: 'var(--purple)' }}>{text.slice(idx, idx + query.trim().length)}</span>
        {text.slice(idx + query.trim().length)}
      </>
    );
  };

  // Flat index tracker for keyboard navigation
  let flatIndex = -1;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--text-subtle)' }}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
            // Clear selection if user edits
            if (value) onChange('');
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input w-full pl-9"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange('');
              setOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-subtle)' }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border shadow-lg"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-muted">
              No medications found
            </div>
          ) : (
            Object.entries(groupedResults).map(([cls, drugs]) => (
              <div key={cls}>
                <div
                  className="sticky top-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-subtle)', background: 'var(--background)' }}
                >
                  {cls}
                </div>
                {drugs.map((drug) => {
                  flatIndex++;
                  const idx = flatIndex;
                  return (
                    <button
                      key={drug.slug}
                      type="button"
                      onClick={() => selectDrug(drug)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                        activeIndex === idx ? 'bg-purple-ghost' : 'hover:bg-purple-ghost/50'
                      }`}
                    >
                      <span className="text-foreground">{highlight(drug.name)}</span>
                      <span className="text-text-subtle">({highlight(drug.generic)})</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
          {/* "Other" option always at bottom */}
          {(() => {
            flatIndex++;
            const idx = flatIndex;
            return (
              <button
                key="other"
                type="button"
                onClick={() => selectDrug({ name: 'Other', _isOther: true })}
                className={`flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm transition ${
                  activeIndex === idx ? 'bg-purple-ghost' : 'hover:bg-purple-ghost/50'
                }`}
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <span className="text-foreground">Other</span>
                <span className="text-text-subtle">(not listed)</span>
              </button>
            );
          })()}
        </div>
      )}
    </div>
  );
}
