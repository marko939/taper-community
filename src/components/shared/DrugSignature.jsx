'use client';

export default function DrugSignature({ signature }) {
  if (!signature) return null;

  const lines = signature.split('\n');

  return (
    <div className="mt-3 border-t border-border-subtle pt-2">
      <p className="text-xs italic text-text-subtle">
        {lines.map((line, i) => (
          <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
        ))}
      </p>
    </div>
  );
}
