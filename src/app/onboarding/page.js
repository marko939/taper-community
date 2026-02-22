'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DRUG_LIST } from '@/lib/drugs';
import { TAPER_STAGES } from '@/lib/constants';
import { generateSignature } from '@/lib/signatureGenerator';

const STEPS = ['drug', 'duration', 'stage', 'clinician', 'signature', 'intro'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [drug, setDrug] = useState('');
  const [duration, setDuration] = useState('');
  const [taperStage, setTaperStage] = useState('');
  const [hasClinician, setHasClinician] = useState(null);
  const [drugSignature, setDrugSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      const nextStep = step + 1;
      // Auto-generate signature when entering step 4
      if (nextStep === 4 && !drugSignature) {
        setDrugSignature(generateSignature({ drug, duration, taperStage, hasClinician }));
      }
      setStep(nextStep);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Profile row is auto-created by database trigger on auth.users INSERT.
      // RLS allows UPDATE on own row but blocks INSERT/UPSERT, so we must use .update().
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          drug: drug || null,
          duration: duration || null,
          taper_stage: taperStage || null,
          has_clinician: hasClinician,
          drug_signature: drugSignature || null,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('[onboarding] Profile update failed:', updateError.message);
      } else {
        console.log('[onboarding] Profile updated successfully');
      }
    }

    router.push('/forums');
  };

  const handleSkip = () => router.push('/forums');

  return (
    <div className="mx-auto max-w-lg py-12">
      <div className="glass-panel p-8">
        <h1 className="mb-2 text-center text-3xl font-semibold text-foreground">
          Tell us about your journey
        </h1>
        <p className="mb-6 text-center text-sm text-text-muted">
          This helps us personalize your experience. You can skip any step.
        </p>

        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-accent-blue transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Which medication are you tapering?
            </h2>
            <select value={drug} onChange={(e) => setDrug(e.target.value)} className="input">
              <option value="">Select a medication...</option>
              {DRUG_LIST.map((d) => (
                <option key={d.slug} value={d.name}>
                  {d.name} ({d.generic})
                </option>
              ))}
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              How long have you been on this medication?
            </h2>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 3 years, 6 months"
              className="input"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              What stage are you at?
            </h2>
            <div className="space-y-2">
              {TAPER_STAGES.map((stage) => (
                <label
                  key={stage.value}
                  className={`block cursor-pointer rounded-xl border p-3 transition ${
                    taperStage === stage.value
                      ? 'border-accent-blue bg-accent-blue/10 text-foreground'
                      : 'border-border-subtle text-text-muted hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="stage"
                    value={stage.value}
                    checked={taperStage === stage.value}
                    onChange={(e) => setTaperStage(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm">{stage.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Do you have clinician support for your taper?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setHasClinician(true)}
                className={`rounded-xl border p-4 text-center transition ${
                  hasClinician === true
                    ? 'border-accent-blue bg-accent-blue/10 text-foreground'
                    : 'border-border-subtle text-text-muted hover:border-slate-300'
                }`}
              >
                <span className="text-2xl">&#10003;</span>
                <p className="mt-1 text-sm">Yes</p>
              </button>
              <button
                onClick={() => setHasClinician(false)}
                className={`rounded-xl border p-4 text-center transition ${
                  hasClinician === false
                    ? 'border-accent-blue bg-accent-blue/10 text-foreground'
                    : 'border-border-subtle text-text-muted hover:border-slate-300'
                }`}
              >
                <span className="text-2xl">&#10007;</span>
                <p className="mt-1 text-sm">Not yet</p>
              </button>
            </div>
            {hasClinician === false && (
              <p className="text-xs text-amber-600">
                We strongly recommend finding a clinician who understands tapering.
                Check our deprescriber map for informed providers.
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Your drug history signature
            </h2>
            <p className="text-sm text-text-muted">
              We&apos;ve pre-filled this from your previous answers. Edit it to add more detail.
              This appears under every post you make.
            </p>
            <textarea
              value={drugSignature}
              onChange={(e) => setDrugSignature(e.target.value)}
              className="textarea"
              rows={3}
              placeholder="e.g. Lexapro 20mg 2018–2023 → tapered to 5mg (liquid) → 0 Mar 2025"
            />
            <div className="rounded-xl border border-border-subtle bg-slate-50 p-3">
              <p className="mb-1 text-xs font-medium text-text-subtle">Format tips:</p>
              <p className="text-xs text-text-subtle">
                Drug Dose Year&ndash;Year &rarr; method &rarr; status | Next drug...
              </p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Start your Taper Journal
            </h2>
            <p className="text-sm text-text-muted">
              Your journal is the best way to track your taper and connect with the community.
              Add notes about your journey &mdash; you can mark entries as public on your profile
              and even post them to community forums.
            </p>
            <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-4">
              <p className="text-sm font-medium text-foreground">What to journal:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-text-muted">
                <li>Your medication history (what, when, why)</li>
                <li>Why you decided to taper</li>
                <li>Current dose, symptoms, and mood</li>
                <li>What has helped or made things worse</li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button onClick={handleSkip} className="text-sm text-text-subtle hover:text-foreground">
            Skip
          </button>
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="btn btn-secondary text-sm">
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="btn btn-primary text-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : step === STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
