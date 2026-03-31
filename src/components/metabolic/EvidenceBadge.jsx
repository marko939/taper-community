const STYLES = {
  Strong: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  Moderate: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  Emerging: { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' },
};

export default function EvidenceBadge({ level }) {
  const s = STYLES[level] || STYLES.Emerging;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      Evidence: {level}
    </span>
  );
}
