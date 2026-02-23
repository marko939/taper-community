'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { DRUG_LIST } from '@/lib/drugs';
import { SYMPTOMS, MOOD_LABELS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { GENERAL_FORUMS } from '@/lib/forumCategories';

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function JournalEntryForm({ onSubmit, entryCount = 0 }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [drug, setDrug] = useState('');
  const [currentDose, setCurrentDose] = useState('');
  const [doseUnit, setDoseUnit] = useState('mg');
  const [symptoms, setSymptoms] = useState([]);
  const [moodScore, setMoodScore] = useState(5);
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [crossPostForums, setCrossPostForums] = useState([]);
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drugEntryCount, setDrugEntryCount] = useState(0);

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
          if (last.current_dose) {
            const unitMatch = last.current_dose.match(/^([\d.]+)\s*(mg|mcg|mL|drops|beads)$/i);
            if (unitMatch) {
              setCurrentDose(unitMatch[1]);
              setDoseUnit(unitMatch[2].toLowerCase());
            } else {
              setCurrentDose(last.current_dose);
            }
          }
        }
      }
    };
    init();
  }, []);

  // Fetch count of existing entries for the selected drug (for title placeholder)
  useEffect(() => {
    if (!drug) { setDrugEntryCount(0); return; }
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { count } = await supabase
        .from('journal_entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('drug', drug);
      if (!cancelled) setDrugEntryCount(count || 0);
    })();
    return () => { cancelled = true; };
  }, [drug]);

  const titlePlaceholder = useMemo(() => {
    const dateFmt = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const moodTag = moodScore === 1 ? 'In a Crisis' : `Feeling ${MOOD_LABELS[moodScore]}`;
    if (drug) {
      return `${ordinal(drugEntryCount + 1)} ${drug} Update - ${moodTag} - ${dateFmt}`;
    }
    return `Check-in - ${moodTag} - ${dateFmt}`;
  }, [drug, date, drugEntryCount, moodScore]);

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

  // GENERAL_FORUMS is always the source of truth — merge DB data in for IDs
  const dbBySlug = useMemo(() => {
    const map = {};
    for (const f of forums) { if (f.slug) map[f.slug] = f; }
    return map;
  }, [forums]);

  const generalForums = useMemo(() =>
    GENERAL_FORUMS.map((gf) => {
      const db = dbBySlug[gf.slug];
      return {
        id: db?.id || gf.slug,        // fallback to slug if DB row missing
        slug: gf.slug,
        name: gf.name,
        displayName: gf.name,
        category: gf.category,
        _hasDb: !!db,                  // track whether DB row exists
      };
    }),
  [dbBySlug]);

  // Auto-selected forums based on mood and first post
  const introForum = generalForums.find((f) => f.slug === 'introductions');
  const successForum = generalForums.find((f) => f.slug === 'success-stories');
  const supportForum = generalForums.find((f) => f.slug === 'support');

  const autoForums = useMemo(() => {
    const auto = [];
    if (entryCount === 0 && introForum) auto.push(introForum);
    if (moodScore >= 7 && successForum) auto.push(successForum);
    if (moodScore <= 3 && supportForum) auto.push(supportForum);
    return auto;
  }, [moodScore, entryCount, introForum, successForum, supportForum]);

  const autoForumIds = autoForums.map((f) => f.id);

  // All forums that will be posted to (look up from both DB forums and generalForums)
  const allPostingForums = useMemo(() => {
    const ids = new Set([...crossPostForums, ...autoForumIds]);
    if (drugForum) ids.add(drugForum.id);
    return [...ids].map((id) => {
      return forums.find((f) => f.id === id) || generalForums.find((f) => f.id === id);
    }).filter(Boolean);
  }, [crossPostForums, autoForumIds, drugForum, forums, generalForums]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    // Only post to forums that have a real DB row (skip slug-only fallbacks)
    const allForumIds = allPostingForums.filter((f) => f._hasDb !== false).map((f) => f.id);

    await onSubmit({
      title: title || titlePlaceholder,
      date,
      drug: drug || null,
      current_dose: currentDose ? `${currentDose}${doseUnit}` : null,
      dose_numeric: currentDose ? parseFloat(currentDose) || null : null,
      symptoms,
      mood_score: moodScore,
      notes: notes || null,
      is_public: isPublic || allForumIds.length > 0,
      published_forums: allForumIds,
    });

    setTitle('');
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
      {/* ── 1. Date / Drug / Dose ── */}
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
          <div className="flex gap-0">
            <input
              type="number"
              step="any"
              min="0"
              value={currentDose}
              onChange={(e) => setCurrentDose(e.target.value)}
              placeholder="10"
              className="input rounded-r-none border-r-0"
              style={{ flex: 1 }}
            />
            <select
              value={doseUnit}
              onChange={(e) => setDoseUnit(e.target.value)}
              className="input rounded-l-none"
              style={{ width: 'auto', minWidth: '5rem' }}
            >
              <option value="mg">mg</option>
              <option value="mcg">mcg</option>
              <option value="mL">mL</option>
              <option value="drops">drops</option>
              <option value="beads">beads</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 2. Mood Slider (bordered lavender card) ── */}
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: 'var(--purple-pale)', background: 'var(--purple-ghost)' }}
      >
        <label className="mb-2 block text-sm font-medium text-foreground">
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

      {/* ── 3. Symptoms ── */}
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

      {/* ── 4. Title ── */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={titlePlaceholder}
          className="input"
        />
      </div>

      {/* ── 5. Notes ── */}
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

      {/* ── 6. Share with Community ── */}
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
                {forum.displayName || forum.name}
                {isAuto && <span className="ml-1 text-[10px] font-normal opacity-70">auto</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 7. Profile visibility toggle ── */}
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

      {/* ── 8. Submit ── */}
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
