'use client';

import dynamic from 'next/dynamic';

const DeprescribingMap = dynamic(
  () => import('@/components/home/DeprescribingMap'),
  { ssr: false }
);

export default function DeprescribersPage() {
  return (
    <div className="space-y-8">
      <DeprescribingMap compact={false} />
    </div>
  );
}
