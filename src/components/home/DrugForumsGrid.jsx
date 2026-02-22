'use client';

import Link from 'next/link';
import { DRUG_LIST } from '@/lib/drugs';

export default function DrugForumsGrid() {
  return (
    <section>
      <h2 className="mb-1 font-serif text-2xl text-white">Drug-Specific Forums</h2>
      <p className="mb-6 text-sm text-brand-muted">
        Find support from others tapering the same medication.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DRUG_LIST.map((drug) => (
          <Link
            key={drug.slug}
            href={`/forums/${drug.slug}`}
            className="card group flex items-start gap-3 transition hover:border-brand-teal/30"
          >
            <div
              className="mt-1 h-10 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: drug.color }}
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-white group-hover:text-brand-teal transition">
                {drug.name}
              </h3>
              <p className="text-sm text-brand-muted">{drug.generic}</p>
              <span className="badge-teal mt-2">{drug.class}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
