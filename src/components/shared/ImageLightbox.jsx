'use client';

import { useState, useEffect } from 'react';

export default function ImageLightbox() {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    const handleClick = (e) => {
      const img = e.target.closest('img[data-lightbox="true"]');
      if (img) {
        e.preventDefault();
        setSrc(img.src);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={() => setSrc(null)}
    >
      <img
        src={src}
        className="max-h-full max-w-full rounded-lg"
        alt="Full size"
      />
    </div>
  );
}
