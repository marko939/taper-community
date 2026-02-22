'use client';

import { useState, useEffect, useMemo } from 'react';
import { DRUG_LIST } from '@/lib/drugs';
import { SYMPTOMS, MOOD_LABELS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

export default function JournalEntryForm({ onSubmit, entryCount = 0 }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [drug, setDrug] = useState('');
  const [currentDose, setCurrentDose] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [moodScore, setMoodScore] = useState(5);
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [crossPostForums, setCrossPostForums] = useState([]);
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: forumData } = await supabase
        .from('forums')
        .select('id, name, slug, drug_slug, category')
        .order('category')
        .order('name');
      setForums(forumData || []);

      // Auto-fill drug/dose from most recent entry
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: recent } = await supabase
          .from('journal_entries')
          .select('drug, current_dose, dose_numeric')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1);

        if (recent && recent.length > 0) {
          const last = recent[0];
          if (last.drug) setDrug(last.drug);
          if (last.current_dose) setCurrentDose(last.current_dose);
        }
      }
    };
    init();
  }, []);

  const toggleSymptom = (symptom) => {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const toggleCrossPost = (forumId) => {
    setCrossPostForums((prev) =>
      prev.includes(forumId) ? prev.filter((id) => id !== forumId) : [...prev, forumId]
    );
  };

  // Get the drug-specific forum for auto-inclusion
  const drugSlug = DRUG_LIST.find((d) => d.name === drug)?.slug;
  const drugForum = forums.find((f) => f.drug_slug === drugSlug);

  // General forums only (no drug forums) for the cross-post picker
  const generalForums = forums.filter((f) => !f.drug_slug && f.category !== 'start');

  // Auto-selected forums based on mood and first post
  const introForum = forums.find((f) => f.slug === 'introductions' || f.name === 'Introductions');
  const successForum = forums.find((f) => f.slug === 'success-stories' || f.name === 'Success Stories');
  const supportForum = forums.find((f) => f.slug === 'support' || f.name === 'Support');

  const autoForums = useMemo(() => {
    const auto = [];
    if (entryCount === 0 && introForum) auto.push(introForum);
    if (moodScore > 5 && successForum) auto.push(successForum);
    if (moodScore < 5 && supportForum) auto.push(supportForum);
    return auto;
  }, [moodScore, entryCount, introForum, successForum, supportForum]);

  const autoForumIds = autoForums.map((f) => f.id);

  // All forums that will be posted to
  const allPostingForums = useMemo(() => {
    const ids = new Set([...crossPostForums, ...autoForumIds]);
    if (drugForum) ids.add(drugForum.id);
    return [...ids].map((id) => forums.find((f) => f.id === id)).filter(Boolean);
  }, [crossPostForums, autoForumIds, drugForum, forums]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const allForumIds = allPostingForums.map((f) => f.id);

    await onSubmit({
      date,
      drug: drug || null,
      current_dose: currentDose || null,
      dose_numeric: currentDose ? parseFloat(currentDose) || null : null,
      symptoms,
      mood_score: moodScore,
      notes: notes || null,
      is_public: isPublic || allForumIds.length > 0,
      published_forums: allForumIds,
    });

    setCurrentDose('');
    setSymptoms([]);
    setMoodScore(5);
    setNotes('');
    setIsPublic(true);
    setCrossPostForums([]);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Share with Community ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, var(--purple-ghost) 0%, rgba(46,196,182,0.06) 100%)',
          border: '2px solid var(--purple-pale)',
        }}
      >
        <div className="mb-3 flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'var(--purple-pale)' }}
          >
            <svg className="h-4.5 w-4.5" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold" style={{ color: 'var(--purple)' }}>Share with the Community</span>
            <p className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>Your entry will be posted as a thread so others can read and comment</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {drugForum && (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
              style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {drugForum.name}
              <span className="text-[10px] font-normal opacity-60">auto</span>
            </div>
          )}
          {generalForums.map((forum) => {
            const isAuto = autoForumIds.includes(forum.id);
            const isManual = crossPostForums.includes(forum.id);
            const isSelected = isAuto || isManual;
            return (
              <button
                key={forum.id}
                type="button"
                onClick={() => !isAuto && toggleCrossPost(forum.id)}
                className="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                style={{
                  borderColor: isSelected ? 'var(--purple)' : 'var(--purple-pale)',
                  background: isSelected ? 'var(--purple)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--purple)',
                  cursor: isAuto ? 'default' : 'pointer',
                }}
              >
                {forum.name}
                {isAuto && <span className="ml-1 text-[10px] font-normal opacity-70">auto</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Drug</label>
          <select value={drug} onChange={(e) => setDrug(e.target.value)} className="input">
            <option value="">Select...</option>
            {DRUG_LIST.map((d) => (
              <option key={d.slug} value={d.name}>{d.name} ({d.generic})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Current Dose</label>
          <input
            type="text"
            value={currentDose}
            onChange={(e) => setCurrentDose(e.target.value)}
            placeholder="e.g. 10mg"
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Mood: <span style={{ color: 'var(--purple)' }}>{moodScore}/10 — {MOOD_LABELS[moodScore]}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={moodScore}
          onChange={(e) => setMoodScore(parseInt(e.target.value))}
          className="w-full"
          style={{ accentColor: 'var(--purple)' }}
        />
        <div className="flex justify-between text-xs text-text-subtle">
          <span>Crisis</span>
          <span>Excellent</span>
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">Symptoms</span>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => toggleSymptom(symptom)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                symptoms.includes(symptom)
                  ? 'border-purple bg-purple/10 text-purple'
                  : 'border-border-subtle text-text-subtle hover:border-slate-300'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling? Any observations?"
          rows={3}
          className="textarea"
        />
      </div>

      {/* Profile visibility toggle */}
      <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <span className="text-sm font-medium text-foreground">Visible on your profile</span>
          <p className="text-[11px] text-text-subtle">Others can see this entry when visiting your profile</p>
        </div>
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          className={`relative h-6 w-11 rounded-full transition ${
            isPublic ? 'bg-purple' : 'bg-slate-200'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
              isPublic ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Posting summary */}
      {allPostingForums.length > 0 && (
        <div className="rounded-xl border px-4 py-3" style={{ borderColor: 'var(--purple-pale)', background: 'var(--purple-ghost)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--purple)' }}>Posting to:</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {allPostingForums.map((forum) => (
              <span
                key={forum.id}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
              >
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {forum.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn btn-primary disabled:opacity-50">
          {loading
            ? 'Saving...'
            : allPostingForums.length > 0
              ? 'Save & Post to Community'
              : 'Save Entry'}
        </button>
      </div>
    </form>
  );
}
