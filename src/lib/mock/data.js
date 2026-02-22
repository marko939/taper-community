// ─── Seed Data for Mock Supabase Layer ───
// Provides forums, users, threads, and replies for local development

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Pre-generate stable IDs so threads can reference forums and users
const USER_IDS = Array.from({ length: 8 }, () => uuid());
const FORUM_IDS = {};

function fid(slug) {
  if (!FORUM_IDS[slug]) FORUM_IDS[slug] = uuid();
  return FORUM_IDS[slug];
}

// ─── Helper: past date ───
function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

// ─── Users ───
export const SEED_PROFILES = [
  {
    id: USER_IDS[0],
    display_name: 'TaperWarrior',
    location: 'Northeast US',
    bio: 'Tapered off Lexapro over 18 months using liquid. Now helping others through the process.',
    drug: 'Lexapro',
    duration: '6 years',
    taper_stage: 'completed',
    has_clinician: true,
    drug_signature: 'Lexapro 20mg 2017–2023 → liquid taper → 0 Sept 2024 | Klonopin 0.5mg PRN (still tapering)',
    is_peer_advisor: true,
    post_count: 142,
    joined_at: daysAgo(540),
    updated_at: daysAgo(2),
  },
  {
    id: USER_IDS[1],
    display_name: 'SlowAndSteady',
    location: 'UK',
    bio: 'Effexor taper in progress. Bead counting is my life now.',
    drug: 'Effexor',
    duration: '5 years',
    taper_stage: 'active',
    has_clinician: true,
    drug_signature: 'Effexor XR 150mg 2019–present → bead counting → currently at 37.5mg',
    is_peer_advisor: false,
    post_count: 67,
    joined_at: daysAgo(320),
    updated_at: daysAgo(1),
  },
  {
    id: USER_IDS[2],
    display_name: 'HealingJourney',
    location: 'Australia',
    bio: 'Surviving Paxil withdrawal. Taking it one day at a time.',
    drug: 'Paxil',
    duration: '9 years',
    taper_stage: 'active',
    has_clinician: false,
    drug_signature: 'Paxil 40mg 2015–2024 → compounded liquid → currently at 8mg',
    is_peer_advisor: false,
    post_count: 34,
    joined_at: daysAgo(180),
    updated_at: daysAgo(3),
  },
  {
    id: USER_IDS[3],
    display_name: 'BrainZapSurvivor',
    location: 'California',
    bio: 'Made it through Cymbalta withdrawal. Here to pay it forward.',
    drug: 'Cymbalta',
    duration: '6 years',
    taper_stage: 'completed',
    has_clinician: true,
    drug_signature: 'Cymbalta 60mg 2016–2022 → bead counting → 0 Mar 2023 | Seroquel 25mg for sleep (tapered off Aug 2023)',
    is_peer_advisor: true,
    post_count: 203,
    joined_at: daysAgo(800),
    updated_at: daysAgo(5),
  },
  {
    id: USER_IDS[4],
    display_name: 'MindfulTaper',
    location: 'Pacific NW',
    bio: 'Using mindfulness and yoga alongside my Zoloft taper. Integrative approach advocate.',
    drug: 'Zoloft',
    duration: '4 years',
    taper_stage: 'active',
    has_clinician: true,
    drug_signature: 'Zoloft 100mg 2020–present → liquid taper → currently at 25mg',
    is_peer_advisor: false,
    post_count: 45,
    joined_at: daysAgo(210),
    updated_at: daysAgo(1),
  },
  {
    id: USER_IDS[5],
    display_name: 'ResearchNerd',
    location: 'New England',
    bio: 'Pharmacology student. I read the papers so you don\'t have to.',
    drug: 'Mirtazapine',
    duration: '3 years',
    taper_stage: 'researching',
    has_clinician: true,
    drug_signature: 'Mirtazapine 30mg 2021–present → planning taper with psychiatrist',
    is_peer_advisor: false,
    post_count: 28,
    joined_at: daysAgo(90),
    updated_at: daysAgo(7),
  },
  {
    id: USER_IDS[6],
    display_name: 'GentleSteps',
    location: 'Midwest US',
    bio: 'Benzo taper is a marathon, not a sprint. Ashton Manual saved my life.',
    drug: 'Klonopin',
    duration: '10 years',
    taper_stage: 'active',
    has_clinician: true,
    drug_signature: 'Klonopin 2mg 2014–present → Ashton crossover to Valium → currently at 8mg Valium (equiv ~0.4mg K)',
    is_peer_advisor: true,
    post_count: 156,
    joined_at: daysAgo(600),
    updated_at: daysAgo(1),
  },
  {
    id: USER_IDS[7],
    display_name: 'NewBeginnings',
    location: 'Canada',
    bio: 'Just starting my research into tapering Pristiq. Nervous but hopeful.',
    drug: 'Pristiq',
    duration: '3 years',
    taper_stage: 'researching',
    has_clinician: false,
    drug_signature: 'Pristiq 50mg 2022–present → researching taper options',
    is_peer_advisor: false,
    post_count: 5,
    joined_at: daysAgo(14),
    updated_at: daysAgo(1),
  },
];

// ─── Forums ───
// Drug forums — one per drug in drugs.js
import { DRUG_LIST } from '@/lib/drugs';

const drugForums = DRUG_LIST.map((d) => ({
  id: fid(d.slug),
  name: d.name,
  slug: d.slug,
  drug_slug: d.slug,
  description: `Community discussion for ${d.name} (${d.generic}) tapering — ${d.class}.`,
  category: 'drug',
  post_count: Math.floor(Math.random() * 40) + 5,
  created_at: daysAgo(365),
}));

// General / community forums (consolidated)
const generalForums = [
  { slug: 'introductions', name: 'Introductions', description: 'Welcome! Share your first post here — tell us about yourself and your tapering journey.', category: 'community' },
  { slug: 'support', name: 'Support', description: 'Emotional support, difficult moments, identity, and finding meaning during tapering and withdrawal.', category: 'community' },
  { slug: 'success-stories', name: 'Success Stories', description: 'Recovery stories and taper milestones worth celebrating.', category: 'community' },
  { slug: 'tapering', name: 'Tapering', description: 'Dose reduction strategies, schedules, methods, withdrawal symptoms, supplements, and self-care.', category: 'tapering' },
  { slug: 'research-and-news', name: 'Research & News', description: 'Scientific papers, clinical studies, news articles, books, advocacy, and media about psychiatric drug withdrawal.', category: 'research' },
  { slug: 'lifestyle', name: 'Relationships & Lifestyle', description: 'Diet, exercise, sleep, mindfulness, relationships, and other lifestyle factors during tapering.', category: 'lifestyle' },
].map((f) => ({
  ...f,
  id: fid(f.slug),
  drug_slug: null,
  post_count: Math.floor(Math.random() * 30) + 3,
  created_at: daysAgo(365),
}));

// Legacy slug aliases so existing threads map to consolidated forums
function forumId(slug) {
  const aliases = {
    'introductions': 'support',
    'finding-meaning': 'support',
    'symptoms-and-self-care': 'tapering',
    'journals-and-science': 'research-and-news',
    'in-the-media': 'research-and-news',
    'events-controversies': 'research-and-news',
    'diet-nutrition': 'lifestyle',
    'exercise-movement': 'lifestyle',
    'sleep': 'lifestyle',
    'mindfulness': 'lifestyle',
    'relationships': 'lifestyle',
  };
  return fid(aliases[slug] || slug);
}

export const SEED_FORUMS = [...generalForums, ...drugForums];

// ─── Threads ───
let threadCounter = 0;
function makeThread(forumSlug, userId, title, body, opts = {}) {
  threadCounter++;
  return {
    id: uuid(),
    forum_id: forumId(forumSlug),
    user_id: userId,
    title,
    body,
    tags: opts.tags || [],
    pinned: opts.pinned || false,
    reply_count: opts.reply_count || 0,
    view_count: opts.view_count || Math.floor(Math.random() * 200) + 10,
    vote_score: opts.vote_score || Math.floor(Math.random() * 20),
    created_at: daysAgo(opts.daysAgo || Math.floor(Math.random() * 60) + 1),
    updated_at: daysAgo(opts.daysAgo ? opts.daysAgo - 1 : Math.floor(Math.random() * 30)),
  };
}

const threads = [
  // ─── Getting Started ───
  makeThread('introductions', USER_IDS[3], 'Welcome to TaperCommunity — Read Before Posting',
    'Welcome! This is a peer support community for people tapering psychiatric medications. Please read our guidelines:\n\n1. We are not doctors. Nothing here is medical advice.\n2. Be kind. Everyone here is going through something difficult.\n3. Share your drug signature so others can understand your context.\n4. Use the 10% rule as a starting framework — reduce by no more than 10% of your current dose.\n5. Always consult your prescriber before making changes.\n\nThis community is modeled on SurvivingAntidepressants.org and follows evidence-based tapering principles from the Maudsley Deprescribing Guidelines.',
    { pinned: true, tags: ['resource'], daysAgo: 365, vote_score: 87, view_count: 2340 }),

  // ─── Introductions ───
  makeThread('introductions', USER_IDS[0], 'TaperWarrior — Lexapro to zero, now helping with Klonopin',
    'Hi everyone. I was on Lexapro 20mg for 6 years for generalized anxiety. Started my taper in 2022 using the liquid formulation.\n\nMy schedule:\n20mg → 18mg → 16mg → 14mg → 12mg → 10mg (held 2 months) → 8mg → 6mg → 5mg (held 3 months) → 4mg → 3mg → 2mg → 1.5mg → 1mg → 0.5mg → 0\n\nThe last 5mg to 0 took about 8 months. I\'m now working on my Klonopin taper using the Ashton method.\n\nHappy to answer questions about liquid Lexapro tapering!',
    { tags: ['taper update', 'success story'], daysAgo: 200, vote_score: 34, reply_count: 8 }),

  makeThread('introductions', USER_IDS[1], 'SlowAndSteady — Effexor bead counting journey',
    'Hello everyone. I\'ve been on Effexor XR 150mg since 2019 for depression and anxiety. My doctor originally told me I could just stop taking it — I learned the hard way that\'s not true.\n\nI\'m now doing a very careful bead count taper. Currently at 37.5mg after about 14 months of tapering. The process is tedious but the stability is worth it.\n\nMy bead count method: I open the capsule, count all beads, remove 10% and put the rest back. I do this every 3-4 weeks.',
    { tags: ['taper update'], daysAgo: 120, vote_score: 22, reply_count: 5 }),

  makeThread('introductions', USER_IDS[7], 'NewBeginnings — Just starting to research Pristiq tapering',
    'Hi, I\'m new here. I\'ve been on Pristiq 50mg for about 3 years for depression after a difficult life event. I\'m feeling much better now and want to explore coming off the medication.\n\nMy biggest concern is that Pristiq tablets can\'t be split or crushed. I\'ve read about compounding pharmacies but I\'m not sure where to start.\n\nAny advice for someone just beginning this journey? How did you find a supportive prescriber?',
    { tags: ['question'], daysAgo: 10, vote_score: 15, reply_count: 6 }),

  // ─── Support ───
  makeThread('support', USER_IDS[2], 'Having a terrible wave — need encouragement',
    'I\'m at 8mg Paxil (down from 40mg) and this wave has been going on for two weeks. The dizziness and crying spells are relentless. I know this is withdrawal and not a relapse because it started exactly 10 days after my last cut.\n\nI just need to hear from people who\'ve been through this that it gets better. My family thinks I should just go back up on the dose but I\'ve come so far.',
    { tags: ['vent', 'symptom check'], daysAgo: 5, vote_score: 28, reply_count: 7 }),

  makeThread('support', USER_IDS[4], 'Celebrating 6 months of stability after final Zoloft cut',
    'Six months ago I took my last dose of Zoloft. Today I woke up feeling genuinely good — not medicated good, but real good. The kind where you feel emotions properly, both good and bad.\n\nIt wasn\'t easy. Months 2-3 after stopping were rough. But here I am. If you\'re in the thick of it, please know that your brain DOES heal.',
    { tags: ['success story'], daysAgo: 15, vote_score: 45, reply_count: 12 }),

  // ─── Success Stories ───
  makeThread('success-stories', USER_IDS[3], 'Cymbalta to zero — 2 years later',
    'Two years ago I took my last Cymbalta bead. I want to report that I am doing well.\n\nThe journey: 60mg → 0 over 18 months using bead counting. The last 10mg equivalent was the hardest part. I held for 3 months at several points.\n\nWhat helped: fish oil, magnesium, gentle exercise, and this community. I still have occasional moments of heightened emotion but nothing like the withdrawal waves.\n\nTo anyone still tapering: it IS worth it. Your brain will heal.',
    { tags: ['success story'], daysAgo: 60, vote_score: 67, reply_count: 15 }),

  // ─── Tapering ───
  makeThread('tapering', USER_IDS[0], 'Water titration setup guide — step by step',
    'Several people have asked me about water titration so here\'s my complete guide.\n\n**What you need:**\n- Your medication (non-coated tablets work best)\n- A graduated oral syringe (available at any pharmacy)\n- A clean glass jar with lid\n- Distilled water\n\n**Method:**\n1. Dissolve your tablet in a known volume of water (e.g., 100ml)\n2. To reduce by 10%, draw out 10ml and discard\n3. Drink the remaining 90ml\n4. Stir well before measuring — this is critical for accuracy\n\n**Important notes:**\n- Not all medications dissolve well. SSRIs generally work. Extended-release capsules do NOT.\n- Make fresh daily. Don\'t store the solution.\n- Check with your pharmacist about your specific medication\'s solubility.',
    { tags: ['tips', 'resource'], daysAgo: 45, vote_score: 52, reply_count: 9, pinned: true }),

  makeThread('tapering', USER_IDS[6], '10% vs 5% cuts — when to go slower',
    'I see the 10% rule recommended a lot, and it\'s a great starting point. But I want to share when you might need to go even slower:\n\n**Consider 5% cuts if:**\n- You\'re on a short half-life drug (Effexor, Paxil, Xanax)\n- You\'re in the lower dose range (below 50% of your starting dose)\n- You\'ve had severe withdrawal symptoms at previous cuts\n- You\'ve been on the medication for many years\n\nThe Maudsley Guidelines specifically note that receptor occupancy changes are steeper at lower doses, which is why the "last mile" is hardest.\n\nPersonally, I switched from 10% to 5% cuts once I got below 1mg Klonopin equivalent and the difference in tolerability was enormous.',
    { tags: ['tips', 'taper update'], daysAgo: 30, vote_score: 38, reply_count: 6 }),

  makeThread('tapering', USER_IDS[1], 'Holding at low dose — how long is too long?',
    'I\'ve been holding at 37.5mg Effexor for about 6 weeks now. I had a really bad wave after my last cut and wanted to stabilize before going lower.\n\nMy question: at what point does holding become counterproductive? I\'ve read that some people hold for months, but I\'ve also read that the longer you hold, the harder it can be to start cutting again.\n\nWould love to hear others\' experience with holds, especially on Effexor.',
    { tags: ['question', 'holding'], daysAgo: 8, vote_score: 16, reply_count: 5 }),

  // ─── Symptoms ───
  makeThread('symptoms-and-self-care', USER_IDS[2], 'Brain zaps — what actually helps?',
    'I\'m getting terrible brain zaps. They happen dozens of times a day, worse when I move my eyes. I\'ve tried:\n\n- Fish oil (high EPA) — maybe slightly helping?\n- Magnesium glycinate — helps with sleep but not zaps\n- Staying hydrated\n\nWhat has worked for others? I know they\'ll eventually stop but they\'re making it hard to concentrate at work.',
    { tags: ['symptom check', 'question'], daysAgo: 12, vote_score: 19, reply_count: 8 }),

  makeThread('symptoms-and-self-care', USER_IDS[4], 'Supplements that helped during my taper',
    'Disclaimer: I\'m not a doctor and these are just what helped ME. Always check for interactions with your medication.\n\nWhat I found helpful during Zoloft taper:\n- **Fish oil (high EPA)**: 2g/day. Seemed to reduce brain zaps and mood instability\n- **Magnesium glycinate**: 400mg at bedtime. Better sleep and fewer muscle cramps\n- **Vitamin D**: I was deficient. Getting levels up helped energy\n- **L-theanine**: For acute anxiety moments. Calming without sedation\n- **Probiotics**: Gut-brain axis is real. Helped with GI symptoms\n\nWhat did NOT help me:\n- St. John\'s Wort (dangerous with SSRIs!)\n- Melatonin (made me groggy the next day)\n- 5-HTP (serotonergic — risky while still on an SSRI)',
    { tags: ['tips', 'resource'], daysAgo: 25, vote_score: 41, reply_count: 10 }),

  // ─── Drug-specific threads ───
  makeThread('lexapro', USER_IDS[0], 'Lexapro 10mg to 9mg — day 5 symptoms',
    'Just reporting in on day 5 of my cut from 10mg to 9mg using liquid.\n\nSymptoms so far:\n- Mild dizziness (started day 3)\n- Slightly increased anxiety in the evenings\n- Sleep a bit disrupted but manageable\n\nOverall much milder than my 15mg to 13.5mg cut. I think the liquid titration is really making a difference in the smoothness of each step.\n\nI\'ll update in a week.',
    { tags: ['taper update', 'symptom check'], daysAgo: 3, vote_score: 12, reply_count: 4 }),

  makeThread('effexor', USER_IDS[1], 'Effexor bead counting question — capsule variation',
    'Has anyone else noticed that the number of beads varies between capsules? My 75mg capsules have anywhere from 180 to 220 beads. This makes precise dosing really tricky.\n\nI\'ve started counting all beads in each capsule before calculating my 10% reduction. Is anyone else doing this, or do you just estimate?\n\nAlso — generic vs brand name: my pharmacist said the beads might be different sizes. Anyone compared?',
    { tags: ['question'], daysAgo: 18, vote_score: 14, reply_count: 6 }),

  makeThread('paxil', USER_IDS[2], 'Paxil liquid formulation — compounding pharmacy tips',
    'For those of you tapering Paxil, here\'s what I learned about getting a compounded liquid:\n\n1. Ask your prescriber to write "paroxetine oral suspension" on the prescription\n2. Call compounding pharmacies in advance — not all do psychiatric meds\n3. The standard concentration is 10mg/5mL\n4. It tastes terrible. Mix with juice.\n5. Keep refrigerated and shake before each dose\n\nThe liquid has made my taper SO much smoother compared to trying to split tablets. The cost is higher but worth every penny.',
    { tags: ['tips', 'resource'], daysAgo: 35, vote_score: 27, reply_count: 7 }),

  makeThread('cymbalta', USER_IDS[3], 'Cymbalta bead counting — complete walkthrough',
    'I get a lot of messages asking about Cymbalta bead counting so here\'s my complete method:\n\n**Setup:**\n- Twist open capsule over a plate\n- Count ALL beads (I average ~300 per 60mg capsule)\n- Calculate 10% of total\n- Remove that many beads with tweezers\n- Put remaining beads back in capsule\n\n**Pro tips:**\n- Work on a dark plate — white beads show up better\n- Count in groups of 10\n- If you drop some, just count what\'s left\n- Keep a spreadsheet tracking bead count per capsule\n- Some pharmacies carry 20mg and 30mg capsules too — useful for stepping down\n\nTime investment: about 10 minutes per day. After a few weeks it becomes second nature.',
    { tags: ['tips', 'resource'], daysAgo: 90, vote_score: 55, reply_count: 11, pinned: true }),

  makeThread('klonopin', USER_IDS[6], 'Ashton Manual crossover to Valium — my experience so far',
    'I started my Klonopin-to-Valium crossover 3 months ago following the Ashton Manual schedule. Here\'s how it\'s going:\n\n**Starting point:** Klonopin 2mg daily (taken for 8 years)\n**Equivalent Valium dose:** 40mg (using 1mg K = 20mg V)\n\n**Crossover schedule:**\nWeek 1-2: Replace evening dose → K 1mg AM + V 20mg PM\nWeek 3-4: Replace morning dose → V 20mg AM + V 20mg PM\n\nI\'m now on 40mg Valium and beginning the taper phase. The crossover itself was relatively smooth — some increased anxiety during week 2 but it settled.\n\nThe key advantage: Valium\'s long half-life (20-100 hours!) means much smoother blood levels throughout the day. No more inter-dose withdrawal.',
    { tags: ['taper update', 'resource'], daysAgo: 40, vote_score: 32, reply_count: 8 }),

  makeThread('zoloft', USER_IDS[4], 'Zoloft liquid concentrate — measuring tips',
    'For those using Zoloft liquid (20mg/mL) for tapering, here are some measurement tips:\n\n- Use an oral syringe, not the dropper that comes with it (more accurate)\n- 1mL = 20mg, so 0.5mL = 10mg, 0.25mL = 5mg\n- The liquid is VERY concentrated. A tiny measurement error = big dose change\n- It can be mixed with water, ginger ale, lemonade, or orange juice only (per manufacturer)\n- Do NOT mix with anything else\n\nFor cuts below 5mg, I actually switched to water titration of the tablets because the liquid is too concentrated for micro-doses.',
    { tags: ['tips'], daysAgo: 50, vote_score: 18, reply_count: 5 }),

  makeThread('mirtazapine', USER_IDS[5], 'Mirtazapine paradoxical dose effect — important to understand',
    'Something I wish I\'d known before starting my research: mirtazapine is MORE sedating at LOWER doses.\n\nThe pharmacology: At higher doses (30-45mg), noradrenergic effects dominate, which are activating. At lower doses (7.5-15mg), antihistamine effects dominate, causing sedation.\n\nThis means as you taper DOWN, you may actually feel MORE sedated, not less. And when you finally stop, the rebound insomnia can be severe because you\'re losing that antihistamine effect.\n\nThis is why many people find the final stages of mirtazapine tapering unexpectedly difficult. Plan for significant sleep disruption at the end.',
    { tags: ['research', 'tips'], daysAgo: 20, vote_score: 29, reply_count: 7 }),

  makeThread('gabapentin', USER_IDS[6], 'Gabapentin — non-linear absorption and why it matters for tapering',
    'Important pharmacology note for gabapentin tapers:\n\nGabapentin has SATURABLE absorption. This means:\n- At 300mg, you absorb ~60% of the dose\n- At 600mg, you absorb ~40%\n- At 1200mg, you absorb ~33%\n\nSo if you\'re taking 1200mg and cut to 1080mg (10%), the ACTUAL dose change might be different than expected.\n\nThis is why some people find gabapentin tapering unpredictable. Splitting into more frequent smaller doses can help with more consistent absorption.\n\nThe Maudsley Guidelines recommend reducing by no more than 10% per step, with longer holds at lower doses.',
    { tags: ['research', 'tips'], daysAgo: 55, vote_score: 23, reply_count: 4 }),

  makeThread('seroquel', USER_IDS[3], 'Low-dose Seroquel for sleep — tapering off',
    'My psychiatrist prescribed Seroquel 25mg "just for sleep" 3 years ago. When I tried to stop, I couldn\'t sleep for 5 days straight. Nobody warned me this would happen.\n\nI\'m now doing a very slow taper:\n25mg → 20mg (1/4 tablet cut) → holding\n\nEven this small cut gave me 2 weeks of terrible rebound insomnia. Planning to go to 15mg next, then maybe switch to liquid for the final stages.\n\nAnyone else tapering off low-dose Seroquel for sleep? How slow did you go?',
    { tags: ['question', 'taper update'], daysAgo: 22, vote_score: 20, reply_count: 6 }),

  // ─── Research ───
  makeThread('journals-and-science', USER_IDS[5], 'New Maudsley Deprescribing Guidelines — key takeaways',
    'The Maudsley Deprescribing Guidelines (Horowitz & Taylor, 2024) are now the gold standard. Key points:\n\n1. **Hyperbolic tapering**: Dose reductions should be proportionally smaller at lower doses, following receptor occupancy curves\n2. **No fixed timeline**: Taper duration should be individualized. Some people need 6 months, others need 2+ years\n3. **Withdrawal ≠ relapse**: Withdrawal symptoms that appear within days of a dose reduction are almost certainly withdrawal, not relapse\n4. **Liquid formulations**: Essential for precise dosing in the final stages\n5. **The 10% rule**: Reduce by approximately 10% of CURRENT dose (not original dose) at each step\n\nThis is a landmark publication. I\'d recommend every member read at least the summary chapters for their drug class.',
    { tags: ['research', 'resource'], daysAgo: 70, vote_score: 78, reply_count: 14 }),

  makeThread('journals-and-science', USER_IDS[5], 'Lancet Psychiatry: Hyperbolic tapering produces better outcomes',
    'New systematic review in Lancet Psychiatry confirms what this community has known for years:\n\n"Gradual, hyperbolic dose reduction over months to years was associated with significantly lower rates of withdrawal symptoms compared to linear dose reduction or abrupt discontinuation."\n\nKey finding: Patients who tapered over >2 months had 40% fewer severe withdrawal symptoms than those who tapered over <2 months.\n\nThe authors specifically call out the inadequacy of common practice (halving the dose every 2 weeks) and recommend following Maudsley guidelines.',
    { tags: ['research'], daysAgo: 30, vote_score: 42, reply_count: 8 }),

  makeThread('in-the-media', USER_IDS[3], 'BBC Documentary: "The Withdrawal" — must watch',
    'BBC recently aired a documentary about antidepressant withdrawal that is excellent. It features:\n\n- Patient testimonials that sound exactly like posts here\n- Dr. Mark Horowitz explaining hyperbolic tapering\n- Criticism of pharmaceutical company claims that withdrawal is "mild and self-limiting"\n- The RCPsych\'s updated position on withdrawal severity\n\nThe fact that mainstream media is covering this gives me hope. For years we were told withdrawal wasn\'t real. Now even the BBC is saying "actually, it is."\n\nHas anyone else watched it? What did you think?',
    { tags: ['resource'], daysAgo: 15, vote_score: 35, reply_count: 9 }),

  makeThread('events-controversies', USER_IDS[5], 'FDA acknowledges SSRI withdrawal — new label changes',
    'The FDA has quietly updated labeling for several SSRIs to include stronger warnings about discontinuation syndrome. The new language acknowledges that:\n\n1. Symptoms can be severe and prolonged\n2. Gradual tapering is recommended\n3. Symptoms should not automatically be assumed to be relapse\n\nThis is a significant shift from the previous position. While the labels still use "discontinuation syndrome" rather than "withdrawal," the practical guidance is much better.\n\nLink to the FDA announcement in comments.',
    { tags: ['research'], daysAgo: 45, vote_score: 31, reply_count: 6 }),

  // ─── Finding Meaning ───
  makeThread('finding-meaning', USER_IDS[0], 'Who am I without medication? Rediscovering myself after 6 years',
    'One of the strangest parts of finishing my Lexapro taper was realizing I didn\'t know who I was without it.\n\nI started at 22 and finished at 28. Those are formative years. Was the motivation I felt the real me, or the drug? Were my interests genuine, or SSRI-influenced?\n\nIt took about 6 months after finishing to start feeling like I had a stable sense of self again. My emotions came back — not always comfortably — but they felt MINE.\n\nAnyone else grappling with identity after years on psychiatric medication?',
    { tags: ['vent'], daysAgo: 80, vote_score: 53, reply_count: 18 }),

  // ─── Lifestyle forums ───
  makeThread('diet-nutrition', USER_IDS[4], 'Anti-inflammatory diet helped my brain zaps',
    'About 2 months into my Zoloft taper I started an anti-inflammatory diet based on my naturopath\'s recommendation. Here\'s what I changed:\n\n**Added:**\n- Fatty fish (salmon, sardines) 3x/week\n- Turmeric + black pepper daily\n- Leafy greens with every meal\n- Berries, especially blueberries\n- Bone broth\n\n**Removed:**\n- Refined sugar (this was hard)\n- Processed foods\n- Alcohol (already wasn\'t drinking much)\n- Excess caffeine (went from 3 cups to 1)\n\nWithin 3 weeks my brain zaps reduced significantly. Could be coincidence, could be timing with my taper, but I believe the dietary changes helped. My energy levels definitely improved.\n\nAnyone else notice a connection between diet and withdrawal symptoms?',
    { tags: ['tips'], daysAgo: 28, vote_score: 33, reply_count: 8 }),

  makeThread('diet-nutrition', USER_IDS[2], 'Magnesium — different forms and what they do',
    'There are so many types of magnesium and they\'re NOT all the same. Here\'s what I\'ve learned:\n\n- **Magnesium glycinate**: Best for anxiety and sleep. Well absorbed, gentle on stomach\n- **Magnesium citrate**: Good absorption. Can cause loose stools (actually useful if constipated from meds)\n- **Magnesium oxide**: Cheap but poorly absorbed. Mostly useful as a laxative\n- **Magnesium L-threonate**: Crosses blood-brain barrier. Some evidence for cognitive benefits\n- **Magnesium taurate**: May support heart health\n\nI take 400mg glycinate at bedtime and it has genuinely helped my sleep quality during Paxil taper. My neurologist confirmed this was safe to take alongside my medication.',
    { tags: ['tips', 'resource'], daysAgo: 40, vote_score: 26, reply_count: 5 }),

  makeThread('exercise-movement', USER_IDS[4], 'Yoga for withdrawal anxiety — my daily routine',
    'When my Zoloft withdrawal anxiety was at its worst, yoga was the one thing that reliably calmed my nervous system. Here\'s my 20-minute daily routine:\n\n1. Child\'s pose (2 min)\n2. Cat-cow (10 breaths)\n3. Gentle seated twist (each side, 1 min)\n4. Legs up the wall (5 min) — this is the game changer\n5. Supported fish pose with a pillow (3 min)\n6. Savasana with body scan (5 min)\n\nThe key is GENTLE. No hot yoga, no power flows. Your nervous system is already overwhelmed — gentle restorative yoga tells your body "you\'re safe."\n\nI do this every morning before anything else. On bad days, I do it again before bed.',
    { tags: ['tips'], daysAgo: 20, vote_score: 37, reply_count: 9 }),

  makeThread('exercise-movement', USER_IDS[0], 'Walking as medicine — my data after 6 months',
    'During my Lexapro taper, I started tracking my daily walks vs. my symptom severity. After 6 months of data, the pattern is clear:\n\n- Days with 30+ min walks: Average symptom score 3/10\n- Days with 15-30 min walks: Average symptom score 5/10\n- Days with no walks: Average symptom score 7/10\n\nI know correlation isn\'t causation, but for me, walking has been one of the most consistent tools for managing withdrawal.\n\nKey finding: TIMING matters. Morning walks seem to help more than evening walks, possibly due to circadian rhythm effects and light exposure.\n\nAnyone else tracking exercise vs symptoms?',
    { tags: ['tips', 'resource'], daysAgo: 35, vote_score: 44, reply_count: 11 }),

  makeThread('sleep', USER_IDS[6], 'Sleep hygiene during benzo taper — what actually works',
    'Insomnia is the #1 symptom of benzo withdrawal. Here\'s what I\'ve found helpful after 18 months of terrible sleep:\n\n**Helpful:**\n- Fixed wake time (even if you barely slept)\n- No screens 1 hour before bed\n- Cool bedroom (65-68°F)\n- Magnesium glycinate at bedtime\n- Progressive muscle relaxation\n- Not lying in bed awake for more than 20 min (get up, do something boring, return)\n\n**NOT helpful:**\n- Melatonin (made me groggy, didn\'t help sleep onset)\n- Counting sheep (actually increased my anxiety)\n- "Just relax" (thanks, very helpful)\n\n**Important:** Your sleep WILL normalize, but it takes time. Benzo withdrawal insomnia is neurological, not psychological. CBT-I techniques help but won\'t solve it completely until your GABA receptors heal.',
    { tags: ['tips', 'symptom check'], daysAgo: 14, vote_score: 39, reply_count: 10 }),

  makeThread('sleep', USER_IDS[2], 'Rebound insomnia vs. normal insomnia — how to tell the difference',
    'I\'ve been struggling to figure out if my sleep problems are withdrawal-related or just regular insomnia. Here\'s what I\'ve learned:\n\n**Rebound insomnia (withdrawal-related):**\n- Starts within days of a dose reduction\n- Often more severe than your original sleep problems\n- Usually improves over weeks/months at stable dose\n- May include vivid dreams, night sweats\n\n**Regular insomnia:**\n- Not tied to dose changes\n- Responds to standard sleep hygiene measures\n- Consistent pattern over time\n\nIf your insomnia started right after a cut — it\'s almost certainly withdrawal. Hold your dose and let your body stabilize before cutting again.',
    { tags: ['tips', 'symptom check'], daysAgo: 25, vote_score: 21, reply_count: 6 }),

  makeThread('mindfulness', USER_IDS[4], 'Box breathing for acute withdrawal panic — simple technique',
    'When a panic wave hits during withdrawal, this is the technique that works fastest for me:\n\n**Box Breathing:**\n1. Breathe IN for 4 seconds\n2. HOLD for 4 seconds\n3. Breathe OUT for 4 seconds\n4. HOLD for 4 seconds\n5. Repeat 4-6 cycles\n\nWhy it works: It activates the parasympathetic nervous system (the "rest and digest" system) which directly counteracts the fight-or-flight response.\n\nI do this 3x/day as "maintenance" and whenever I feel a wave coming. After about 2 minutes my heart rate noticeably drops.\n\nAnother tip: Extend the exhale. Breathing in for 4 and out for 6-8 is even more calming.',
    { tags: ['tips'], daysAgo: 18, vote_score: 28, reply_count: 7 }),

  makeThread('mindfulness', USER_IDS[0], 'Grounding techniques that work during depersonalization',
    'Depersonalization/derealization is one of the scariest withdrawal symptoms. When I feel like I\'m not real or the world isn\'t real, these grounding techniques help:\n\n**5-4-3-2-1 Method:**\n- Name 5 things you can SEE\n- Name 4 things you can TOUCH\n- Name 3 things you can HEAR\n- Name 2 things you can SMELL\n- Name 1 thing you can TASTE\n\n**Cold water technique:**\nSplash cold water on your face or hold ice cubes. The physical sensation helps anchor you.\n\n**Bare feet on grass:**\nLiterally ground yourself. Sounds woo-woo but the sensory input is real.\n\nRemember: depersonalization from withdrawal is TEMPORARY. Your brain is adjusting. It feels terrifying but it is not dangerous.',
    { tags: ['tips', 'symptom check'], daysAgo: 42, vote_score: 36, reply_count: 8 }),

  makeThread('relationships', USER_IDS[2], 'How to explain withdrawal to family who doesn\'t understand',
    'My family thinks I should "just go back on the medication if you feel bad." They don\'t understand that what I\'m feeling IS the medication leaving my system, not the original condition returning.\n\nHere\'s the analogy that finally worked with my partner:\n\n"Imagine you\'ve been wearing a cast on your leg for 5 years. When the cast comes off, your leg is weak and it hurts to walk. That doesn\'t mean you need the cast back — it means your leg needs time to strengthen. Going back to the cast would just delay the healing."\n\nAnother one that helps: "Caffeine withdrawal gives you a headache. That doesn\'t mean you need caffeine — it means your brain is adjusting to not having it."\n\nWhat analogies have worked for you?',
    { tags: ['tips'], daysAgo: 32, vote_score: 48, reply_count: 13 }),

  makeThread('relationships', USER_IDS[7], 'Should I tell my employer about my taper?',
    'I\'m about to start tapering Pristiq and I\'m worried about the impact on my work performance. I\'ve heard withdrawal can cause brain fog, fatigue, and difficulty concentrating.\n\nShould I tell my boss what I\'m going through? On one hand, it would explain any dip in performance. On the other hand, there\'s still stigma around psychiatric medication.\n\nHow have others handled this? Did you take time off, work through it, or disclose to your employer?',
    { tags: ['question'], daysAgo: 7, vote_score: 14, reply_count: 8 }),

  // More drug-specific threads
  makeThread('xanax', USER_IDS[6], 'Xanax to Valium crossover — interdose withdrawal was killing me',
    'I was on Xanax 1mg twice daily for 4 years. The interdose withdrawal was making my life miserable — by hour 8 I was in full-blown anxiety and shaking.\n\nMy prescriber agreed to the Ashton crossover. We converted to Valium 20mg (10mg twice daily) and within a week the interdose withdrawal stopped completely.\n\nThe difference is night and day. Valium lasts 20-100 hours vs Xanax\'s 6-12. My blood levels are finally stable.\n\nNow beginning the actual taper: reducing Valium by 1mg every 2 weeks. Much more manageable than anything I tried with Xanax directly.',
    { tags: ['taper update'], daysAgo: 50, vote_score: 25, reply_count: 7 }),

  makeThread('abilify', USER_IDS[3], 'Abilify akathisia during taper — how to cope',
    'I was on Abilify 5mg as an antidepressant adjunct. When I started tapering, I developed severe akathisia (restlessness/inability to sit still). It\'s different from anxiety — it\'s more physical, like your body is screaming at you to move.\n\nWhat helped:\n- Very slow taper (I\'m going 0.5mg at a time using liquid formulation)\n- Propranolol prescribed by my doctor for the akathisia\n- Walking/pacing when the feeling hits (fighting it makes it worse)\n- Time. It does gradually improve at each step.\n\nIf you\'re tapering any antipsychotic and experience restlessness, look up akathisia. It\'s a known withdrawal effect and NOT anxiety.',
    { tags: ['symptom check', 'tips'], daysAgo: 38, vote_score: 19, reply_count: 5 }),

  makeThread('wellbutrin', USER_IDS[4], 'Wellbutrin taper — surprisingly easy compared to Zoloft',
    'Quick update: After my difficult Zoloft taper, I needed to come off Wellbutrin 150mg XL as well.\n\nHonestly? It was much easier. I went:\n150mg → 100mg SR (held 3 weeks) → 75mg SR (held 3 weeks) → 0\n\nSymptoms were mild: some fatigue, slight increase in appetite, mild headache for a few days. Nothing compared to the Zoloft withdrawal.\n\nThis makes pharmacological sense — Wellbutrin works on dopamine/norepinephrine, not serotonin, and serotonergic drugs tend to have worse withdrawal profiles.\n\nNot saying everyone will have an easy time, but if you\'ve survived an SSRI/SNRI taper, Wellbutrin may be less daunting.',
    { tags: ['taper update', 'success story'], daysAgo: 60, vote_score: 17, reply_count: 4 }),

  makeThread('lamictal', USER_IDS[5], 'Lamictal — NEVER stop abruptly (SJS risk)',
    'PSA for anyone on Lamictal (lamotrigine):\n\nIf you stop Lamictal for MORE THAN 5 DAYS, you MUST re-titrate from scratch (usually 25mg). You cannot just resume your previous dose.\n\nThe reason: Lamictal carries a risk of Stevens-Johnson Syndrome (SJS), a serious and potentially fatal skin reaction. The slow titration up is specifically designed to minimize this risk. If you lose tolerance by stopping and then resume a full dose, you dramatically increase SJS risk.\n\nThis is different from other psych meds. Missing a few days of an SSRI is uncomfortable but not dangerous. Missing Lamictal for a week and jumping back to full dose could be life-threatening.\n\nTalk to your prescriber before making ANY changes.',
    { tags: ['tips', 'resource'], daysAgo: 15, vote_score: 43, reply_count: 6, pinned: true }),
];

// ─── Replies ───
function makeReply(threadIdx, userId, body, opts = {}) {
  return {
    id: uuid(),
    thread_id: threads[threadIdx].id,
    user_id: userId,
    body,
    helpful_count: opts.helpful_count || 0,
    vote_score: opts.vote_score || Math.floor(Math.random() * 15),
    created_at: daysAgo((opts.daysAgo != null) ? opts.daysAgo : Math.max(1, (threads[threadIdx].created_at ? Math.floor((Date.now() - new Date(threads[threadIdx].created_at)) / 86400000) - 1 : 5))),
    updated_at: daysAgo(opts.daysAgo || 1),
  };
}

const replies = [
  // Thread 0: Welcome post
  makeReply(0, USER_IDS[7], 'Thank you for the clear guidelines! Just joined and already feeling welcomed.', { vote_score: 5, daysAgo: 360 }),
  makeReply(0, USER_IDS[4], 'The 10% rule explanation here was the most helpful thing I read when I first joined. Worth emphasizing even more!', { vote_score: 8, daysAgo: 300 }),

  // Thread 1: TaperWarrior intro
  makeReply(1, USER_IDS[3], 'Beautiful taper schedule. The extended time at 5mg and below is exactly right. Well done on finishing!', { vote_score: 12, daysAgo: 195 }),
  makeReply(1, USER_IDS[1], 'This gives me hope for my own journey. How did you handle the liquid at doses below 1mg? I imagine measuring becomes very tricky.', { vote_score: 6, daysAgo: 190 }),
  makeReply(1, USER_IDS[0], 'Great question! Below 1mg I used a 1mL oral syringe graduated in 0.01mL increments. At that concentration (1mg/mL) I could dose in 0.01mg steps. The key is the syringe quality — get one from a pharmacy, not a craft store.', { vote_score: 9, daysAgo: 188 }),

  // Thread 2: SlowAndSteady intro
  makeReply(2, USER_IDS[0], 'The bead counting method is meticulous but it really does work. Have you considered switching to the compounded liquid for the final stages?', { vote_score: 7, daysAgo: 115 }),
  makeReply(2, USER_IDS[3], 'Effexor is one of the hardest. You\'re doing amazing at 37.5mg. Don\'t rush the final steps — the last capsule is the hardest.', { vote_score: 10, daysAgo: 110 }),

  // Thread 3: NewBeginnings intro
  makeReply(3, USER_IDS[0], 'Welcome! For Pristiq specifically, a compounding pharmacy is essential since the tablets can\'t be split. I\'d recommend calling around to find one before you even start the taper conversation with your prescriber.', { vote_score: 11, daysAgo: 9 }),
  makeReply(3, USER_IDS[3], 'Finding a supportive prescriber was key for me. I actually switched psychiatrists specifically for my taper. Look for someone who knows the Maudsley Guidelines or is willing to learn.', { vote_score: 8, daysAgo: 8 }),
  makeReply(3, USER_IDS[6], 'Don\'t be discouraged if the first prescriber you talk to dismisses your concerns. Unfortunately many doctors still aren\'t up to date on tapering best practices. Keep looking until you find one who listens.', { vote_score: 9, daysAgo: 7 }),
  makeReply(3, USER_IDS[4], 'The Maudsley Deprescribing Guidelines book is a great resource to bring to your appointment. Some doctors are more receptive when you come with published clinical evidence.', { vote_score: 7, daysAgo: 6 }),

  // Thread 4: Support - terrible wave
  makeReply(4, USER_IDS[0], 'Waves are temporary. I had a 3-week wave at a similar point in my Lexapro taper. It did pass. You\'ve come from 40mg to 8mg — that\'s incredible progress. Don\'t let a wave take that away from you.', { vote_score: 15, daysAgo: 4 }),
  makeReply(4, USER_IDS[3], 'Your family means well but they don\'t understand the neurophysiology. This is NOT a relapse — the timing proves it. Hold your dose, ride the wave, and it will pass. We\'re here for you.', { vote_score: 18, daysAgo: 4 }),
  makeReply(4, USER_IDS[6], 'Sending strength. The wave-window pattern is real. After the wave comes a window of feeling better. Each wave tends to be a little less intense than the last. You\'re doing the right thing by holding.', { vote_score: 12, daysAgo: 3 }),
  makeReply(4, USER_IDS[4], 'I went through exactly this at a similar dose. The dizziness cleared after about 3 weeks and the emotional intensity followed a few days later. Hang in there.', { vote_score: 10, daysAgo: 2 }),

  // Thread 5: Celebrating stability
  makeReply(5, USER_IDS[0], 'This is wonderful to read. The "real good" vs "medicated good" distinction is so important. Congratulations!', { vote_score: 8, daysAgo: 14 }),
  makeReply(5, USER_IDS[2], 'Hearing stories like this keeps me going. Thank you for coming back to share after 6 months. It gives the rest of us hope.', { vote_score: 11, daysAgo: 13 }),
  makeReply(5, USER_IDS[7], 'This is exactly what I needed to read today. Feeling nervous about starting my taper but this helps so much.', { vote_score: 6, daysAgo: 12 }),

  // Thread 6: Cymbalta success
  makeReply(6, USER_IDS[1], 'Thank you for sharing this update 2 years later! It\'s rare to hear from people who are well past their taper. So many just leave the community once they\'re better (understandably). This is valuable.', { vote_score: 14, daysAgo: 55 }),
  makeReply(6, USER_IDS[0], 'Fish oil and magnesium were my MVPs too. And yes, this community kept me sane during the worst of it. Congratulations on 2 years!', { vote_score: 9, daysAgo: 53 }),

  // Thread 7: Water titration guide
  makeReply(7, USER_IDS[1], 'This is an excellent guide! One addition: stirring is absolutely critical. I use a magnetic stirrer I bought on Amazon for $15. Makes a huge difference in consistency.', { vote_score: 11, daysAgo: 42 }),
  makeReply(7, USER_IDS[5], 'From a pharmacology perspective — the solubility note is important. Some SSRIs form suspensions rather than solutions, which is fine as long as you stir well. The key is consistent particle distribution.', { vote_score: 8, daysAgo: 40 }),
  makeReply(7, USER_IDS[2], 'I tried this with Paxil tablets and it works! Though I eventually switched to compounded liquid for more precision. Great starting method for anyone without access to liquid formulations.', { vote_score: 6, daysAgo: 38 }),

  // Thread 8: 10% vs 5% cuts
  makeReply(8, USER_IDS[0], 'Completely agree about switching to 5% at lower doses. The receptor occupancy curve is not linear — the same absolute dose change has a much bigger effect at lower doses.', { vote_score: 9, daysAgo: 28 }),
  makeReply(8, USER_IDS[3], 'I wish I\'d known this earlier. My worst withdrawal symptoms were from a 10% cut at a low dose. Switched to 5% and the difference was remarkable.', { vote_score: 7, daysAgo: 26 }),

  // Thread 9: Holding question
  makeReply(9, USER_IDS[0], 'I held for 8 weeks at one point during my Lexapro taper. Once I felt stable for at least 2 consecutive weeks, I resumed cutting. The key is stability, not a specific timeline.', { vote_score: 8, daysAgo: 7 }),
  makeReply(9, USER_IDS[6], 'In my experience with benzo tapering, holds are never counterproductive. Your body needs what it needs. I held for 3 months at one point and it was the right call.', { vote_score: 11, daysAgo: 6 }),
  makeReply(9, USER_IDS[3], 'The "holding makes the next cut harder" thing is a myth in my experience. What matters is that your nervous system has stabilized. Take the time you need.', { vote_score: 9, daysAgo: 5 }),

  // Thread 10: Brain zaps
  makeReply(10, USER_IDS[0], 'High-dose fish oil (EPA specifically, 2000mg+/day) reduced my brain zaps significantly. It took about 2 weeks to notice the effect. Worth trying.', { vote_score: 10, daysAgo: 11 }),
  makeReply(10, USER_IDS[3], 'In my experience the only thing that truly "cures" brain zaps is time. But fish oil and staying very hydrated helped make them more bearable.', { vote_score: 7, daysAgo: 10 }),
  makeReply(10, USER_IDS[1], 'I found that reducing screen time helped with mine. Looking at screens seemed to trigger them. Taking breaks every 20 minutes made a difference.', { vote_score: 5, daysAgo: 9 }),

  // Thread 11: Supplements
  makeReply(11, USER_IDS[6], 'Great list! I\'d add that magnesium L-threonate specifically crosses the blood-brain barrier and may be more effective for neurological symptoms than glycinate. More expensive though.', { vote_score: 8, daysAgo: 23 }),
  makeReply(11, USER_IDS[5], 'Important safety note: L-theanine and 5-HTP can both interact with serotonergic medications. Always check with your pharmacist. 5-HTP in particular can cause serotonin syndrome when combined with SSRIs.', { vote_score: 12, daysAgo: 22 }),

  // Thread 12: Lexapro 10→9
  makeReply(12, USER_IDS[3], 'Sounds like a very manageable cut! The fact that it\'s milder than your previous cuts is a great sign. Liquid is definitely the way to go.', { vote_score: 5, daysAgo: 2 }),
  makeReply(12, USER_IDS[4], 'Day 5 was usually when I felt the peak of my symptoms, and then they started getting better. You\'re probably through the worst of it.', { vote_score: 4, daysAgo: 1 }),

  // Thread 13: Effexor beads
  makeReply(13, USER_IDS[3], 'Yes! The bead count varies a LOT. I always counted every capsule. Some had 180, others 220. You really need to count each time to know your actual dose.', { vote_score: 6, daysAgo: 16 }),
  makeReply(13, USER_IDS[6], 'I switched from generic to brand name Effexor XR for my taper specifically because the bead consistency was better. Yes, it\'s more expensive, but the dosing accuracy was worth it for me.', { vote_score: 5, daysAgo: 15 }),

  // Thread 17: Maudsley Guidelines
  makeReply(17, USER_IDS[0], 'This book changed my life. I brought it to my psychiatrist appointment and she actually read the chapter on escitalopram. Her attitude completely shifted from "just stop taking it" to supporting a proper taper.', { vote_score: 15, daysAgo: 65 }),
  makeReply(17, USER_IDS[6], 'The receptor occupancy graphs are what make the hyperbolic approach so clear. When you see visually how going from 10mg to 5mg is a much bigger drop in receptor occupancy than 20mg to 15mg, it all makes sense.', { vote_score: 11, daysAgo: 62 }),
  makeReply(17, USER_IDS[3], 'Every prescriber should read this book. I\'ve been recommending it to my doctors and they\'re always surprised by the data. Medical education on withdrawal is decades behind.', { vote_score: 13, daysAgo: 60 }),

  // Thread 22: Anti-inflammatory diet
  makeReply(22, USER_IDS[0], 'The sugar reduction alone probably helped significantly. Sugar is inflammatory and inflammation appears to worsen withdrawal symptoms. Great list of changes.', { vote_score: 7, daysAgo: 25 }),
  makeReply(22, USER_IDS[5], 'There\'s actually research supporting the anti-inflammatory approach during withdrawal. Neuroinflammation is a proposed mechanism for some withdrawal symptoms. This isn\'t just anecdotal.', { vote_score: 9, daysAgo: 24 }),
  makeReply(22, USER_IDS[2], 'I cut sugar about 6 weeks ago and noticed a significant improvement in brain fog. Could be coincidence but the timing was pretty clear.', { vote_score: 5, daysAgo: 22 }),

  // Thread 24: Yoga routine
  makeReply(24, USER_IDS[2], 'Legs up the wall is incredible. I do it every night before bed now. My nervous system calms down within minutes. Thank you for sharing this routine.', { vote_score: 8, daysAgo: 18 }),
  makeReply(24, USER_IDS[6], 'I want to emphasize your point about GENTLE. I tried a vigorous yoga class during my benzo taper and it actually triggered a panic attack. Restorative only during withdrawal.', { vote_score: 11, daysAgo: 17 }),
  makeReply(24, USER_IDS[7], 'This is perfect for a beginner. I\'ve never done yoga before but these poses seem very accessible. Going to try tomorrow morning.', { vote_score: 4, daysAgo: 15 }),

  // Thread 25: Walking data
  makeReply(25, USER_IDS[3], 'Love that you tracked this! The morning walk finding aligns with research on light exposure and circadian rhythm regulation. Bright morning light helps reset your body clock.', { vote_score: 9, daysAgo: 32 }),
  makeReply(25, USER_IDS[6], 'Walking saved me during my worst benzo withdrawal. There were days I could barely function but I\'d force myself to walk for 20 minutes and it always helped at least a little.', { vote_score: 12, daysAgo: 30 }),

  // Thread 26: Sleep hygiene
  makeReply(26, USER_IDS[0], 'The "not lying in bed awake" rule was counterintuitive but transformative for me. Once I stopped associating my bed with frustration, my sleep actually improved.', { vote_score: 8, daysAgo: 12 }),
  makeReply(26, USER_IDS[3], 'Fixed wake time is the most underrated piece of advice. Even after a terrible night, getting up at the same time helps reset your circadian rhythm. It\'s hard but it works.', { vote_score: 10, daysAgo: 11 }),

  // Thread 28: Box breathing
  makeReply(28, USER_IDS[6], 'The extended exhale variation is backed by research — it specifically triggers the vagus nerve which activates the parasympathetic response. I do 4-in, 7-hold, 8-out.', { vote_score: 7, daysAgo: 16 }),
  makeReply(28, USER_IDS[2], 'Box breathing has been my #1 tool during panic waves. I even taught it to my partner so they can guide me through it when I\'m too panicked to remember the steps.', { vote_score: 9, daysAgo: 15 }),

  // Thread 30: Explaining to family
  makeReply(30, USER_IDS[0], 'The cast analogy is perfect! I\'m going to use that. My go-to has been the caffeine withdrawal comparison which also works well for skeptics.', { vote_score: 11, daysAgo: 30 }),
  makeReply(30, USER_IDS[3], 'I actually printed out the Maudsley Guidelines chapter on withdrawal and gave it to my parents. Seeing it in a medical textbook made it real for them.', { vote_score: 14, daysAgo: 28 }),
  makeReply(30, USER_IDS[6], 'For benzos, I explain it like this: "My brain has been getting this chemical from a pill for years. Now it needs to relearn how to make it on its own. That takes time."', { vote_score: 10, daysAgo: 26 }),
  makeReply(30, USER_IDS[1], 'The hardest part for me was accepting that some people will never fully understand. At some point I stopped trying to convince my mother and just asked her to trust me. That shift was actually liberating.', { vote_score: 8, daysAgo: 24 }),
];

// Update reply_count on threads
for (const reply of replies) {
  const thread = threads.find((t) => t.id === reply.thread_id);
  if (thread) {
    thread.reply_count = (thread.reply_count || 0);
  }
}
// Recount properly
for (const thread of threads) {
  thread.reply_count = replies.filter((r) => r.thread_id === thread.id).length;
}

export const SEED_THREADS = threads;
export const SEED_REPLIES = replies;

// Empty seed tables for votes and journal
export const SEED_THREAD_VOTES = [];
export const SEED_REPLY_VOTES = [];

export const SEED_JOURNAL_ENTRIES = [
  {
    id: uuid(),
    user_id: USER_IDS[0],
    date: daysAgo(5).split('T')[0],
    drug: 'Klonopin',
    current_dose: '0.4mg equiv',
    dose_numeric: 0.4,
    symptoms: ['Insomnia', 'Anxiety'],
    mood_score: 6,
    notes: 'Holding steady at current Valium equivalent. Sleep still rough but anxiety is manageable during the day. Morning walks helping a lot.',
    is_public: true,
    published_forums: [],
    thread_ids: [],
    created_at: daysAgo(5),
  },
  {
    id: uuid(),
    user_id: USER_IDS[0],
    date: daysAgo(12).split('T')[0],
    drug: 'Klonopin',
    current_dose: '0.5mg equiv',
    dose_numeric: 0.5,
    symptoms: ['Insomnia', 'Dizziness', 'Anxiety'],
    mood_score: 4,
    notes: 'Cut from 0.5mg equivalent to 0.4mg two days ago. Rough wave today — dizziness and heightened anxiety. Reminding myself this is temporary.',
    is_public: true,
    published_forums: [],
    thread_ids: [],
    created_at: daysAgo(12),
  },
  {
    id: uuid(),
    user_id: USER_IDS[2],
    date: daysAgo(3).split('T')[0],
    drug: 'Paxil',
    current_dose: '8mg',
    dose_numeric: 8,
    symptoms: ['Brain zaps', 'Crying spells', 'Dizziness'],
    mood_score: 3,
    notes: 'Terrible wave at 8mg. Brain zaps dozens of times per day. Crying at random. Holding dose and riding it out. The community support is keeping me going.',
    is_public: true,
    published_forums: [],
    thread_ids: [],
    created_at: daysAgo(3),
  },
  {
    id: uuid(),
    user_id: USER_IDS[4],
    date: daysAgo(1).split('T')[0],
    drug: 'Zoloft',
    current_dose: '25mg',
    dose_numeric: 25,
    symptoms: [],
    mood_score: 8,
    notes: 'Great day! Six months post-taper and feeling genuinely good. Emotions are mine again. Yoga and walking continue to be my anchors.',
    is_public: true,
    published_forums: [],
    thread_ids: [],
    created_at: daysAgo(1),
  },
];

export const SEED_JOURNAL_SHARES = [];
