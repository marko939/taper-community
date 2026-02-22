-- TaperCommunity Seed Data (SA.org-inspired structure)
-- Run after schema.sql

-- ============================================================
-- FORUMS — Getting Started
-- ============================================================
insert into public.forums (id, name, slug, drug_slug, category, description) values
  ('f0000000-0000-0000-0001-000000000001', 'Read This First', 'read-this-first', null, 'start', 'Site rules, community guidelines, and how to get the most out of TaperCommunity.');

-- ============================================================
-- FORUMS — Community
-- ============================================================
insert into public.forums (id, name, slug, drug_slug, category, description) values
  ('f0000000-0000-0000-0002-000000000001', 'Introductions and Updates', 'introductions', null, 'community', 'Create your personal topic and update it as your case history. One thread per member.'),
  ('f0000000-0000-0000-0002-000000000002', 'Support', 'support', null, 'community', 'Emotional support for difficult moments during tapering and withdrawal.'),
  ('f0000000-0000-0000-0002-000000000003', 'Success Stories', 'success-stories', null, 'community', 'Recovery stories and taper milestones worth celebrating.'),
  ('f0000000-0000-0000-0002-000000000004', 'Finding Meaning', 'finding-meaning', null, 'community', 'Life philosophy, identity, and purpose during and after withdrawal.');

-- ============================================================
-- FORUMS — Tapering & Symptoms
-- ============================================================
insert into public.forums (id, name, slug, drug_slug, category, description) values
  ('f0000000-0000-0000-0003-000000000001', 'Tapering', 'tapering', null, 'tapering', 'Gradual dose reduction strategies, schedules, and tapering methods.'),
  ('f0000000-0000-0000-0003-000000000002', 'Symptoms and Self-Care', 'symptoms-and-self-care', null, 'tapering', 'Withdrawal symptoms, supplements, coping strategies, and self-care.');

-- ============================================================
-- FORUMS — Research & News
-- ============================================================
insert into public.forums (id, name, slug, drug_slug, category, description) values
  ('f0000000-0000-0000-0004-000000000001', 'From Journals and Scientific Sources', 'journals-and-science', null, 'research', 'Research papers, clinical studies, and scientific evidence on psychiatric drug withdrawal.'),
  ('f0000000-0000-0000-0004-000000000002', 'In the Media', 'in-the-media', null, 'research', 'News articles, books, podcasts, and documentaries about psychiatric drugs and withdrawal.'),
  ('f0000000-0000-0000-0004-000000000003', 'Events, Actions, Controversies', 'events-controversies', null, 'research', 'Advocacy efforts, industry criticism, and psychiatric drug controversies.');

-- ============================================================
-- FORUMS — Drug-Specific (25 drugs)
-- ============================================================
insert into public.forums (id, name, slug, drug_slug, category, description) values
  -- SSRIs
  ('d1000000-0000-0000-0000-000000000001', 'Lexapro (Escitalopram)', 'lexapro', 'lexapro', 'drug', 'Support for tapering Lexapro/escitalopram. Share your taper schedule, symptoms, and tips.'),
  ('d1000000-0000-0000-0000-000000000002', 'Effexor (Venlafaxine)', 'effexor', 'effexor', 'drug', 'Support for tapering Effexor/venlafaxine. Bead counting, bridging strategies, and symptom management.'),
  ('d1000000-0000-0000-0000-000000000003', 'Mirtazapine', 'mirtazapine', 'mirtazapine', 'drug', 'Support for tapering mirtazapine. Rebound insomnia strategies and dose adjustment tips.'),
  ('d1000000-0000-0000-0000-000000000004', 'Zoloft (Sertraline)', 'zoloft', 'zoloft', 'drug', 'Support for tapering Zoloft/sertraline.'),
  ('d1000000-0000-0000-0000-000000000005', 'Paxil (Paroxetine)', 'paxil', 'paxil', 'drug', 'Support for tapering Paxil/paroxetine.'),
  ('d1000000-0000-0000-0000-000000000006', 'Prozac (Fluoxetine)', 'prozac', 'prozac', 'drug', 'Support for tapering Prozac/fluoxetine.'),
  ('d1000000-0000-0000-0000-000000000007', 'Cymbalta (Duloxetine)', 'cymbalta', 'cymbalta', 'drug', 'Support for tapering Cymbalta/duloxetine.'),
  ('d1000000-0000-0000-0000-000000000008', 'Pristiq (Desvenlafaxine)', 'pristiq', 'pristiq', 'drug', 'Support for tapering Pristiq/desvenlafaxine.'),
  ('d1000000-0000-0000-0000-000000000009', 'Wellbutrin (Bupropion)', 'wellbutrin', 'wellbutrin', 'drug', 'Support for tapering Wellbutrin/bupropion.'),
  ('d1000000-0000-0000-0000-000000000010', 'Celexa (Citalopram)', 'celexa', 'celexa', 'drug', 'Support for tapering Celexa/citalopram.'),
  ('d1000000-0000-0000-0000-000000000011', 'Trintellix (Vortioxetine)', 'trintellix', 'trintellix', 'drug', 'Support for tapering Trintellix/vortioxetine.'),
  ('d1000000-0000-0000-0000-000000000012', 'Luvox (Fluvoxamine)', 'luvox', 'luvox', 'drug', 'Support for tapering Luvox/fluvoxamine.'),
  -- TCAs
  ('d1000000-0000-0000-0000-000000000013', 'Amitriptyline', 'amitriptyline', 'amitriptyline', 'drug', 'Support for tapering amitriptyline.'),
  ('d1000000-0000-0000-0000-000000000014', 'Clomipramine', 'clomipramine', 'clomipramine', 'drug', 'Support for tapering clomipramine.'),
  ('d1000000-0000-0000-0000-000000000015', 'Nortriptyline', 'nortriptyline', 'nortriptyline', 'drug', 'Support for tapering nortriptyline.'),
  -- NaSSA
  -- (mirtazapine already above)
  -- Atypical Antipsychotics
  ('d1000000-0000-0000-0000-000000000016', 'Seroquel (Quetiapine)', 'seroquel', 'seroquel', 'drug', 'Support for tapering Seroquel/quetiapine.'),
  ('d1000000-0000-0000-0000-000000000017', 'Risperdal (Risperidone)', 'risperdal', 'risperdal', 'drug', 'Support for tapering Risperdal/risperidone.'),
  ('d1000000-0000-0000-0000-000000000018', 'Abilify (Aripiprazole)', 'abilify', 'abilify', 'drug', 'Support for tapering Abilify/aripiprazole.'),
  ('d1000000-0000-0000-0000-000000000019', 'Zyprexa (Olanzapine)', 'zyprexa', 'zyprexa', 'drug', 'Support for tapering Zyprexa/olanzapine.'),
  -- Benzodiazepines
  ('d1000000-0000-0000-0000-000000000020', 'Klonopin (Clonazepam)', 'klonopin', 'klonopin', 'drug', 'Support for tapering Klonopin/clonazepam. Ashton Manual protocols and crossover tapers.'),
  ('d1000000-0000-0000-0000-000000000021', 'Ativan (Lorazepam)', 'ativan', 'ativan', 'drug', 'Support for tapering Ativan/lorazepam.'),
  ('d1000000-0000-0000-0000-000000000022', 'Xanax (Alprazolam)', 'xanax', 'xanax', 'drug', 'Support for tapering Xanax/alprazolam.'),
  ('d1000000-0000-0000-0000-000000000023', 'Valium (Diazepam)', 'valium', 'valium', 'drug', 'Support for tapering Valium/diazepam. Commonly used as crossover target for benzo tapers.'),
  -- Gabapentinoids
  ('d1000000-0000-0000-0000-000000000024', 'Gabapentin', 'gabapentin', 'gabapentin', 'drug', 'Support for tapering gabapentin.'),
  ('d1000000-0000-0000-0000-000000000025', 'Lyrica (Pregabalin)', 'lyrica', 'lyrica', 'drug', 'Support for tapering Lyrica/pregabalin.'),
  -- Other
  ('d1000000-0000-0000-0000-000000000026', 'Trazodone', 'trazodone', 'trazodone', 'drug', 'Support for tapering trazodone.'),
  ('d1000000-0000-0000-0000-000000000027', 'Lamictal (Lamotrigine)', 'lamictal', 'lamictal', 'drug', 'Support for tapering Lamictal/lamotrigine.');

-- ============================================================
-- SAMPLE PROFILES
-- ============================================================
insert into public.profiles (id, email, display_name, drug, taper_stage, has_clinician, post_count, is_peer_advisor, drug_signature, location) values
  ('a0000000-0000-0000-0000-000000000001', 'sarah@example.com', 'SarahTapers', 'lexapro', 'active', true, 127, true,
   'Lexapro 20mg 2018–2023 → tapered to 5mg (liquid) → 0 Mar 2025 | Klonopin 0.5mg PRN', 'Northeast US'),
  ('a0000000-0000-0000-0000-000000000002', 'mike@example.com', 'MikeRecovery', 'effexor', 'completed', true, 243, true,
   'Effexor XR 225mg 2016–2024 → bead counting → 0 Dec 2024 | Previously: Lexapro 10mg 2014–2016', 'UK'),
  ('a0000000-0000-0000-0000-000000000003', 'jenny@example.com', 'JennyHopes', 'mirtazapine', 'active', false, 34, false,
   'Mirtazapine 30mg → currently 7.5mg (water titration) | Zoloft 50mg 2019–2021 (CT)', 'Canada'),
  ('a0000000-0000-0000-0000-000000000004', 'alex@example.com', 'AlexG', 'lexapro', 'researching', false, 8, false,
   'Lexapro 20mg since 2022 — researching taper options', 'Western US'),
  ('a0000000-0000-0000-0000-000000000005', 'pat@example.com', 'PatientPat', 'effexor', 'holding', true, 56, false,
   'Effexor XR 75mg (holding after too-fast cut from 150mg) | Seroquel 25mg PRN for sleep', 'Australia');

-- ============================================================
-- THREADS — Read This First (pinned guidelines)
-- ============================================================
insert into public.threads (id, forum_id, user_id, title, body, tags, reply_count, view_count, pinned) values
  ('t0000000-0000-0000-0001-000000000001',
   'f0000000-0000-0000-0001-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   'Welcome to TaperCommunity — Please Read Before Posting',
   'Welcome to TaperCommunity, a peer support forum for people tapering psychiatric medications.

**Our Mission**
We continue the legacy of SurvivingAntidepressants.org (SA.org), which provided 15+ years of peer support before going read-only in January 2026. Like SA.org, we believe in:
- Gradual, individualized tapering (the 10% rule)
- Peer support from people who''ve been through it
- Evidence-based information from published research
- Respecting each person''s autonomy in their medication decisions

**Community Guidelines**
1. We are peers, not doctors. Never give specific dosing advice.
2. Create ONE Introduction topic — update it over time as your case history.
3. Include your drug signature in your profile settings.
4. Be kind. Everyone here is going through something difficult.
5. No promotion of cold turkey (CT) stops — they can be dangerous.
6. Distinguish between your experience and medical advice.
7. Use the 988 Suicide & Crisis Lifeline if you''re in crisis.

**Getting Started**
1. Read the Guidelines page for tapering education
2. Set up your drug history signature in Settings
3. Create your Introduction topic in the Introductions forum
4. Browse drug-specific forums for your medication
5. Use the Journal to track your symptoms and progress',
   '{resource}', 0, 0, true),

  ('t0000000-0000-0000-0001-000000000002',
   'f0000000-0000-0000-0001-000000000001',
   'a0000000-0000-0000-0000-000000000002',
   'How to Write Your Drug History Signature',
   'Your drug signature appears under every post you make. It helps other members understand your history at a glance — just like SA.org.

**Format:**
DrugName Dose StartYear–EndYear → taper details → current status

**Examples:**
- Lexapro 20mg 2018–2023 → tapered to 5mg (liquid) → 0 Mar 2025
- Effexor XR 225mg 2016–2024 → bead counting → 0 Dec 2024
- Zoloft 50mg 2019–2021 (CT) — cold turkey, not recommended
- Klonopin 0.5mg PRN (as needed, not tapering)

**Tips:**
- List drugs chronologically or by importance
- Use | to separate multiple drugs
- Include the method (liquid, bead counting, water titration)
- Note if you cold-turkeyed (CT) and that it''s not recommended
- Update when your status changes

Go to Settings to add your signature.',
   '{resource,tips}', 0, 0, true);

-- ============================================================
-- THREADS — Introductions (sample intro topics)
-- ============================================================
insert into public.threads (id, forum_id, user_id, title, body, tags, reply_count, view_count, pinned) values
  ('t0000000-0000-0000-0002-000000000001',
   'f0000000-0000-0000-0002-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   'SarahTapers — Lexapro taper, Klonopin PRN',
   'Hi everyone, I''m Sarah. I''m a 34-year-old teacher from the Northeast US.

**My history:**
- Started Lexapro 10mg in 2018 for anxiety, increased to 20mg in 2019
- Decided to taper in 2023 after feeling emotionally blunted
- Tapered 20mg → 0 over 18 months using liquid formulation
- Also on Klonopin 0.5mg as needed (not tapering currently)

**Current status:**
3 months off Lexapro. Having windows and waves. Some days feel amazing, others still rough. Brain zaps are mostly gone. Emotional range is coming back — both good and bad emotions, which is actually wonderful.

**What helped me:**
- The 10% rule (smaller cuts at lower doses)
- Liquid escitalopram for precise dosing below 5mg
- This community and journaling
- Gentle exercise and no caffeine

I''ll update this thread as I go. Happy to help anyone tapering Lexapro!',
   '{taper update}', 2, 189, false),

  ('t0000000-0000-0000-0002-000000000002',
   'f0000000-0000-0000-0002-000000000001',
   'a0000000-0000-0000-0000-000000000002',
   'MikeRecovery — Effexor bead counter, 2+ years free',
   'Hey all, I''m Mike from the UK. Former SA.org member.

**My history:**
- Effexor XR 225mg from 2016 for depression/anxiety
- Previously on Lexapro 10mg 2014–2016 (switched due to side effects)
- Started tapering Effexor Jan 2022, reached 0 in Dec 2024
- Used bead counting method exclusively

**Current status:**
Over 1 year free. Life is genuinely better. I can feel things again — sadness, joy, everything. The first 6 months off were rough (waves of dizziness, emotional flooding) but I''m solidly in recovery now.

**My approach:**
- Bead counting with a jewelry scale for accuracy
- 5% reductions every 3–4 weeks at lower doses
- The last 37.5mg → 0 took 8 months
- Kept meticulous records (spreadsheet of daily bead counts)

I''m staying in this community to support others. Effexor tapering is hard but absolutely possible. Ask me anything.',
   '{success story}', 1, 312, false);

-- ============================================================
-- THREADS — Lexapro forum
-- ============================================================
insert into public.threads (id, forum_id, user_id, title, body, tags, reply_count, view_count, pinned) values
  ('t1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   'Tips for Tapering Lexapro (Escitalopram)',
   'This is the community reference thread for tapering Lexapro (escitalopram). Please read before starting your taper.

**Key Facts**
- Half-life: 27–32 hours
- Available forms: tablets (5, 10, 20mg), oral solution (1mg/mL)
- Drug class: SSRI

**Recommended Taper Approach**
Follow the 10% rule: reduce by no more than 10% of your current dose, then hold for 2–4 weeks minimum before the next cut.

Example schedule from 20mg:
- 20 → 18 → 16.2 → 14.6 → 13.1 → 11.8 → 10.6 → 9.5 → 8.6 → 7.7 → 6.9 → 6.2 → 5.6 → 5.0 → 4.5 → 4.1 → 3.7 → 3.3 → 3.0 → 2.7 → 2.4 → 2.2 → 1.9 → 1.7 → 1.6 → 1.4 → 1.3 → 1.1 → 1.0 → 0.9 → ...

**How to Get Precise Doses**
- Above 5mg: tablet splitting with pill cutter
- Below 5mg: liquid formulation (1mg/mL) with oral syringe
- Alternative: water titration (dissolve tablet in measured water)

**Common Withdrawal Symptoms**
Brain zaps, dizziness, insomnia, irritability, nausea, emotional waves, crying spells, depersonalization

**The Final Mile (below 2.5mg)**
The hardest part. Liquid formulation is essential. Many people slow down significantly here — holding 4–6 weeks between cuts. The last 1mg → 0 may take months.

**Maudsley Guidelines Note**
Reduce by proportionally smaller amounts at lower doses. The relationship between dose and receptor occupancy is hyperbolic, not linear.

Please share your Lexapro tapering experiences below. This thread is updated based on community wisdom.',
   '{tips,resource}', 4, 342, true),

  ('t1000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000004',
   'Scared to start — how do I talk to my doctor about tapering?',
   'I''ve been on Lexapro 20mg for 3 years and want to start tapering. My GP doesn''t seem to know much about gradual tapers — she suggested going from 20mg to 10mg to 0 over 6 weeks.

Everything I''ve read says this is way too fast. How do I bring up the Maudsley guidelines? Has anyone had success convincing their doctor to do a slower taper?

I''m also worried about the withdrawal being mistaken for relapse. Any tips for tracking symptoms vs. original condition?',
   '{question,clinician experience}', 3, 156, false);

-- ============================================================
-- THREADS — Effexor forum
-- ============================================================
insert into public.threads (id, forum_id, user_id, title, body, tags, reply_count, view_count, pinned) values
  ('t1000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000002',
   'Tips for Tapering Effexor (Venlafaxine)',
   'This is the community reference thread for tapering Effexor (venlafaxine). Read this before starting your taper.

**Key Facts**
- Half-life: 5 hours (active metabolite 11h) — one of the shortest
- Available forms: XR capsules (37.5, 75, 150mg), IR tablets
- Drug class: SNRI

**Why Effexor Is Notoriously Hard to Taper**
The very short half-life means blood levels drop quickly between doses, making withdrawal symptoms more intense and immediate. Even small dose changes can trigger severe reactions.

**Recommended Taper Approach**
- Bead counting method (see below) for XR capsules
- 5–10% reductions, holding 3–4 weeks minimum
- Take dose at the same time every day — timing matters with short half-life
- The last 37.5mg → 0 is the hardest stretch and may take 6–12 months

**Bead Counting Method**
1. Open XR capsule carefully over clean surface
2. Count total beads (~300 in 150mg capsule, ~150 in 75mg)
3. Remove a small number (10–15 beads = ~5mg for 150mg capsule)
4. Return remaining beads, close capsule
5. Use a jewelry scale for precision
6. Keep a daily bead log

**Fluoxetine Bridge**
Some clinicians use a "Prozac bridge" for the final discontinuation:
- Cross-taper to a small dose of fluoxetine (very long half-life)
- Then taper the fluoxetine, which is much smoother
- Discuss with your prescriber — this is a clinical decision

**Common Withdrawal Symptoms**
Brain zaps (often severe), dizziness, nausea, electric shock sensations, crying spells, rage, depersonalization, GI upset

Share your Effexor tapering experiences below.',
   '{tips,resource}', 5, 891, true),

  ('t1000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000005',
   'Holding at 75mg — brain zaps won''t stop',
   'I dropped from 150mg to 75mg Effexor about 3 weeks ago (yes, I know that''s too fast — my doctor insisted). The brain zaps are constant. They wake me up at night.

Should I reinstate to 112.5mg and go slower? Or hold at 75mg and wait it out? How long do acute withdrawal symptoms usually last?

I feel like my doctor doesn''t understand how bad this is. She keeps saying "it''s just discontinuation syndrome" like it''s nothing.',
   '{symptom check,question}', 2, 203, false);

-- ============================================================
-- THREADS — Mirtazapine forum
-- ============================================================
insert into public.threads (id, forum_id, user_id, title, body, tags, reply_count, view_count, pinned) values
  ('t1000000-0000-0000-0000-000000000005',
   'd1000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000003',
   'Mirtazapine rebound insomnia — when does it end?',
   'I tapered mirtazapine from 30mg to 7.5mg over 6 months and it was fairly smooth. But now trying to go from 7.5mg to 3.75mg and I cannot sleep. Like, at all.

I know mirtazapine is paradoxically MORE sedating at lower doses because of the antihistamine effect. But I didn''t expect the rebound insomnia to be THIS bad when reducing.

I''m on night 4 of maybe 2-3 hours of broken sleep. My anxiety is through the roof but I think it''s from sleep deprivation, not withdrawal per se.

Anyone else dealt with this? Does it stabilize? Should I hold longer at 7.5mg before trying again?',
   '{symptom check,question}', 3, 178, false),

  ('t1000000-0000-0000-0000-000000000006',
   'd1000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000001',
   'Successfully tapered mirtazapine — water titration method',
   'Sharing my mirtazapine success story! Went from 15mg to 0 over 10 months using water titration.

**Water titration method:**
1. Dissolve one 15mg tablet in exactly 150mL of water
2. This gives you 0.1mg/mL concentration
3. Measure out your dose with a syringe, discard the rest
4. Make fresh solution daily (don''t store)

This let me make tiny reductions — like going from 7.5mg to 7.0mg instead of jumping to 3.75mg (half tablet). Made the rebound insomnia much more manageable.

The last 3mg → 0 took 4 months. I used melatonin and magnesium glycinate to help with sleep during the final stretch.

6 months free now and sleeping normally!',
   '{success story,resource}', 2, 245, false);

-- ============================================================
-- THREADS — Tapering forum (pinned tips for additional drugs)
-- ============================================================
insert into public.threads (id, forum_id, user_id, title, body, tags, reply_count, view_count, pinned) values
  ('t2000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000002',
   'Tips for Tapering Zoloft (Sertraline)',
   'Community reference thread for tapering Zoloft (sertraline).

**Key Facts**
- Half-life: 26 hours
- Available forms: tablets (25, 50, 100mg), oral concentrate (20mg/mL)
- Drug class: SSRI

**Recommended Taper Approach**
- 10% reductions using liquid concentrate for precision
- Oral concentrate (20mg/mL) is excellent for fine adjustments
- Hold 2–4 weeks between cuts

**Liquid Dosing**
The oral concentrate can be mixed with water, ginger ale, lemon/lime soda, lemonade, or orange juice. Use an oral syringe for precise measurement.

**Common Withdrawal Symptoms**
Brain zaps, dizziness, irritability, insomnia, GI upset, emotional lability

Share your Zoloft tapering experiences below.',
   '{tips,resource}', 0, 0, true),

  ('t2000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000005',
   'a0000000-0000-0000-0000-000000000002',
   'Tips for Tapering Paxil (Paroxetine)',
   'Community reference thread for tapering Paxil (paroxetine).

**Key Facts**
- Half-life: 21 hours (short for an SSRI)
- Available forms: tablets (10, 20, 30, 40mg), oral suspension (10mg/5mL)
- Drug class: SSRI

**Why Paxil Is Particularly Difficult**
Paxil has the shortest half-life of the SSRIs and significant anticholinergic properties, making its withdrawal syndrome especially challenging. It''s considered one of the hardest SSRIs to discontinue.

**Recommended Taper Approach**
- Very slow 5–10% reductions
- Liquid suspension (10mg/5mL) essential for precision
- Hold 3–4 weeks minimum between cuts
- The final 5mg → 0 may take 6+ months

**Common Withdrawal Symptoms**
Brain zaps (often severe), dizziness, electric shock sensations, crying spells, flu-like symptoms, GI upset, "head in a fishbowl" sensation

Share your Paxil tapering experiences below.',
   '{tips,resource}', 0, 0, true),

  ('t2000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000007',
   'a0000000-0000-0000-0000-000000000001',
   'Tips for Tapering Cymbalta (Duloxetine)',
   'Community reference thread for tapering Cymbalta (duloxetine).

**Key Facts**
- Half-life: 12 hours
- Available forms: delayed-release capsules (20, 30, 60mg)
- Drug class: SNRI

**Bead Counting for Cymbalta**
Cymbalta capsules contain enteric-coated micro-pellets. They can be counted for precise dose reductions:
1. Open capsule carefully
2. Count pellets (varies by dose — a 60mg cap has ~350–400 pellets)
3. Remove a small percentage
4. Return remaining pellets to capsule

**Important Note on Enteric Coating**
The pellets are enteric-coated to survive stomach acid. Do NOT crush them. Some people report GI issues if the coating is damaged. Handle gently.

**Alternative: Compounding Pharmacy**
Some pharmacies can prepare liquid duloxetine for precise dosing. This avoids the hassle of bead counting.

**Common Withdrawal Symptoms**
Brain zaps, nausea, dizziness, headache, irritability, insomnia, "Cymbalta flu"

Share your Cymbalta tapering experiences below.',
   '{tips,resource}', 0, 0, true),

  ('t2000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000020',
   'a0000000-0000-0000-0000-000000000002',
   'Tips for Tapering Klonopin (Clonazepam)',
   'Community reference thread for tapering Klonopin (clonazepam).

**Key Facts**
- Half-life: 18–50 hours
- Available forms: tablets (0.25, 0.5, 1, 2mg), orally disintegrating tablets
- Drug class: Benzodiazepine

**IMPORTANT SAFETY NOTE**
Never stop benzodiazepines abruptly. Sudden discontinuation can cause seizures and is medically dangerous. Always taper under medical supervision.

**The Ashton Manual**
The gold-standard resource for benzodiazepine tapering. Written by Prof. Heather Ashton. Key principles:
- Gradual dose reduction over months to years
- Consider crossover to diazepam (longer half-life, smoother taper)
- Reductions of 5–10% every 1–4 weeks
- Slower pace at lower doses

**Crossover to Diazepam**
Many clinicians recommend switching to an equivalent dose of diazepam (Valium) before tapering because:
- Very long half-life (20–100h) provides smoother blood levels
- Available in small doses (2mg tablets)
- Easier to make small reductions

Approximate equivalence: Klonopin 0.5mg ≈ Diazepam 10mg

**Common Withdrawal Symptoms**
Anxiety (often severe), insomnia, muscle tension, depersonalization, tinnitus, sensory hypersensitivity, seizure risk

**Benzodiazepine tapering is different from antidepressant tapering.** The timeline is often longer and the risks of going too fast are more acute. Please work closely with a knowledgeable prescriber.

Share your Klonopin tapering experiences below.',
   '{tips,resource}', 0, 0, true),

  ('t2000000-0000-0000-0000-000000000005',
   'd1000000-0000-0000-0000-000000000016',
   'a0000000-0000-0000-0000-000000000001',
   'Tips for Tapering Seroquel (Quetiapine)',
   'Community reference thread for tapering Seroquel (quetiapine).

**Key Facts**
- Half-life: 6–7 hours
- Available forms: tablets (25, 50, 100, 200, 300mg), XR tablets
- Drug class: Atypical Antipsychotic

**Two Populations**
Seroquel tapering experiences differ based on dose and indication:
1. **Low-dose for sleep (25–100mg):** Off-label use. Rebound insomnia is the main challenge.
2. **Higher-dose for mood/psychosis (200mg+):** More complex withdrawal, monitor for supersensitivity symptoms.

**Recommended Approach**
- 10% reductions, holding 2–4 weeks
- IR tablets can be split for gradual reductions
- At low doses, consider liquid formulation (compounding pharmacy)
- For sleep: taper very slowly, add sleep hygiene measures

**Common Withdrawal Symptoms**
Rebound insomnia (often severe), nausea, anxiety, irritability, sweating

Share your Seroquel tapering experiences below.',
   '{tips,resource}', 0, 0, true),

  ('t2000000-0000-0000-0000-000000000006',
   'd1000000-0000-0000-0000-000000000024',
   'a0000000-0000-0000-0000-000000000002',
   'Tips for Tapering Gabapentin',
   'Community reference thread for tapering gabapentin.

**Key Facts**
- Half-life: 5–7 hours
- Available forms: capsules (100, 300, 400mg), tablets (600, 800mg), oral solution
- Drug class: Gabapentinoid

**Non-Linear Absorption**
Gabapentin has unusual pharmacokinetics — absorption decreases at higher doses. This means a 300mg reduction from 2400mg is proportionally smaller than the same reduction from 600mg.

**Recommended Approach**
- 10% reductions of current dose
- Capsules can be opened for water titration
- Multiple daily doses (TID or QID) — reduce each dose proportionally
- Hold 2–4 weeks between cuts

**Common Withdrawal Symptoms**
Anxiety, insomnia, nausea, sweating, pain rebound, seizure risk at high doses

Share your gabapentin tapering experiences below.',
   '{tips,resource}', 0, 0, true);

-- ============================================================
-- REPLIES
-- ============================================================

-- Replies to Lexapro tips thread
insert into public.replies (id, thread_id, user_id, body, helpful_count) values
  ('r1000000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002',
   'Excellent reference thread Sarah! I''d add that the liquid formulation tastes fairly neutral and can be mixed with a small amount of juice. My pharmacist had to special-order it but it was covered by insurance.',
   12),
  ('r1000000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003',
   'This is exactly what I needed. I''m at the 5mg → 2.5mg stage right now and was terrified about the lower doses. The hyperbolic schedule makes so much more sense than linear cuts.',
   5),
  ('r1000000-0000-0000-0000-000000000003', 't1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Thanks everyone! Updating to add: if you can''t get liquid formulation, water titration works too. Dissolve a 10mg tablet in 100mL water (0.1mg/mL), measure with oral syringe, discard remainder. Make fresh daily.',
   18),
  ('r1000000-0000-0000-0000-000000000004', 't1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005',
   'Thank you for this detailed guide. My doctor wanted me to taper in 4 weeks too. I showed them the hyperbolic schedule and they agreed to slow down. This community saves lives.',
   8);

-- Replies to Lexapro thread 2
insert into public.replies (id, thread_id, user_id, body, helpful_count) values
  ('r1000000-0000-0000-0000-000000000005', 't1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'I had the exact same situation with my GP! Here''s what worked for me:

1. Print the Maudsley Deprescribing Guidelines chapter on your drug
2. Bring published research on hyperbolic tapering
3. Explain the difference between linear and hyperbolic dose reductions
4. Ask for a referral to a psychiatrist if GP isn''t comfortable with slow tapers

As for tracking withdrawal vs relapse: withdrawal symptoms typically start within days of a dose change and improve over weeks. Relapse tends to come on gradually weeks/months after stabilizing. The journal feature here is perfect for tracking this.',
   15),
  ('r1000000-0000-0000-0000-000000000006', 't1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002',
   'Seconding everything Sarah said. I''d also recommend checking the TaperMeds deprescriber map to find a clinician in your area who actually understands tapering. It made all the difference for me.',
   9),
  ('r1000000-0000-0000-0000-000000000007', 't1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003',
   'Don''t let your doctor rush you. 6 weeks from 20mg is dangerous. I''ve seen so many people on here who were harmed by fast tapers. You deserve a slow, safe taper. Stand your ground!',
   7);

-- Replies to Effexor tips thread
insert into public.replies (id, thread_id, user_id, body, helpful_count) values
  ('r1000000-0000-0000-0000-000000000008', 't1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'This is an incredible guide Mike, thank you! The bead counting method is how most people successfully taper Effexor. The precision is so important with such a short half-life drug.',
   22),
  ('r1000000-0000-0000-0000-000000000009', 't1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005',
   'I wish I had found this before my doctor cut me from 150 to 75 in one go. I''m going to start bead counting from here. Quick question: do you take the beads at the same time every day? Does timing matter with Effexor''s short half-life?',
   3),
  ('r1000000-0000-0000-0000-000000000010', 't1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'Great question Pat! Yes, timing is crucial with Effexor because of the short half-life. I took mine at the exact same time every morning — set an alarm. Even a few hours'' difference can trigger mini-withdrawals.

Some people split their dose AM/PM to keep more even blood levels, but check with your prescriber first.',
   14);

-- Replies to Effexor thread 2
insert into public.replies (id, thread_id, user_id, body, helpful_count) values
  ('r1000000-0000-0000-0000-000000000011', 't1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002',
   'Oh no, 150 to 75 in one step is a 50% cut — way too much for Effexor. I would seriously consider reinstating to a middle dose (maybe 112.5mg) and stabilizing, then starting a slower taper with bead counting.

The brain zaps at 3 weeks aren''t going to resolve quickly from a cut that large. Please talk to your prescriber about reinstating.

**Important:** I''m a peer, not a doctor. Please discuss any dose changes with your prescriber.',
   16),
  ('r1000000-0000-0000-0000-000000000012', 't1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003',
   'I''m so sorry you''re going through this. The "just discontinuation syndrome" dismissal makes me furious. Your suffering is real.

Fish oil (high EPA) helped my brain zaps somewhat. And yes, consider finding a prescriber who actually understands withdrawal — check the deprescriber map.',
   8);

-- Replies to Mirtazapine threads
insert into public.replies (id, thread_id, user_id, body, helpful_count) values
  ('r1000000-0000-0000-0000-000000000013', 't1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'The rebound insomnia is the hardest part of mirtazapine tapering. For me, it stabilized after about 10 days at each new dose. Key things that helped:

- Magnesium glycinate before bed (400mg)
- No screens 1 hour before sleep
- Keep the room COLD
- Accept that you''ll have some bad nights — fighting the insomnia makes it worse

I''d suggest holding at 7.5mg for at least another month before trying the cut again, and when you do, try a smaller reduction (maybe to 5.5mg instead of 3.75mg using water titration).',
   11),
  ('r1000000-0000-0000-0000-000000000014', 't1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002',
   'Going from 7.5mg to 3.75mg is a 50% cut — too aggressive for the dose range where mirtazapine''s antihistamine effect is strongest. Consider water titration to make smaller cuts. Sarah''s thread about the method is really helpful.',
   9),
  ('r1000000-0000-0000-0000-000000000015', 't1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004',
   'I''m going through the same thing. Night 6 here. The melatonin isn''t helping. Just wanted you to know you''re not alone. Holding at my current dose for now.',
   4),
  ('r1000000-0000-0000-0000-000000000016', 't1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003',
   'This is exactly what I needed! I''ve been cutting tablets in half and the jumps are too big. Going to try water titration. Did you notice any difference in potency with the dissolved tablet?',
   6),
  ('r1000000-0000-0000-0000-000000000017', 't1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005',
   'Congratulations on 6 months free! The water titration method is brilliant. I''m sharing this with my pharmacist.',
   3);

-- Replies to intro threads
insert into public.replies (id, thread_id, user_id, body, helpful_count) values
  ('r2000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0002-000000000001', 'a0000000-0000-0000-0000-000000000002',
   'Welcome Sarah! Your Lexapro taper plan looks solid. The liquid formulation really is the way to go below 5mg. Keep us updated — you''re doing great!',
   5),
  ('r2000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0002-000000000001', 'a0000000-0000-0000-0000-000000000003',
   'Thanks for sharing your story. I''m also tapering with a similar schedule. The emotional range coming back is something I relate to — both beautiful and terrifying!',
   3),
  ('r2000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0002-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Mike, your Effexor journey is incredibly inspiring. 225mg to 0 with bead counting — that takes serious dedication. So glad you''re doing well over a year out!',
   7);

-- ============================================================
-- UPDATE FORUM POST COUNTS
-- ============================================================
update public.forums set post_count = 2 where id = 'f0000000-0000-0000-0001-000000000001';
update public.forums set post_count = 2 where id = 'f0000000-0000-0000-0002-000000000001';
update public.forums set post_count = 2 where id = 'd1000000-0000-0000-0000-000000000001';
update public.forums set post_count = 2 where id = 'd1000000-0000-0000-0000-000000000002';
update public.forums set post_count = 2 where id = 'd1000000-0000-0000-0000-000000000003';
update public.forums set post_count = 1 where id = 'd1000000-0000-0000-0000-000000000004';
update public.forums set post_count = 1 where id = 'd1000000-0000-0000-0000-000000000005';
update public.forums set post_count = 1 where id = 'd1000000-0000-0000-0000-000000000007';
update public.forums set post_count = 1 where id = 'd1000000-0000-0000-0000-000000000016';
update public.forums set post_count = 1 where id = 'd1000000-0000-0000-0000-000000000020';
update public.forums set post_count = 1 where id = 'd1000000-0000-0000-0000-000000000024';
