'use client';

export default function CategoryTabs({ categories = [], active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-brand-border">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`relative shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition ${
            cat.value === active ? 'text-white' : 'text-brand-muted hover:text-white'
          }`}
        >
          {cat.label}
          {cat.value === active && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-brand-teal" />
          )}
        </button>
      ))}
    </div>
  );
}
