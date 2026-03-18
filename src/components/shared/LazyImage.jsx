'use client';

import { useRef, useState, useEffect } from 'react';

/**
 * Lazy-loaded image with IntersectionObserver.
 * Shows a purple-tinted skeleton placeholder until visible in viewport.
 */
export default function LazyImage({ src, alt, className = '', style, ...props }) {
  const imgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px' } // start loading 200px before visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={style}>
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse rounded"
          style={{ background: 'var(--purple-ghost)' }}
        />
      )}

      {/* Actual image — only set src when visible */}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...props}
        />
      )}
    </div>
  );
}
