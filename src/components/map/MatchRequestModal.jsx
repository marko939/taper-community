'use client';

import { useState } from 'react';
import { useClinicianStore } from '@/stores/clinicianStore';
import { useAuthStore } from '@/stores/authStore';

const SUPPORT_TYPES = [
  'Clinical oversight',
  'Prescription management',
  'Monitoring',
  'Guidance only',
];

export default function MatchRequestModal({ clinician, onClose }) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const submitMatchRequest = useClinicianStore((s) => s.submitMatchRequest);

  const [formData, setFormData] = useState({
    patient_name: profile?.display_name || '',
    patient_email: user?.email || '',
    medications: profile?.drug || '',
    taper_duration: '',
    support_types: [],
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSupportType = (type) => {
    setFormData((prev) => ({
      ...prev,
      support_types: prev.support_types.includes(type)
        ? prev.support_types.filter((t) => t !== type)
        : [...prev.support_types, type],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data, error: err } = await submitMatchRequest({
      clinician_id: clinician.id,
      patient_name: formData.patient_name,
      patient_email: formData.patient_email,
      medications: formData.medications,
      taper_duration: formData.taper_duration,
      support_types: formData.support_types,
      notes: formData.notes,
      _clinician_name: clinician.name, // for email only
    });

    if (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    } else {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4" style={{ zIndex: 10000 }} onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 sm:p-6"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 text-text-subtle hover:text-foreground">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          /* Success state */
          <div className="py-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--purple-pale)' }}>
              <svg className="h-6 w-6" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Request sent</h3>
            <p className="mt-2 text-sm text-text-muted">
              We&apos;ve received your request to connect with {clinician.name}.
              We&apos;ll be in touch within 2 business days.
            </p>
            <button onClick={onClose} className="btn btn-primary mt-5 text-sm">
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Contact {clinician.name}</h3>
              <p className="mt-1 text-sm text-text-muted">{clinician.role}{clinician.clinic ? ` — ${clinician.clinic}` : ''}</p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Name *</label>
              <input
                type="text"
                required
                value={formData.patient_name}
                onChange={(e) => handleChange('patient_name', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Email *</label>
              <input
                type="email"
                required
                value={formData.patient_email}
                onChange={(e) => handleChange('patient_email', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">What medications are you tapering? *</label>
              <textarea
                required
                value={formData.medications}
                onChange={(e) => handleChange('medications', e.target.value)}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">How long have you been tapering?</label>
              <input
                type="text"
                value={formData.taper_duration}
                onChange={(e) => handleChange('taper_duration', e.target.value)}
                placeholder="e.g. 3 months"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">What kind of support are you looking for?</label>
              <div className="flex flex-wrap gap-2">
                {SUPPORT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleSupportType(type)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
                    style={{
                      borderColor: formData.support_types.includes(type) ? 'var(--purple)' : 'var(--border-subtle)',
                      background: formData.support_types.includes(type) ? 'var(--purple-pale)' : 'transparent',
                      color: formData.support_types.includes(type) ? 'var(--purple)' : 'var(--text-muted)',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Anything else we should know?</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--border-subtle)' }}
                placeholder="Optional"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full text-sm disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
