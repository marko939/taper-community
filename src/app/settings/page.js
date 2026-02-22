'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useProfileStore } from '@/stores/profileStore';
import { PageLoading } from '@/components/shared/LoadingSpinner';

export default function SettingsPage() {
  const { user, profile, loading: authLoading } = useRequireAuth();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [displayName, setDisplayName] = useState('');
  const [drugSignature, setDrugSignature] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setDrugSignature(profile.drug_signature || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  if (authLoading) return <PageLoading />;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await updateProfile({
      display_name: displayName,
      drug_signature: drugSignature,
      location: location,
      bio: bio,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
      <p className="mt-2 text-text-muted">
        Update your profile information. Your drug signature appears under every post you make.
      </p>

      <div className="mt-8 space-y-6">
        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-foreground">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder="Your community name"
          />
        </div>

        <div>
          <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-foreground">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input"
            placeholder="e.g. Northeast US, UK, Australia"
          />
          <p className="mt-1 text-xs text-text-subtle">
            General area only — helps others find nearby support.
          </p>
        </div>

        <div>
          <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-foreground">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="textarea"
            rows={3}
            placeholder="Tell the community a bit about yourself..."
          />
        </div>

        <div>
          <label htmlFor="drugSignature" className="mb-1.5 block text-sm font-medium text-foreground">
            Drug History Signature
          </label>
          <textarea
            id="drugSignature"
            value={drugSignature}
            onChange={(e) => setDrugSignature(e.target.value)}
            className="textarea"
            rows={4}
            placeholder="e.g. Lexapro 20mg 2018–2023 → tapered to 5mg (liquid) → 0 Mar 2025 | Klonopin 0.5mg PRN"
          />
          <p className="mt-1 text-xs text-text-subtle">
            This appears under every post you make, like SA.org. Include drug names, doses,
            dates, and taper methods. Use | to separate multiple drugs.
          </p>
        </div>

        {drugSignature && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">Signature Preview</p>
            <div className="rounded-xl border border-border-subtle bg-slate-50 px-3 py-2">
              <p className="text-xs italic text-text-subtle">{drugSignature}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && (
            <span className="text-sm text-accent-emerald">Changes saved!</span>
          )}
        </div>
      </div>
    </div>
  );
}
