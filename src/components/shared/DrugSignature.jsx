'use client';

export default function DrugSignature({ signature }) {
  if (!signature) return null;

  return (
    <div className="mt-3 border-t border-border-subtle pt-2">
      <p className="text-xs italic text-text-subtle">{signature}</p>
    </div>
  );
}
