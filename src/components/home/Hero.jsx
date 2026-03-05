'use client';

import Image from 'next/image';

export default function Hero() {
  return (
    <div
      className="relative h-[280px] w-full overflow-hidden rounded-[24px] md:h-[380px]"
      style={{
        boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)',
      }}
    >
      <Image
        src="/images/hero-banner.png"
        alt="TaperCommunity"
        fill
        priority
        className="object-cover object-center"
      />
      {/* Dark purple overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'rgba(42,18,80,0.35)' }}
      />
      {/* Logo overlay */}
      <div className="absolute inset-0 z-10">
        <Image
          src="/images/hero-logo.png"
          alt="TaperCommunity"
          fill
          className="object-contain"
          priority
        />
      </div>
      {/* Bottom fade for smoother transition to content below */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background: 'linear-gradient(to top, rgba(246,244,250,0.7) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
