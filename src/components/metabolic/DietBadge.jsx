const STYLES = {
  indigo: { bg: 'var(--metabolic-indigo-light)', color: '#4338CA', border: '#C7D2FE' },
  teal: { bg: 'var(--metabolic-green-light)', color: 'var(--metabolic-green-dark)', border: '#99F6E4' },
  amber: { bg: 'var(--metabolic-amber-light)', color: '#B45309', border: '#FDE68A' },
  gray: { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' },
};

export default function DietBadge({ label, color = 'teal' }) {
  const s = STYLES[color] || STYLES.teal;
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {label}
    </span>
  );
}
