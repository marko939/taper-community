import { createClient as createAuthClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/blog';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

async function requireAdmin() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !isAdmin(user.id)) return null;
  return user;
}

async function getExistingNames(region) {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('clinician_crm')
    .select('name, state, credentials')
    .limit(1000);
  return data || [];
}

async function discoverWithWebSearch(region, tiers, existingNames) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const tierDescriptions = {
    1: 'Tier 1 (tier1_deprescribing): Explicitly offers deprescribing, tapering, or medication withdrawal support.',
    2: 'Tier 2 (tier2_holistic): Holistic, integrative, or functional psychiatry/medicine practice.',
    3: 'Tier 3 (tier3_conservative): PMHNPs or psychiatrists known for conservative prescribing, informed consent, shared decision-making.',
    4: 'Tier 4 (tier4_general): General psychiatrists, PMHNPs, NPs in private practice in the target region.',
    5: 'Tier 5 (tier5_np_pmhnp): Nurse Practitioners (NP) or Psychiatric Mental Health Nurse Practitioners (PMHNP) in private practice. Must be NP/PMHNP credentials specifically, not MDs or DOs.',
  };

  const requestedTierDescs = tiers.map(t => tierDescriptions[t]).join('\n');

  // Only pass names relevant to the region to reduce token count
  const regionLower = region.toLowerCase();
  const relevantExisting = existingNames.filter(e => {
    const st = (e.state || '').toLowerCase();
    return st === regionLower || st.includes(regionLower) || regionLower.includes(st);
  });
  const existingList = relevantExisting.length > 0
    ? `\n\nALREADY IN OUR CRM for ${region} — skip these:\n${relevantExisting.slice(0, 50).map(e => `- ${e.name}`).join('\n')}`
    : '';

  const systemPrompt = `You are a clinician discovery assistant for TaperCommunity, a peer support platform for people tapering off psychiatric medications.

Your task: Search the web to find REAL private practice clinicians in ${region} who match the requested tiers.

TIER DEFINITIONS:
${requestedTierDescs}

Search for: deprescribing/tapering clinicians, integrative/holistic psychiatry, functional medicine — all in ${region}. Check Psychology Today, BenzoInfo.com, practice websites.

EXCLUDE: hospital employees, NHS/HSE/VA/government clinics, academic medical centers, corporate chains (Talkiatry, Cerebral, etc.), anyone whose only presence is a hospital staff page.
ONLY INCLUDE: solo practitioners or small private clinics (1-10 providers) with their OWN practice website. Must be independent decision-makers, not institutional employees.
${existingList}

After searching, compile your findings into a JSON array. For each clinician include:
- name (string — full name with credentials)
- credentials (string — MD, DO, PMHNP, NP, PhD, MRCPsych, etc.)
- clinic (string — their private practice name. REQUIRED.)
- location (string — city, state/country)
- state (string — US state full name OR country name for international)
- phone (string — if found)
- email_website (string — REQUIRED. Their practice website URL. Must be a real URL you found in search results.)
- description (string — what their practice focuses on and why they match the tier)
- category (string — one of: tier1_deprescribing, tier2_holistic, tier3_conservative, tier4_general, tier5_np_pmhnp)
- source (string — where you found them, e.g. "Practice website", "Psychology Today", "BenzoInfo.com")

Respond with ONLY the JSON array. No markdown fences, no commentary. Return [] if you cannot find any matching clinicians.`;

  const payload = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8192,
    system: systemPrompt,
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 3,
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Search the web and find private practice clinicians in ${region} matching tiers: ${tiers.join(', ')}. Use your searches wisely — combine multiple keywords per search. Return as many verifiable, real clinicians as you can find. Every result must have a real website URL.`,
      },
    ],
  });

  // Retry with backoff on 429
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: payload,
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : (attempt + 1) * 15000;
      console.log(`[clinician-discovery] Rate limited (429), waiting ${waitMs}ms before retry ${attempt + 1}/3`);
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }
    break;
  }

  if (!response.ok) {
    const err = await response.text();
    console.error('[clinician-discovery] Claude API error:', err);
    throw new Error(`Claude API call failed: ${response.status}`);
  }

  const data = await response.json();

  // Extract the final text content (last text block contains the JSON)
  const textBlocks = (data.content || []).filter(b => b.type === 'text');
  const lastText = textBlocks[textBlocks.length - 1]?.text || '[]';

  // Count search requests
  const searchCount = data.usage?.server_tool_use?.web_search_requests || 0;
  console.log(`[clinician-discovery] ${searchCount} web searches performed`);

  try {
    const cleaned = lastText.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
    // Find the JSON array in the response (Claude might add text before/after)
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      console.error('[clinician-discovery] No JSON array found in response:', cleaned.slice(0, 500));
      return [];
    }
    return JSON.parse(arrayMatch[0]);
  } catch (e) {
    console.error('[clinician-discovery] Failed to parse Claude response:', lastText.slice(0, 500));
    return [];
  }
}

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const JUNK_EMAILS = new Set(['example@example.com', 'email@example.com', 'your@email.com', 'name@domain.com']);

function extractEmails(html) {
  // Strip scripts/styles to avoid picking up emails from JS bundles
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const matches = cleaned.match(EMAIL_RE) || [];
  return [...new Set(matches)]
    .filter(e => !JUNK_EMAILS.has(e.toLowerCase()))
    .filter(e => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.gif') && !e.endsWith('.svg'))
    .filter(e => !e.includes('sentry') && !e.includes('webpack') && !e.includes('wixpress'));
}

async function scrapeEmailFromSite(websiteUrl) {
  if (!websiteUrl || !websiteUrl.startsWith('http')) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const base = new URL(websiteUrl);
    const pagesToTry = [
      websiteUrl,
      new URL('/contact', base).href,
      new URL('/contact-us', base).href,
      new URL('/about', base).href,
    ];

    for (const url of pagesToTry) {
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TaperCommunity/1.0)' },
          redirect: 'follow',
        });
        if (!res.ok) continue;
        const html = await res.text();
        const emails = extractEmails(html);
        if (emails.length > 0) return emails[0];
      } catch { /* skip this page */ }
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function enrichWithEmails(results) {
  console.log(`[clinician-discovery] Scraping emails for ${results.length} results...`);
  const enriched = await Promise.all(
    results.map(async (r) => {
      const url = r.email_website?.startsWith('http') ? r.email_website : r.email_website ? `https://${r.email_website}` : null;
      const email = await scrapeEmailFromSite(url);
      if (email) console.log(`[clinician-discovery]   ${r.name}: ${email}`);
      return { ...r, contact_email: email };
    })
  );
  const found = enriched.filter(r => r.contact_email).length;
  console.log(`[clinician-discovery] Found emails for ${found}/${results.length} clinicians`);
  return enriched;
}

function normalizeForMatch(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\b(dr|mr|ms|mrs)\.?\s*/gi, '')
    .replace(/,?\s*(md|do|phd|pmhnp|np|lcsw|psyd|rn|aprn|fnp|dnp|ma|ms|lmft|lpc|mrcpsych|mbbs)\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function deduplicateAgainstCRM(results) {
  const supabase = getServiceClient();
  const { data: existing } = await supabase
    .from('clinician_crm')
    .select('name, state');

  if (!existing?.length) return { unique: results, duplicatesSkipped: 0 };

  const existingNormalized = existing.map(e => normalizeForMatch(e.name));

  let duplicatesSkipped = 0;
  const unique = results.filter(r => {
    const normalized = normalizeForMatch(r.name);
    for (const ex of existingNormalized) {
      if (ex === normalized || ex.includes(normalized) || normalized.includes(ex)) {
        duplicatesSkipped++;
        return false;
      }
    }
    return true;
  });

  return { unique, duplicatesSkipped };
}

export async function POST(req) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { region, tiers } = await req.json();
  if (!region) return NextResponse.json({ error: 'Region is required' }, { status: 400 });

  const requestedTiers = Array.isArray(tiers) && tiers.length > 0 ? tiers : [1, 2, 3, 4, 5];

  try {
    const existingNames = await getExistingNames(region);
    console.log(`[clinician-discovery] Starting web search discovery for ${region}, ${existingNames.length} existing entries`);

    const classified = await discoverWithWebSearch(region, requestedTiers, existingNames);
    console.log(`[clinician-discovery] Claude returned ${classified.length} results`);

    // Filter to requested tiers
    const tierCategories = requestedTiers.map(t => {
      const map = { 1: 'tier1_deprescribing', 2: 'tier2_holistic', 3: 'tier3_conservative', 4: 'tier4_general', 5: 'tier5_np_pmhnp' };
      return map[t];
    });
    const filtered = classified.filter(c => tierCategories.includes(c.category));

    // Deduplicate against full CRM
    const { unique, duplicatesSkipped } = await deduplicateAgainstCRM(filtered);

    // Scrape websites for contact emails
    const enriched = await enrichWithEmails(unique);

    return NextResponse.json({
      results: enriched,
      duplicatesSkipped,
      message: `Found via live web search. ${unique.length} new clinicians, ${duplicatesSkipped} already in CRM.`,
    });
  } catch (err) {
    console.error('[clinician-discovery] Error:', err);
    return NextResponse.json({ error: err.message || 'Discovery failed' }, { status: 500 });
  }
}

export async function PUT(req) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { entries } = await req.json();
  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: 'entries array is required' }, { status: 400 });
  }

  const supabase = getServiceClient();

  const rows = entries.map(e => ({
    name: (e.name || '').trim(),
    credentials: e.credentials || null,
    clinic: e.clinic || null,
    state: e.state || null,
    address: e.location || e.address || null,
    phone: e.phone || null,
    email_website: [e.email_website, e.contact_email].filter(Boolean).join(' | ') || null,
    description: e.description || null,
    source: e.source || 'AI Discovery',
    category: e.category || null,
    status: 'new',
  })).filter(r => r.name);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid entries to insert' }, { status: 400 });
  }

  const { data, error } = await supabase.from('clinician_crm').insert(rows).select('id');

  if (error) {
    console.error('[clinician-discovery] Insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: data?.length || 0 });
}
