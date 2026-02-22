'use client';

export default function Badge({ children, variant = 'blue', className = '' }) {
  const styles = {
    blue: { background: 'var(--purple-pale)', color: 'var(--purple)' },
    purple: { background: 'var(--purple-pale)', color: 'var(--purple)' },
    amber: { background: 'rgba(232, 168, 56, 0.12)', color: '#8B6914' },
    red: { background: 'rgba(214, 69, 69, 0.12)', color: '#D64545' },
    teal: { background: 'var(--accent-teal-light)', color: '#1A8A7E' },
    green: { background: 'rgba(52, 168, 83, 0.12)', color: '#34A853' },
    gray: { background: 'var(--purple-ghost)', color: 'var(--text-muted)' },
  };

  const style = styles[variant] || styles.blue;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

export function PeerAdvisorBadge() {
  return (
    <Badge variant="amber">
      <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      Peer Advisor
    </Badge>
  );
}
