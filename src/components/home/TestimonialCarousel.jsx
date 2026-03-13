'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const QUOTE_ICON = (
  <svg className="mb-3 h-6 w-6" style={{ color: 'var(--purple)' }} fill="currentColor" viewBox="0 0 24 24">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.983 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
  </svg>
);

// uid → testimonial index mapping for dynamic avatar fetching
const PROFILE_UIDS = {
  '2cf08926-2d7e-461f-b28b-3c83f1dfd850': 1, // Jules
  'b2fb8e00-bbd0-489b-a762-945fa811861f': 2, // Catina
};

const TESTIMONIALS = [
  {
    quote: "TaperCommunity is doing the work that our training programs haven\u2019t caught up to yet. I recommend it to patients who want to be informed and supported through the process.",
    name: 'Imraan Allarakhia, MD',
    role: 'Georgetown University School of Medicine',
    avatar: { type: 'image', src: '/images/dr-allarakhia.jpg' },
  },
  {
    quote: "When I started tapering ten years ago, most of us were figuring it out alone.\n\nThis space gives people what many of us never had: others who truly understand. That\u2019s why I\u2019m here. I just wish it had existed sooner.",
    name: 'Jules',
    role: 'Community Member',
    avatar: { type: 'letter', letter: 'J', bg: '#E07A5F' },
  },
  {
    quote: "Being able to track my taper is helping me in ways I never realized. I\u2019m proud to call Taper Community my new home.",
    name: 'Catina',
    role: 'Community Support Member',
    avatar: { type: 'letter', letter: 'C', bg: 'var(--purple)' },
  },
  {
    quote: "Being able to track my symptoms and share daily check-ins has made all the difference. The community keeps me accountable and reminds me I\u2019m not doing this alone. For the first time, I feel in control of my taper.",
    name: 'STVE',
    role: 'Member',
    avatar: { type: 'letter', letter: 'S', bg: '#2EC4B6' },
  },
];

export default function TestimonialCarousel() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [avatarUrls, setAvatarUrls] = useState({});

  // Fetch real avatar URLs for community members
  useEffect(() => {
    const uids = Object.keys(PROFILE_UIDS);
    if (uids.length === 0) return;
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('id, avatar_url')
      .in('id', uids)
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach((p) => {
          if (p.avatar_url) map[PROFILE_UIDS[p.id]] = p.avatar_url;
        });
        setAvatarUrls(map);
      });
  }, []);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('[data-card]')?.offsetWidth || 400;
    el.scrollBy({ left: dir === 'right' ? cardWidth + 16 : -(cardWidth + 16), behavior: 'smooth' });
    setTimeout(updateArrows, 400);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--purple)' }}>
            Trusted by Patients & Clinicians
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            What people are{' '}
            <span style={{ color: 'var(--purple)' }}>saying</span>
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:bg-white/60 disabled:opacity-30 disabled:cursor-default"
            style={{ borderColor: 'var(--border-subtle)' }}
            aria-label="Previous testimonial"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:bg-white/60 disabled:opacity-30 disabled:cursor-default"
            style={{ borderColor: 'var(--border-subtle)' }}
            aria-label="Next testimonial"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {TESTIMONIALS.map((t, idx) => {
          const dynamicUrl = avatarUrls[idx];
          return (
            <div
              key={t.name}
              data-card
              className="flex w-[calc(50%-8px)] min-w-[280px] flex-shrink-0 snap-start flex-col rounded-2xl border p-6"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
            >
              {QUOTE_ICON}
              <p className="flex-1 text-sm leading-relaxed text-text-muted whitespace-pre-line">{t.quote}</p>
              <div className="mt-4 flex items-center gap-3">
                {t.avatar.type === 'image' ? (
                  <Image
                    src={t.avatar.src}
                    alt={t.name}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                    style={{ width: 36, height: 36 }}
                  />
                ) : dynamicUrl ? (
                  <img
                    src={dynamicUrl}
                    alt={t.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: t.avatar.bg }}
                  >
                    {t.avatar.letter}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-text-subtle">{t.role}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
