'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/metabolic', label: 'Overview', exact: true },
  { href: '/metabolic/diets', label: 'Diet Approaches' },
  { href: '/metabolic/food-guides', label: 'Food Guides' },
  { href: '/metabolic/education', label: 'Education Hub' },
  { href: '/tools/meal-generator', label: 'Meal Generator' },
  { href: '/metabolic/videos', label: 'Videos & Talks' },
];

export default function MetabolicNav() {
  const pathname = usePathname();

  const isActive = (link) => {
    if (link.exact) return pathname === link.href;
    return pathname === link.href || pathname.startsWith(link.href + '/');
  };

  return (
    <nav
      className="-mx-4 mb-6 overflow-x-auto rounded-none sm:-mx-6"
      style={{
        background: '#6B4A99',
        borderRadius: 12,
      }}
    >
      <div className="flex min-w-max px-4 sm:px-6">
        {LINKS.map((link) => {
          const active = isActive(link);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative flex-shrink-0 px-3 py-3 text-sm font-medium no-underline transition sm:px-4"
              style={{
                color: active ? '#ffffff' : 'rgba(255,255,255,0.65)',
              }}
            >
              {link.label}
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: '#ffffff' }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
