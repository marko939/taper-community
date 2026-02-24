'use client';

const BADGE_SIZES = {
  sm: { size: 14, offset: -2, fontSize: 7 },
  md: { size: 16, offset: -2, fontSize: 8 },
  lg: { size: 18, offset: -1, fontSize: 8 },
  xl: { size: 24, offset: 0, fontSize: 10 },
};

export default function Avatar({ name = 'A', avatarUrl, size = 'md', className = '', foundingMember = false }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-20 w-20 text-2xl',
  };

  const initial = name?.charAt(0)?.toUpperCase() || 'A';

  // Purple-themed gradient palette matching dashboard
  const gradients = [
    'linear-gradient(135deg, #5B2E91, #7B4FAF)',
    'linear-gradient(135deg, #3D1D63, #5B2E91)',
    'linear-gradient(135deg, #7B4FAF, #2EC4B6)',
    'linear-gradient(135deg, #2EC4B6, #34A853)',
    'linear-gradient(135deg, #5B2E91, #E06832)',
    'linear-gradient(135deg, #3D1D63, #7B4FAF)',
    'linear-gradient(135deg, #E8A838, #E06832)',
    'linear-gradient(135deg, #7B4FAF, #5B2E91)',
  ];
  const colorIndex = name
    ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length
    : 0;

  const badge = foundingMember ? BADGE_SIZES[size] : null;

  const avatarEl = avatarUrl ? (
    <img
      src={avatarUrl}
      alt={name || 'Avatar'}
      className={`rounded-full object-cover ${sizes[size]}`}
    />
  ) : (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white ${sizes[size]}`}
      style={{ background: gradients[colorIndex] }}
    >
      {initial}
    </div>
  );

  if (!badge) {
    return <div className={`relative shrink-0 ${className}`}>{avatarEl}</div>;
  }

  return (
    <div className={`relative shrink-0 ${className}`}>
      {avatarEl}
      <div
        className="absolute flex items-center justify-center rounded-full border-2 border-white"
        style={{
          width: badge.size,
          height: badge.size,
          bottom: badge.offset,
          right: badge.offset,
          background: 'linear-gradient(135deg, #E8A838, #E06832)',
          fontSize: badge.fontSize,
          lineHeight: 1,
        }}
        title="Founding Member"
      >
        <span style={{ filter: 'drop-shadow(0 0.5px 0.5px rgba(0,0,0,0.2))' }}>⭐</span>
      </div>
    </div>
  );
}
