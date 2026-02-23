'use client';

import { useState, useEffect, useRef } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useProfileStore } from '@/stores/profileStore';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/shared/Avatar';
import { PageLoading } from '@/components/shared/LoadingSpinner';

export default function SettingsPage() {
  const { user, profile, loading: authLoading } = useRequireAuth();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [displayName, setDisplayName] = useState('');
  const [drugSignature, setDrugSignature] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setDrugSignature(profile.drug_signature || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setEmailNotifications(profile.email_notifications !== false);
    }
  }, [profile]);

  if (authLoading) return <PageLoading />;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.error('[settings] upload error:', uploadError.message);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      // Append cache-buster so the browser shows the new image
      const url = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);

      // Save to profile immediately
      await updateProfile({ avatar_url: url });
    } catch (err) {
      console.error('[settings] photo upload error:', err);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await updateProfile({
      display_name: displayName,
      drug_signature: drugSignature,
      location: location,
      bio: bio,
      email_notifications: emailNotifications,
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
        {/* Profile Photo */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Profile Photo</label>
          <div className="flex items-center gap-4">
            <Avatar name={displayName || 'U'} avatarUrl={avatarUrl} size="xl" />
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-purple-ghost disabled:opacity-50"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
              >
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
              <p className="mt-1 text-xs text-text-subtle">JPG, PNG, or WebP. Max 2MB.</p>
            </div>
          </div>
        </div>

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

        {/* Email Notifications */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Email Notifications
          </label>
          <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                Email notifications
              </p>
              <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                Get notified when someone replies to your threads or discussions
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={emailNotifications}
              onClick={() => setEmailNotifications(!emailNotifications)}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
              style={{ background: emailNotifications ? 'var(--purple)' : 'var(--border-subtle)' }}
            >
              <span
                className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
                style={{ transform: emailNotifications ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>
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
