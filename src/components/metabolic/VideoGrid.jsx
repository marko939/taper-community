'use client';

import { VIDEO_LEVELS, getVideosByLevel } from '@/lib/metabolic/videos';
import LazyYouTube from './LazyYouTube';

const LEVEL_STYLES = {
  Beginner: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  Intermediate: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  'Deep Dive': { bg: '#EDE9FE', color: '#5B21B6', border: '#DDD6FE' },
};

export default function VideoGrid() {
  return (
    <div>
      <h1
        className="text-2xl font-bold sm:text-3xl"
        style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--foreground)' }}
      >
        Videos & Talks
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Curated talks from leading researchers and clinicians in metabolic psychiatry. Click to play — videos load only when you are ready to watch.
      </p>

      <div className="mt-8 space-y-10">
        {VIDEO_LEVELS.map((level) => {
          const videos = getVideosByLevel(level);
          const style = LEVEL_STYLES[level];
          if (videos.length === 0) return null;
          return (
            <div key={level}>
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                  style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                >
                  {level}
                </span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="overflow-hidden rounded-2xl border"
                    style={{ background: 'var(--surface-strong)', borderColor: 'var(--border-subtle)' }}
                  >
                    <LazyYouTube videoId={video.videoId} title={video.title} />
                    <div className="p-4">
                      <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{video.title}</h3>
                      <p className="mt-1 text-xs font-medium" style={{ color: 'var(--metabolic-green)' }}>
                        {video.speaker} <span style={{ color: 'var(--text-subtle)' }}>· {video.credential}</span>
                      </p>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {video.summary}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: style.bg, color: style.color }}
                        >
                          {video.level}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>{video.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
