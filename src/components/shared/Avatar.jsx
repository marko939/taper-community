'use client';

export default function Avatar({ name = 'A', avatarUrl, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-20 w-20 text-2xl',
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

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

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white ${sizes[size]} ${className}`}
      style={{ background: gradients[colorIndex] }}
    >
      {initial}
    </div>
  );
}
