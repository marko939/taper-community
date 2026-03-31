const STYLES = {
  High: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  Medium: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
};

export default function TaperingFitBadge({ level }) {
  const s = STYLES[level] || STYLES.Medium;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      Tapering fit: {level}
    </span>
  );
}
