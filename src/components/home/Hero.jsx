'use client';

import Image from 'next/image';

export default function Hero() {
  return (
    <div className="w-full h-[280px] md:h-[380px] relative overflow-hidden">
      <Image
        src="/images/hero-banner.png"
        alt="TaperCommunity"
        fill
        priority
        className="object-cover object-center"
      />
    </div>
  );
}
