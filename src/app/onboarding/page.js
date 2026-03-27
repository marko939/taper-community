'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { DRUG_LIST } from '@/lib/drugs';
import { TAPER_STAGES } from '@/lib/constants';
import { recordReferral } from '@/lib/invites';
import { fireAndForget } from '@/lib/fireAndForget';
import DrugAutocomplete from '@/components/shared/DrugAutocomplete';

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

const STEPS = ['meds', 'details', 'clinician', 'location', 'introPost'];
const SKIPPABLE_STEPS = new Set([3, 4]); // location and introPost

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [notOnMeds, setNotOnMeds] = useState(false);
  const [medications, setMedications] = useState([{ _key: crypto.randomUUID(), drug: '', dose: '', duration: '', stage: '' }]);
  const [hasClinician, setHasClinician] = useState(null);
  const [wantsClinicianHelp, setWantsClinicianHelp] = useState(false);
  const [drugSignature, setDrugSignature] = useState('');
  const [signatureEdited, setSignatureEdited] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [introPostBody, setIntroPostBody] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const progress = ((step + 1) / STEPS.length) * 100;

  const autoSignature = useMemo(
    () => buildSignature(notOnMeds ? [] : medications, hasClinician),
    [medications, hasClinician, notOnMeds]
  );

  const addMed = () => {
    setMedications([...medications, { _key: crypto.randomUUID(), drug: '', dose: '', duration: '', stage: '' }]);
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

  const [error, setError] = useState('');

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    const primaryDrug = notOnMeds ? null : medications[0]?.drug || null;
    const primaryStage = notOnMeds ? 'supporting' : medications[0]?.stage || null;
    const profileData = {
      drug: primaryDrug,
      taper_stage: primaryStage,
      has_clinician: hasClinician,
      drug_signature: drugSignature || null,
    };
    if (locationInput.trim()) {
      profileData.location = locationInput.trim();
    }

    // Await intro post creation so it's visible immediately on home
    if (introPostBody.trim()) {
      const displayName = useAuthStore.getState().user?.user_metadata?.display_name || 'new member';
      const userId = useAuthStore.getState().user?.id;
      try {
        await fetch('/api/intro-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title: `Hi, I'm ${displayName}`,
            body: introPostBody.trim(),
          }),
        });
      } catch (err) {
        console.error('[onboarding] intro post failed:', err?.message);
      }
    }

    // Navigate home after intro post is saved
    router.push('/');

    // Fire-and-forget: save profile (retries up to 3 times)
    fireAndForget('onboarding-profile-save', async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
          await updateProfile(profileData);
          return; // success
        } catch (err) {
          console.warn(`[onboarding] save attempt ${attempt + 1} failed:`, err?.message);
        }
      }
      console.error('[onboarding] all profile save attempts failed');
    });

    // Fire-and-forget: referral tracking
    fireAndForget('onboarding-referral', async () => {
      const ref = localStorage.getItem('taper_ref');
      if (ref) {
        const userId = useAuthStore.getState().user?.id;
        if (userId) await recordReferral(ref, userId);
        localStorage.removeItem('taper_ref');
      }
    });

    // Fire-and-forget: create match request if user wants clinician help
    if (wantsClinicianHelp) {
      const patientName = useAuthStore.getState().user?.user_metadata?.display_name || useAuthStore.getState().user?.email || 'New user';
      const patientEmail = useAuthStore.getState().user?.email;
      const userId = useAuthStore.getState().user?.id;
      fireAndForget('onboarding-match-request', async () => {
        await fetch('/api/match-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            insert: true,
            userId,
            patientName,
            patientEmail,
            clinicianName: null,
            medications: profileData.drug || null,
            supportTypes: ['general'],
            notes: 'Submitted during onboarding — user requested help finding a clinician.',
          }),
        });
      });
    }
  };

  return (
    <div className="mx-auto max-w-lg py-12">
      <div className="glass-panel p-8">
        <h1 className="mb-2 text-center text-3xl font-semibold text-foreground">
          Tell us about your journey
        </h1>
        <p className="mb-6 text-center text-sm text-text-muted">
          This helps us personalize your experience.
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
                  <div key={med._key} className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
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
                    <DrugAutocomplete
                      value={med.drug}
                      onChange={(val) => updateMed(idx, 'drug', val)}
                    />
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
                <div key={med._key} className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
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
                onClick={() => { setHasClinician(true); setWantsClinicianHelp(false); }}
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

            {/* Sub-question: Would you like help finding one? */}
            {hasClinician === false && (
              <div className="space-y-3">
                <p className="text-xs text-amber-600">
                  We strongly recommend finding a clinician who understands tapering.
                  Check our deprescriber map for informed providers.
                </p>
                <div
                  className="rounded-xl border p-4 transition"
                  style={{
                    borderColor: wantsClinicianHelp ? 'var(--purple)' : 'var(--border-subtle)',
                    background: wantsClinicianHelp ? 'var(--purple-ghost)' : 'transparent',
                  }}
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={wantsClinicianHelp}
                      onChange={(e) => setWantsClinicianHelp(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition"
                      style={{
                        borderColor: wantsClinicianHelp ? 'var(--purple)' : 'var(--border-subtle)',
                        background: wantsClinicianHelp ? 'var(--purple)' : 'transparent',
                      }}
                    >
                      {wantsClinicianHelp && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      Yes, I&apos;d like help finding a clinician
                    </span>
                  </label>
                  <p className="mt-2 ml-8 text-xs text-text-muted">
                    We&apos;ll connect you with someone from our network who can support your taper.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Signature */}
        {/* Step 3: Location (skippable) */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Where are you located?
            </h2>
            <p className="text-sm text-text-muted">
              General area only — helps others find nearby support.
            </p>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="input"
              placeholder="e.g. Northeast US, UK, Australia"
            />
          </div>
        )}

        {/* Step 4: Intro Post (skippable) */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Introduce yourself to the community
            </h2>
            <p className="text-sm text-text-muted">
              This will be posted to the Introductions forum as &ldquo;Hi, I&apos;m {useAuthStore.getState().user?.user_metadata?.display_name || 'you'}&rdquo;
            </p>
            <textarea
              value={introPostBody}
              onChange={(e) => setIntroPostBody(e.target.value)}
              className="textarea"
              rows={5}
              placeholder="Tell the community about yourself — your journey, what brought you here, or what you're hoping to find..."
            />
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--purple-pale)', background: 'var(--purple-ghost)' }}>
              <p className="text-sm font-medium text-foreground">Ideas for your intro:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-text-muted">
                <li>What medication(s) you&apos;re tapering from</li>
                <li>How long you&apos;ve been on them</li>
                <li>What brought you to TaperCommunity</li>
                <li>What you&apos;re hoping to get from the community</li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          {SKIPPABLE_STEPS.has(step) ? (
            <button onClick={handleNext} className="text-sm text-text-subtle hover:text-foreground">
              Skip
            </button>
          ) : (
            <div />
          )}
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
