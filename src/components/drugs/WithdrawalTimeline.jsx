'use client';

export default function WithdrawalTimeline({ symptoms = [] }) {
  if (symptoms.length === 0) return null;

  return (
    <div className="card">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Withdrawal Symptoms Overview</h2>
      <div className="space-y-2">
        {symptoms.map((symptom, i) => (
          <div key={symptom} className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-text-subtle">
              {i + 1}
            </div>
            <div className="flex-1">
              <div
                className="rounded-full bg-gradient-to-r from-red-100 to-transparent px-4 py-1.5 text-sm text-text-muted"
                style={{ width: `${Math.max(40, 100 - i * 8)}%` }}
              >
                {symptom}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-text-subtle">
        Symptom severity and duration vary by individual. Order shown is by frequency of reporting, not severity.
      </p>
    </div>
  );
}
