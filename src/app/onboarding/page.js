'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { DRUG_LIST } from '@/lib/drugs';
import { TAPER_STAGES } from '@/lib/constants';
import { recordReferral } from '@/lib/invites';

function buildSignature(medications, hasClinician) {
  if (medications.length === 0) return '';

  const stageLabels = {
    researching: 'researching taper',
    planning: 'planning taper',
    active: 'actively tapering',
    holding: 'holding',
    completed: 'completed taper',
    reinstated: 'reinstated',
    supporting: 'supporting others',
  };

  const parts = medications.map((m) => {
    const bits = [];
    if (m.drug) bits.push(m.drug);
    if (m.dose) bits.push(m.dose);
    if (m.duration) bits.push(m.duration);
    if (m.stage && stageLabels[m.stage]) bits.push(stageLabels[m.stage]);
    return bits.join(' — ');
  });

  let sig = parts.join(' | ');
  if (hasClinician === true) sig += ' | with clinician';
  else if (hasClinician === false) sig += ' | without clinician';
  return sig;
}

const STEPS = ['meds', 'details', 'clinician', 'signature', 'intro'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [notOnMeds, setNotOnMeds] = useState(false);
  const [medications, setMedications] = useState([{ drug: '', dose: '', duration: '', stage: '' }]);
  const [hasClinician, setHasClinician] = useState(null);
  const [drugSignature, setDrugSignature] = useState('');
  const [signatureEdited, setSignatureEdited] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const progress = ((step + 1) / STEPS.length) * 100;

  const autoSignature = useMemo(
    () => buildSignature(notOnMeds ? [] : medications, hasClinician),
    [medications, hasClinician, notOnMeds]
  );

  const addMed = () => {
    setMedications([...medications, { drug: '', dose: '', duration: '', stage: '' }]);
  };

  const removeMed = (idx) => {
    if (medications.length <= 1) return;
    setMedications(medications.filter((_, i) => i !== idx));
  };

  const updateMed = (idx, field, value) => {
    setMedications(medications.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      const nextStep = step + 1;
      // Auto-fill signature when reaching that step
      if (nextStep === 3 && !signatureEdited) {
        setDrugSignature(autoSignature);
      }
      setStep(nextStep);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    const primaryDrug = notOnMeds ? null : medications[0]?.drug || null;
    const primaryStage = notOnMeds ? 'supporting' : medications[0]?.stage || null;
    const profileData = {
      drug: primaryDrug,
      taper_stage: primaryStage,
      has_clinician: hasClinician,
      drug_signature: drugSignature || null,
    };
    if (usernameInput && usernameInput.length >= 3) {
      profileData.username = usernameInput;
    }
    await updateProfile(profileData);

    // Record referral if present
    try {
      const ref = localStorage.getItem('taper_ref');
      if (ref) {
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          await recordReferral(ref, userId);
        }
        localStorage.removeItem('taper_ref');
      }
    } catch { /* ignore */ }

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
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: 'var(--purple)' }}
          />
        </div>

        {/* Step 0: Medications */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              What medications are you on?
            </h2>
            <p className="text-sm text-text-muted">
              Select all that apply. You can add multiple medications.
            </p>

            {/* Not on meds toggle */}
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                notOnMeds
                  ? 'border-purple-300 bg-purple-50 text-foreground'
                  : 'border-border-subtle text-text-muted hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={notOnMeds}
                onChange={(e) => setNotOnMeds(e.target.checked)}
                className="sr-only"
              />
              <div
                className="flex h-5 w-5 items-center justify-center rounded-md border-2 transition"
                style={{
                  borderColor: notOnMeds ? 'var(--purple)' : 'var(--border-subtle)',
                  background: notOnMeds ? 'var(--purple)' : 'transparent',
                }}
              >
                {notOnMeds && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">I'm not currently on any psychiatric medication</span>
            </label>

            {!notOnMeds && (
              <>
                {medications.map((med, idx) => (
                  <div key={idx} className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>
                        Medication {medications.length > 1 ? idx + 1 : ''}
                      </span>
                      {medications.length > 1 && (
                        <button
                          onClick={() => removeMed(idx)}
                          className="text-xs text-rose-500 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <select
                      value={med.drug}
                      onChange={(e) => updateMed(idx, 'drug', e.target.value)}
                      className="input"
                    >
                      <option value="">Select a medication...</option>
                      {DRUG_LIST.map((d) => (
                        <option key={d.slug} value={d.name}>
                          {d.name} ({d.generic})
                        </option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                  </div>
                ))}
                <button
                  onClick={addMed}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-sm font-medium transition hover:bg-purple-ghost"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--purple)' }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add another medication
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 1: Details for each med */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              {notOnMeds ? 'Tell us about yourself' : 'More about your medications'}
            </h2>

            {notOnMeds ? (
              <div className="space-y-3">
                <p className="text-sm text-text-muted">
                  What brings you to TaperCommunity?
                </p>
                <div className="space-y-2">
                  {[
                    { value: 'supporting', label: 'Supporting someone else who is tapering' },
                    { value: 'completed', label: 'I completed my taper and want to help others' },
                    { value: 'researching', label: 'Researching — considering starting medication' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`block cursor-pointer rounded-xl border p-3 transition ${
                        medications[0]?.stage === option.value
                          ? 'border-purple-300 bg-purple-50 text-foreground'
                          : 'border-border-subtle text-text-muted hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={option.value}
                        checked={medications[0]?.stage === option.value}
                        onChange={(e) => updateMed(0, 'stage', e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              medications.map((med, idx) => (
                <div key={idx} className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
                  <p className="text-sm font-semibold text-foreground">
                    {med.drug || `Medication ${idx + 1}`}
                  </p>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-subtle">Current dose</label>
                    <input
                      type="text"
                      value={med.dose}
                      onChange={(e) => updateMed(idx, 'dose', e.target.value)}
                      placeholder="e.g. 10mg, 20mg"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-subtle">How long on this medication?</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMed(idx, 'duration', e.target.value)}
                      placeholder="e.g. 3 years, 6 months"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-subtle">Taper stage</label>
                    <select
                      value={med.stage}
                      onChange={(e) => updateMed(idx, 'stage', e.target.value)}
                      className="input"
                    >
                      <option value="">Select stage...</option>
                      {TAPER_STAGES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Step 2: Clinician */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Do you have clinician support?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setHasClinician(true)}
                className={`rounded-xl border p-4 text-center transition ${
                  hasClinician === true
                    ? 'border-purple-300 bg-purple-50 text-foreground'
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
                    ? 'border-purple-300 bg-purple-50 text-foreground'
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

        {/* Step 3: Signature */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Your drug history signature
            </h2>
            <p className="text-sm text-text-muted">
              We&apos;ve auto-generated this from your answers. Feel free to edit it — this appears under every post you make.
            </p>
            <textarea
              value={drugSignature}
              onChange={(e) => {
                setDrugSignature(e.target.value);
                setSignatureEdited(true);
              }}
              className="textarea"
              rows={3}
              placeholder="e.g. Lexapro 20mg 2018–2023 → tapered to 5mg (liquid) → 0 Mar 2025"
            />
            {drugSignature && (
              <div className="rounded-xl border border-border-subtle bg-slate-50 px-3 py-2">
                <p className="mb-1 text-[11px] font-medium text-text-subtle">Preview</p>
                <p className="text-xs italic text-text-muted">{drugSignature}</p>
              </div>
            )}
            <div className="rounded-xl border border-border-subtle bg-slate-50 p-3">
              <p className="mb-1 text-xs font-medium text-text-subtle">Format tips:</p>
              <p className="text-xs text-text-subtle">
                Drug Dose Year&ndash;Year &rarr; method &rarr; status | Next drug...
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Intro + Username */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Start your Taper Journal
            </h2>
            <p className="text-sm text-text-muted">
              Your journal is the best way to track your taper and connect with the community.
              Add notes about your journey &mdash; you can mark entries as public on your profile
              and even post them to community forums.
            </p>
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--purple-pale)', background: 'var(--purple-ghost)' }}>
              <p className="text-sm font-medium text-foreground">What to journal:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-text-muted">
                <li>Your medication history (what, when, why)</li>
                <li>Why you decided to taper</li>
                <li>Current dose, symptoms, and mood</li>
                <li>What has helped or made things worse</li>
              </ul>
            </div>

            {/* Username */}
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Choose a username <span className="font-normal text-text-subtle">(optional)</span>
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="input"
                placeholder="e.g. sarah-taper"
              />
              <p className="mt-1 text-xs text-text-subtle">
                This creates a public journey page others can follow.
              </p>
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
