'use client';

import { useEffect, useRef, useState } from 'react';

/*
  TaperMeds Education Portal
  Notion-style, content-first, radically simple.
  Purple brand (#5B2E91), system sans-serif body, Georgia headings.
*/

const PURPLE = '#482BE7';
const PURPLE_LIGHT = '#ECE8FF';
const PURPLE_BG = '#F5F3FF';
const TEAL = '#1A7F7A';
const TEAL_BG = '#F0FAF9';
const AMBER = '#A56B00';
const AMBER_BG = '#FDF8EC';
const GRAY = '#6B6580';
const LIGHT = '#F5F3F8';
const BORDER = '#D5D7DE';
const TEXT = '#1E0E62';
const MUTED = '#8C8699';

// ─── All curriculum content ───
const MODULES = [
  // ─── LAYER 1 ───
  {
    id: "intro",
    layer: 0,
    title: "Introduction",
    content: [
      { type: "p", text: "Most clinicians were trained to prescribe psychiatric medications. Almost none were trained to stop them." },
      { type: "p", text: "This is not a gap in continuing education. It is a gap in foundational medical training. The result is that millions of patients are kept on medications longer than necessary, tapered too quickly when they do stop, or left to manage withdrawal alone after a rushed discontinuation." },
      { type: "p", text: "This curriculum is structured in three layers. Layer 1 builds the conceptual foundation — the mental models you need before you touch a single dose. Layer 2 gives you the protocols, drug by drug. Layer 3 prepares you for the hard clinical decisions that no protocol can fully cover." },
      { type: "p", text: "Every module is built around a patient scenario. The theory serves the case, not the other way around." },
      { type: "warning", text: "This curriculum is educational. It does not constitute medical advice, and no content here should override your clinical judgment or the specific circumstances of your patients." },
    ],
  },
  {
    id: "1-1",
    layer: 1,
    num: "1.1",
    title: "What Happens at the Receptor",
    duration: "15 min",
    objectives: [
      "Explain neuroadaptation and why the brain resists changes in medication levels",
      "Describe why dose reductions are not pharmacologically equal at different dose levels",
      "Understand the concept of receptor occupancy and its implications for taper design",
    ],
    content: [
      { type: "scenario", title: "Karim, 47", text: "Karim has been on venlafaxine 150mg for 4 years. His PCP reduced the dose to 75mg in one step. Within 3 days, Karim experienced severe dizziness, electric shock sensations in his head, uncontrollable crying, and insomnia. He called the clinic in distress. The on-call physician told him to go back to 150mg." },
      { type: "h3", text: "Neuroadaptation: The Brain Adjusts" },
      { type: "p", text: "When a patient takes a psychiatric medication for weeks or months, the brain adapts to its presence. If the drug increases serotonin availability, the brain downregulates serotonin receptors. If the drug enhances GABA activity, the brain reduces its own GABA sensitivity. This is neuroadaptation — the brain's attempt to maintain homeostasis in the presence of the drug." },
      { type: "p", text: "The drug is no longer just treating a condition. It has become part of the brain's equilibrium. When you remove it — or reduce it significantly — you are not returning the brain to its pre-medication state. You are disrupting the new equilibrium. The brain needs time to readjust, and that readjustment process is what we experience as withdrawal." },
      { type: "video", videoId: "Ks70lCqRC9k", start: 1994, end: 2072, time: "33:14 – 34:32", title: "Neuroadaptation & the \"Factory Reset\" Analogy", desc: "Why the brain must re-sensitize to its own neurotransmitters — and why no supplement or drug can speed up this process. \"A bit like healing from a broken leg.\"", source: "Metabolic Mind — Dr. Mark Horowitz" },
      { type: "h3", text: "The Receptor Occupancy Problem" },
      { type: "p", text: "This is the single most important concept in deprescribing, and it is the one most clinicians were never taught." },
      { type: "p", text: "Drug-receptor binding follows a hyperbolic curve, not a linear one. At higher doses, receptors are nearly saturated — going from 150mg to 75mg of venlafaxine might reduce receptor occupancy by 10–15%. But going from 75mg to 0mg reduces receptor occupancy by 40–50% or more." },
      { type: "p", text: "In other words: the same milligram reduction produces a much larger pharmacological effect at lower doses. A 50% dose cut at a high dose is a modest receptor-level change. A 50% dose cut at a low dose is a massive one." },
      { type: "video", videoId: "Ks70lCqRC9k", start: 1501, end: 1638, time: "25:01 – 27:18", title: "The Hyperbolic Curve & Law of Mass Action", desc: "Dr. Horowitz explains why doubling the dose doesn't double the effect on the brain — with the musical chairs analogy for receptor saturation.", source: "Metabolic Mind — Dr. Mark Horowitz" },
      { type: "h3", text: "What This Means for Taper Design" },
      { type: "p", text: "If you reduce doses in equal steps — say 150mg, then 75mg, then 37.5mg, then zero — you are making progressively larger pharmacological changes at each step. The first reduction is the gentlest. The last one is the most violent. This is backwards." },
      { type: "p", text: "Rational taper design requires smaller absolute dose reductions as the dose gets lower. This is called hyperbolic tapering. Equal dose cuts are not equal receptor cuts." },
      { type: "h3", text: "Why Karim Suffered" },
      { type: "p", text: "Karim's dose was cut by 50% in a single step. Venlafaxine has a short half-life, so blood levels dropped quickly. His brain — adapted to the presence of 150mg — was suddenly operating in a state of significant serotonergic and noradrenergic deficit. His symptoms were not a sign of relapse. They were predictable, physiological withdrawal." },
      { type: "pearl", text: "Never reduce a dose by a fixed percentage across all levels. A 10% reduction at 200mg is a small receptor-level change. A 10% reduction at 10mg is still a small receptor-level change. But a 50% reduction at 10mg is enormous. Always think in receptor occupancy, not milligrams." },
      { type: "warning", text: "Venlafaxine and paroxetine are among the most difficult psychiatric medications to discontinue due to their short half-lives and potent receptor effects. Extra caution and slower taper schedules are warranted with these drugs specifically." },
    ],
  },
  {
    id: "1-2",
    layer: 1,
    num: "1.2",
    title: "Withdrawal Is Not Relapse",
    duration: "15 min",
    objectives: [
      "Distinguish withdrawal syndrome from relapse using timing, symptom profile, and trajectory",
      "Identify symptoms specific to withdrawal that do not occur in the original psychiatric condition",
      "Explain why misdiagnosis of withdrawal as relapse leads to unnecessary long-term medication use",
    ],
    content: [
      { type: "scenario", title: "Maria, 38", text: "Maria has been on paroxetine 40mg for 6 years for generalized anxiety disorder. Her clinician tapered her to 10mg over 3 months. Two weeks after her most recent reduction, she reports intense anxiety, brain zaps, dizziness, insomnia, and irritability. She says: \"The anxiety is back. I knew I couldn't come off this medication.\"" },
      { type: "h3", text: "The Misdiagnosis Problem" },
      { type: "p", text: "This is perhaps the most consequential error in deprescribing: interpreting withdrawal symptoms as evidence that the patient still needs the medication. It happens constantly, and it keeps patients on drugs for years or decades longer than necessary." },
      { type: "video", videoId: "Ks70lCqRC9k", start: 607, end: 854, time: "10:07 – 14:14", title: "Why Guidelines Say \"Mild and Brief\" — and Why They're Wrong", desc: "How 8–12 week trials created the myth. Half of 3-year users report withdrawal; two-thirds at 10+ years. \"In doctors' minds, the horses are relapse and the zebras are withdrawal. The data says the opposite.\"", source: "Metabolic Mind — Dr. Mark Horowitz" },
      { type: "h3", text: "How to Tell the Difference" },
      { type: "p", bold: "Timing. ", text: "Withdrawal symptoms typically emerge within days of a dose reduction (hours for short half-life drugs like venlafaxine and paroxetine). Relapse of the original condition typically develops gradually over weeks to months." },
      { type: "p", bold: "Symptom profile. ", text: "Withdrawal produces symptoms that are not features of the original condition. Brain zaps, dizziness, flu-like feelings, sensory disturbances, and depersonalization are withdrawal phenomena. They do not occur in depression or generalized anxiety disorder." },
      { type: "p", bold: "Trajectory. ", text: "Withdrawal symptoms typically follow a wave-and-window pattern. They fluctuate — bad days and better days. Genuine relapse tends to be more persistent and progressive." },
      { type: "p", bold: "Response to reinstatement. ", text: "If symptoms resolve within hours to days of restoring the previous dose, this strongly suggests withdrawal. True relapse would not respond this quickly." },
      { type: "video", videoId: "PSjYH044-2Q", start: 1280, end: 1522, time: "21:20 – 25:22", title: "A Systematic Checklist for Differentiating Withdrawal from Relapse", desc: "Five clues: rapid onset, attendant physical symptoms, novel symptom profile, reinstatement response, wave pattern. Plus: why severity and duration no longer rule out withdrawal.", source: "IIPDW — Dr. Mark Horowitz & Stevie Lewis" },
      { type: "h3", text: "What Maria Is Experiencing" },
      { type: "p", text: "Maria's symptoms emerged within days of a dose reduction. She is reporting brain zaps and dizziness — neither of which is a feature of GAD. This is paroxetine discontinuation syndrome, not relapse." },
      { type: "p", text: "The critical intervention is not to reinstate her to 40mg. It is to explain what is happening, validate that her symptoms are real and physiological, and adjust the taper plan." },
      { type: "pearl", text: "When a patient says \"It's back\" or \"I can't do this,\" resist the urge to agree. Ask: When exactly did this start? Is there anything new — dizziness, electric feelings, flu-like sensations? This two-question screen catches the majority of withdrawal-misdiagnosed-as-relapse cases." },
    ],
  },
  {
    id: "1-3",
    layer: 1,
    num: "1.3",
    title: "The Wave-and-Window Pattern",
    duration: "10 min",
    objectives: [
      "Describe the wave-and-window pattern of withdrawal recovery",
      "Explain to patients why non-linear recovery is normal and expected",
      "Use the wave-and-window framework to guide taper pacing decisions",
    ],
    content: [
      { type: "scenario", title: "James, 61", text: "James is 22 weeks into a diazepam taper, down from 20mg to 7.5mg. Last week he had four terrible days — insomnia, muscle tension, overwhelming anxiety. Then three good days. Now he is having another bad stretch. He says: \"I feel like I'm going backwards. This isn't working.\"" },
      { type: "h3", text: "Why Recovery Is Not Linear" },
      { type: "p", text: "Patients expect recovery to feel like a straight line: each day should be a little better than the last. When it isn't — when a terrible day follows a good one — they interpret this as failure." },
      { type: "p", text: "Withdrawal recovery follows what the deprescribing community calls the \"wave-and-window\" pattern. Waves are periods of symptom intensity — days or weeks where withdrawal symptoms flare. Windows are periods of relative normalcy." },
      { type: "p", text: "Early in a taper, the waves are long and the windows are short. Over time, the pattern reverses: the windows get longer, the waves get shorter and less intense. But this shift is gradual and non-linear." },
      { type: "video", videoId: "PSjYH044-2Q", start: 862, end: 1002, time: "14:22 – 16:42", title: "Why Withdrawal Symptoms Can Last Months or Years", desc: "Receptor downregulation, homeostasis, and why \"the drug is out of your body\" misunderstands what's happening. Withdrawal duration = brain re-sensitization time, not drug elimination time.", source: "IIPDW — Dr. Mark Horowitz & Stevie Lewis" },
      { type: "h3", text: "What Patients Need to Hear" },
      { type: "p", text: "The conversation sounds like this: \"As we reduce your dose, you're going to have some difficult days. You're also going to have some good days. The difficult days do not mean you're getting worse. They are part of how the brain readjusts. Over time, the good stretches will get longer and the hard stretches will get shorter. But it won't be a straight line.\"" },
      { type: "p", text: "This single framing prevents a significant proportion of panic-driven reinstatements." },
      { type: "video", videoId: "PSjYH044-2Q", start: 795, end: 857, time: "13:15 – 14:17", title: "Akathisia: The Most Dangerous Withdrawal Symptom", desc: "\"Nervous system on fire.\" Pacing, unbearable inner restlessness, and suicide risk. Studies show increased suicide attempts in weeks after stopping antidepressants. Critical safety knowledge.", source: "IIPDW — Dr. Mark Horowitz & Stevie Lewis" },
      { type: "h3", text: "Using Waves and Windows to Guide Pacing" },
      { type: "p", text: "If a patient's waves are getting longer and more intense over time, the taper may be too fast. If waves are stable or shortening, the pace is appropriate. If windows have disappeared entirely, the patient needs a hold or a slight dose increase." },
      { type: "pearl", text: "Set the wave-and-window expectation before the first dose reduction, not after the first crisis. Patients who understand the pattern in advance tolerate it far better than patients who are introduced to it as reassurance after they are already frightened." },
    ],
  },
  {
    id: "1-4",
    layer: 1,
    num: "1.4",
    title: "The Reinstatement Trap",
    duration: "10 min",
    objectives: [
      "Explain the cycle of rapid taper, severe withdrawal, panic reinstatement, and long-term dependence",
      "Identify when full reinstatement is disproportionate and partial reinstatement is more appropriate",
      "Describe how the reinstatement trap perpetuates the false belief that patients cannot discontinue",
    ],
    content: [
      { type: "scenario", title: "Ananya, 33", text: "Ananya's previous psychiatrist tapered her off venlafaxine 225mg over 4 weeks. She experienced severe withdrawal and was reinstated at full dose within days. She was told she likely needed the medication \"for life.\" She has come to you because she wants to try again, but she is terrified." },
      { type: "h3", text: "The Cycle" },
      { type: "p", text: "The reinstatement trap works like this: A clinician tapers a patient too quickly. The patient develops severe withdrawal. The clinician interprets this as relapse and reinstates at full dose. Both conclude the patient cannot function without the drug. The patient stays on the medication indefinitely." },
      { type: "p", text: "Every element of this cycle is preventable." },
      { type: "video", videoId: "Ks70lCqRC9k", start: 376, end: 514, time: "6:16 – 8:34", title: "\"Trapped on the Drug\" — A Clinician's Own Reinstatement", desc: "Dr. Horowitz describes tapering from Lexapro, experiencing 9.5/10 withdrawal severity, and being forced to reinstate — realizing he was on the drug not because it was helpful, but because he couldn't stop.", source: "Metabolic Mind — Dr. Mark Horowitz" },
      { type: "h3", text: "Proportionate Response" },
      { type: "p", text: "When a patient is struggling during a taper, the options are not binary. The appropriate responses, in order of escalation:" },
      { type: "list", items: [
        "Hold. Stay at the current dose and wait. Many withdrawal symptoms resolve within 2–4 weeks.",
        "Slow down. Extend the timeline between reductions.",
        "Reduce the step size. If you were cutting by 25%, try 10%.",
        "Partial reinstatement. Go back one step — not all the way to the starting dose.",
      ]},
      { type: "p", text: "Full reinstatement to the original dose should be rare. It is almost never the right first response." },
      { type: "pearl", text: "When a patient has had a traumatic previous taper attempt, name it directly: \"What happened before was too fast. That's not what we're going to do.\" This simple statement rebuilds trust faster than any amount of pharmacological explanation." },
    ],
  },
  {
    id: "1-5",
    layer: 1,
    num: "1.5",
    title: "Layer 1 Assessment",
    duration: "15 min",
    isAssessment: true,
    content: [
      { type: "p", text: "The following clinical scenarios test your understanding of foundational deprescribing concepts. Select the best answer and review the explanation." },
    ],
    questions: [
      {
        q: "A patient on sertraline 100mg for 3 years has been stable. Her PCP suggests reducing to 50mg for 2 weeks, then 25mg for 2 weeks, then zero. What is the primary concern?",
        opts: ["Sertraline cannot be split into smaller doses", "The dose reductions represent progressively larger receptor occupancy changes", "Sertraline should never be discontinued", "Two-week intervals are always too short"],
        answer: 1,
        explain: "Due to hyperbolic receptor binding, the drop from 50→25mg and 25→0mg produce much larger receptor-level changes than 100→50mg. The plan needs smaller steps at lower doses."
      },
      {
        q: "A patient reports severe anxiety, brain zaps, and dizziness 5 days after reducing paroxetine from 20mg to 10mg. She has a history of GAD. What is the most likely explanation?",
        opts: ["Relapse of generalized anxiety disorder", "Paroxetine discontinuation syndrome", "Nocebo effect from negative expectations", "New-onset panic disorder"],
        answer: 1,
        explain: "Onset within days of dose reduction, combined with neurological symptoms (brain zaps, dizziness) not features of GAD, strongly indicates discontinuation syndrome."
      },
      {
        q: "A patient 16 weeks into a benzodiazepine taper reports: \"Last week was awful. But the week before was actually pretty good.\" What does this pattern represent?",
        opts: ["Treatment failure requiring reinstatement", "The normal wave-and-window pattern of withdrawal recovery", "Evidence that the original anxiety disorder is untreated", "A medical emergency"],
        answer: 1,
        explain: "Fluctuating symptoms with alternating difficult periods (waves) and better periods (windows) is characteristic of normal withdrawal recovery."
      },
      {
        q: "A patient was previously tapered off venlafaxine 225mg in 3 weeks and experienced severe withdrawal. She was reinstated and told she needed medication indefinitely. She wants to try again. What is the most important first step?",
        opts: ["Prescribe a different antidepressant", "Refer to a psychiatrist", "Acknowledge her previous experience was caused by taper speed, not medication need, and present a different plan", "Order genetic testing"],
        answer: 2,
        explain: "The most important intervention is reframing: she was not untaperable — she was tapered too fast. Naming this directly and demonstrating a structurally different approach rebuilds trust."
      },
    ],
  },
  // ─── LAYER 2 ───
  {
    id: "2-1",
    layer: 2,
    num: "2.1",
    title: "Hyperbolic Tapering in Practice",
    duration: "15 min",
    objectives: [
      "Design a taper schedule using hyperbolic dose reductions",
      "Identify practical methods for achieving small dose reductions (liquid, compounding, splitting)",
    ],
    content: [
      { type: "scenario", title: "Elena, 29", text: "Elena is on escitalopram 20mg and wants to taper off. You understand that equal dose cuts are not equal receptor cuts. Now you need to build an actual schedule." },
      { type: "h3", text: "From Principle to Schedule" },
      { type: "p", text: "Target roughly equal receptor occupancy reductions at each step, rather than equal milligram reductions. For most SSRIs, this means:" },
      { type: "list", items: [
        "First reductions: 5–10% of the current dose every 2–4 weeks",
        "Mid-taper: the same 5–10% of the new (lower) current dose",
        "Final reductions: very small absolute amounts, held for longer periods",
      ]},
      { type: "p", text: "For Elena on escitalopram 20mg, a conservative hyperbolic schedule might look like: 20→18→16→14→12→10→8→6→5→4→3→2→1.5→1→0.5→0mg. Notice how the absolute reductions shrink: 2mg steps at the top become 0.5mg steps at the bottom." },
      { type: "h3", text: "Getting to Small Doses" },
      { type: "video", videoId: "Ks70lCqRC9k", start: 1462, end: 1750, time: "24:22 – 29:10", title: "Linear vs. Hyperbolic Taper — With the Graph", desc: "Full walkthrough: why halving doses creates a cliff at the end, the hyperbolic curve in practice, and the observational studies showing patients who failed linear tapers succeeded with hyperbolic ones.", source: "Metabolic Mind — Dr. Mark Horowitz" },
      { type: "p", bold: "Liquid formulations. ", text: "Many SSRIs are available as oral solutions. Escitalopram comes as 1mg/mL. This allows precise dosing down to fractions of a milligram. Liquid is the gold standard for hyperbolic tapering." },
      { type: "p", bold: "Compounding pharmacies. ", text: "Where liquid formulations are not commercially available, a compounding pharmacy can create custom-dose capsules or suspensions." },
      { type: "p", bold: "Tablet splitting. ", text: "Adequate for early reductions but insufficient for the fine-grained cuts needed at lower doses." },
      { type: "h3", text: "Timing Between Steps" },
      { type: "p", text: "The Maudsley Guidelines suggest holding each new dose for at least 2–4 weeks. Do not proceed to the next reduction while the patient is still experiencing active withdrawal symptoms from the last one." },
      { type: "video", videoId: "PSjYH044-2Q", start: 2656, end: 2788, time: "44:16 – 46:28", title: "Why Every-Other-Day Dosing Backfires", desc: "Half-life math: a drug with a 24-hour half-life drops to 25% after skipping one day. \"This well-meaning advice often backfires and causes severe withdrawal. Better to take a smaller dose each day.\"", source: "IIPDW — Dr. Mark Horowitz & Stevie Lewis" },
      { type: "pearl", text: "Ask your pharmacy about liquid formulations early. Escitalopram, citalopram, fluoxetine, sertraline, and paroxetine are all available as oral solutions. This single piece of information opens up hyperbolic tapering for most SSRI patients." },
    ],
  },
  {
    id: "2-2",
    layer: 2,
    num: "2.2",
    title: "SSRI Deprescribing",
    duration: "15 min",
    objectives: [
      "Identify which SSRIs are hardest to discontinue and why",
      "Apply Maudsley-informed taper schedules for the five major SSRIs",
      "Manage SSRI-specific withdrawal symptoms",
    ],
    content: [
      { type: "scenario", title: "Michael, 43", text: "Michael has been on paroxetine 30mg for 8 years. He wants to stop. His previous attempt (cold turkey, on his own) lasted 3 days before he reinstated due to unbearable symptoms." },
      { type: "h3", text: "The SSRI Difficulty Spectrum" },
      { type: "p", bold: "Hardest: Paroxetine. ", text: "Very short half-life (~21 hours), no active metabolites, strong receptor binding, and anticholinergic properties. Widely regarded as the most difficult SSRI to taper." },
      { type: "p", bold: "Hard: Sertraline, citalopram, escitalopram. ", text: "Moderate half-lives (~24–36 hours). Withdrawal is common with rapid discontinuation but manageable with proper tapering." },
      { type: "p", bold: "Easiest: Fluoxetine. ", text: "Very long half-life (4–6 days parent, 4–16 days active metabolite). Fluoxetine effectively self-tapers due to its slow elimination." },
      { type: "h3", text: "Paroxetine: The Hardest Case" },
      { type: "list", items: [
        "Use liquid paroxetine (10mg/5mL) for fine dose control",
        "Reduce by no more than 10% of the current dose at each step",
        "Hold each step for at least 4 weeks",
        "Expect total taper duration of 6–12 months or more from 30mg",
        "Final reductions (below 5mg) should be 0.5mg or smaller steps",
      ]},
      { type: "video", videoId: "PSjYH044-2Q", start: 2288, end: 2407, time: "38:08 – 40:07", title: "Paroxetine: A 30-Step Taper from 40mg — Walkthrough", desc: "Concrete example from RCPsych guidance: 10% proportional reductions, each step getting smaller. \"I've seen people take 3, 4, 5 or longer years to come off paroxetine.\" Some need half this rate or less.", source: "IIPDW — Dr. Mark Horowitz & Stevie Lewis" },
      { type: "h3", text: "SSRI Withdrawal Symptoms" },
      { type: "p", text: "Brain zaps (the hallmark), dizziness and balance problems, emotional lability, vivid or disturbing dreams, flu-like symptoms, gastrointestinal disturbance, and sensory distortions. These symptoms are self-limiting but can be severe. Patients should be warned about all of them in advance." },
      { type: "video", videoId: "PSjYH044-2Q", start: 2788, end: 2842, time: "46:28 – 47:22", title: "The Fluoxetine \"Self-Tapering\" Myth", desc: "Delayed withdrawal symptoms make fluoxetine harder to recognize, not easier. \"Not self-tapering enough to just stop abruptly.\" Must be tapered like other SSRIs.", source: "IIPDW — Dr. Mark Horowitz & Stevie Lewis" },
      { type: "warning", text: "Paroxetine withdrawal can include severe neurological symptoms including extreme dizziness, confusion, and depersonalization. Patients discontinuing paroxetine should not drive during active withdrawal if experiencing vestibular symptoms." },
    ],
  },
  {
    id: "2-3",
    layer: 2,
    num: "2.3",
    title: "SNRI Deprescribing",
    duration: "15 min",
    objectives: [
      "Explain why SNRIs produce a dual withdrawal syndrome",
      "Manage the specific challenges of venlafaxine tapering",
      "Apply appropriate taper strategies for duloxetine",
    ],
    content: [
      { type: "scenario", title: "Priya, 48", text: "Priya has been on venlafaxine XR 225mg for 5 years. She missed two doses while traveling and experienced what she describes as \"the worst 48 hours of my life\" — vertigo, electric shocks, uncontrollable crying, and a feeling that her head was \"disconnected from her body.\"" },
      { type: "h3", text: "The Dual Withdrawal Problem" },
      { type: "p", text: "SNRIs affect both serotonin and norepinephrine systems. When you taper them, you are managing two withdrawal syndromes simultaneously." },
      { type: "h3", text: "Venlafaxine: Unique Challenges" },
      { type: "list", items: [
        "Extremely short half-life (~5 hours). Missing a single dose produces symptoms.",
        "XR capsule granules are difficult to split reliably.",
        "No commercially available liquid formulation in most markets.",
        "Potent dual-action withdrawal.",
      ]},
      { type: "h3", text: "Practical Strategies" },
      { type: "p", bold: "Bead counting. ", text: "Venlafaxine XR capsules contain small beads. Some clinicians count beads to remove a precise number for each reduction. A 75mg capsule typically contains ~200–250 beads." },
      { type: "p", bold: "Compounding. ", text: "Custom-dose capsules or oral suspension. The most reliable method for fine-grained control." },
      { type: "p", bold: "Cross-taper to fluoxetine. ", text: "Some clinicians introduce fluoxetine (~20mg) at the end of the venlafaxine taper, then taper the fluoxetine. This leverages fluoxetine's long half-life to smooth the final discontinuation." },
      { type: "pearl", text: "If Priya's missed-dose experience was \"the worst 48 hours of her life,\" imagine what cold-turkey discontinuation would be like. The taper from 225mg will likely take 6–12 months. Frame this honestly from the beginning." },
    ],
  },
  {
    id: "2-4",
    layer: 2,
    num: "2.4",
    title: "Benzodiazepine Tapering — The Ashton Approach",
    duration: "15 min",
    objectives: [
      "Explain the Ashton Manual's approach to benzodiazepine withdrawal",
      "Determine when a diazepam crossover is appropriate",
      "Design a long-duration benzodiazepine taper schedule",
    ],
    content: [
      { type: "scenario", title: "Robert, 67", text: "Robert has been on lorazepam 2mg daily for 15 years. His PCP tried to taper him once — 1mg for a week, then 0.5mg for a week, then stop. Robert experienced seizure-like symptoms and was rushed to the emergency department." },
      { type: "h3", text: "Why Benzodiazepines Are Different" },
      { type: "p", text: "Benzodiazepine withdrawal can be medically dangerous. Rapid discontinuation can cause seizures. This is not theoretical — Robert experienced it." },
      { type: "video", videoId: "Ks70lCqRC9k", start: 1123, end: 1186, time: "18:43 – 19:46", title: "Lithium, Benzodiazepines, and Cross-Class Withdrawal", desc: "Lithium withdrawal produces 8x the rate of mood episodes — proving withdrawal, not relapse. Benzodiazepine tolerance and interdose withdrawal making long-term use actively harmful.", source: "Metabolic Mind — Dr. Mark Horowitz" },
      { type: "p", text: "The Ashton Manual's core principles:" },
      { type: "list", items: [
        "Never taper too fast. Typical tapers take months to over a year.",
        "Consider switching to diazepam (long half-life smooths interdose withdrawal).",
        "Reduce by small increments (5–10% of current dose) every 2–4 weeks.",
        "Final reductions should be the smallest and slowest.",
        "Never stop a benzodiazepine abruptly after long-term use.",
      ]},
      { type: "h3", text: "The Diazepam Crossover" },
      { type: "p", text: "Diazepam has a half-life of 20–100 hours (with active metabolites lasting longer), vs. lorazepam's 10–20 hours. This means stable blood levels between doses, eliminating interdose withdrawal." },
      { type: "p", text: "The crossover is done gradually — replacing one dose at a time over weeks. For Robert (lorazepam 2mg ≈ diazepam 20mg): replace the evening dose first, stabilize 1–2 weeks, then replace the morning dose." },
      { type: "h3", text: "Protracted Withdrawal" },
      { type: "p", text: "Some patients experience symptoms for months or years after discontinuation: persistent anxiety (different in quality from the original), sensory hypersensitivity, tinnitus, muscle tension, cognitive fog, and sleep disturbance. These gradually improve but on a timeline of months, not weeks." },
      { type: "warning", text: "Benzodiazepine withdrawal can cause seizures, particularly with rapid discontinuation. Robert's previous taper — lorazepam 2mg to zero in 3 weeks — was dangerously fast. Long-term tapers should take months to over a year." },
    ],
  },
  {
    id: "2-5",
    layer: 2,
    num: "2.5",
    title: "Patient Assessment and Readiness",
    duration: "10 min",
    objectives: [
      "Assess whether a patient is a suitable candidate for deprescribing",
      "Identify factors that increase or decrease taper difficulty",
      "Conduct a structured pre-taper conversation",
    ],
    content: [
      { type: "scenario", title: "Lisa, 52", text: "Lisa is on sertraline 150mg and alprazolam 1mg daily. She has recently divorced, moved to a new city, and started a new job. She wants to \"get off everything.\" She is motivated and impatient." },
      { type: "h3", text: "Is Now the Right Time?" },
      { type: "p", text: "Not every motivated patient should taper right now. Motivation is necessary but not sufficient. Deprescribing is stressful. If a patient is navigating major life stressors, adding withdrawal symptoms may be counterproductive." },
      { type: "video", videoId: "Ks70lCqRC9k", start: 2193, end: 2522, time: "36:33 – 42:02", title: "Does Everybody Need to Come Off? Benefits vs. Harms", desc: "NNT of 7 for antidepressants, tolerance and waning benefit, emotional numbing as both help and harm, the chemical imbalance framing, and long-term adverse effects. A framework for the decision — not a mandate.", source: "Metabolic Mind — Dr. Mark Horowitz" },
      { type: "h3", text: "Assessment Framework" },
      { type: "p", bold: "Current stability. ", text: "How long has the patient been symptom-stable? Longer stability predicts smoother tapering." },
      { type: "p", bold: "Life stressors. ", text: "Major stressors don't prohibit tapering, but they should inform pace and timing." },
      { type: "p", bold: "Support system. ", text: "A patient tapering in isolation is at higher risk for panic reinstatement." },
      { type: "p", bold: "Previous attempts. ", text: "If the patient has tried before, what happened? Previous trauma requires explicit acknowledgment." },
      { type: "p", bold: "Drug and dose profile. ", text: "Duration of use and drug type significantly affect expected difficulty." },
      { type: "h3", text: "The Pre-Taper Conversation" },
      { type: "p", text: "Before any dose is changed, the patient needs to understand: what to expect, how long it will take, that the pace can be adjusted, that symptoms are not relapse, and that you will be monitoring throughout. This conversation is the single greatest predictor of taper success." },
      { type: "pearl", text: "\"I hear that you want to get off everything, and I'm going to help you do that. But right now you're managing a lot of change. I'd like to wait 2–3 months until things settle, then start one medication at a time.\"" },
    ],
  },
  {
    id: "2-6",
    layer: 2,
    num: "2.6",
    title: "Layer 2 Assessment",
    duration: "15 min",
    isAssessment: true,
    content: [],
    questions: [
      {
        q: "A patient on escitalopram 20mg is currently at 5mg and struggling. The next step is 2.5mg. How should the dose reduction be achieved?",
        opts: ["Break the 5mg tablet in half", "Switch to escitalopram oral solution (1mg/mL) and reduce by 0.5mg", "Discontinue from 5mg — the remaining dose is insignificant", "Switch to fluoxetine and stop in one week"],
        answer: 1,
        explain: "At low doses, receptor occupancy changes per milligram are large. Liquid allows precise reductions. 5mg represents substantial receptor occupancy for escitalopram."
      },
      {
        q: "A patient on lorazepam 3mg daily for 10 years wants to taper. What is the recommended first step per the Ashton Manual?",
        opts: ["Reduce lorazepam by 50% immediately", "Switch to alprazolam", "Consider a gradual crossover to equivalent-dose diazepam", "Discontinue and start gabapentin"],
        answer: 2,
        explain: "The Ashton Manual recommends considering a diazepam crossover for short-acting benzodiazepines. Diazepam's long half-life prevents interdose withdrawal."
      },
      {
        q: "A patient on sertraline 150mg, alprazolam 1.5mg, and quetiapine 50mg wants to taper all three. She is stable but recently divorced. What do you recommend?",
        opts: ["Taper all three simultaneously", "Begin with alprazolam since it's most dangerous", "Wait for life circumstances to stabilize, then taper one at a time", "Refer to a specialist"],
        answer: 2,
        explain: "Major life stressors warrant delaying. When ready, taper one at a time. The benzodiazepine should come last and will take the longest."
      },
    ],
  },
  // ─── LAYER 3 ───
  {
    id: "3-1",
    layer: 3,
    num: "3.1",
    title: "Polypharmacy: Which Medication First?",
    duration: "15 min",
    objectives: [
      "Apply a framework for sequencing medication reductions",
      "Manage patient expectations when multiple tapers span a year or more",
    ],
    content: [
      { type: "scenario", title: "Thomas, 58", text: "Thomas is on sertraline 200mg, diazepam 15mg, quetiapine 100mg (sleep), and trazodone 50mg (also sleep). He wants to \"simplify.\" He doesn't know where to start. Neither do you." },
      { type: "h3", text: "The Sequencing Framework" },
      { type: "p", bold: "1. Safety first. ", text: "Do not taper the highest-risk medication first. For Thomas, diazepam withdrawal can cause seizures. Taper it last." },
      { type: "p", bold: "2. Start with the lowest-value medication. ", text: "Which is doing the least clinical work? Thomas has two sedating medications for sleep. Remove trazodone first." },
      { type: "p", bold: "3. One at a time. ", text: "Never taper two simultaneously. If symptoms appear, you need to know which reduction caused them." },
      { type: "p", bold: "4. Allow stabilization between tapers. ", text: "Wait 4–8 weeks between completing one taper and starting the next." },
      { type: "h3", text: "Thomas's Sequencing" },
      { type: "list", items: [
        "First: Trazodone 50mg — lowest complexity, least clinical value",
        "Second: Quetiapine 100mg — off-label for sleep, significant side effect burden",
        "Third: Sertraline 200mg — longest taper, well-understood protocol",
        "Fourth: Diazepam 15mg — highest risk, requires Ashton protocol",
      ]},
      { type: "p", text: "Total expected timeline: 18–24 months. Thomas needs to understand this at the outset." },
      { type: "pearl", text: "The most common mistake in polypharmacy deprescribing is starting with the benzodiazepine because it feels most \"urgent.\" Benzodiazepine withdrawal is difficult enough without simultaneously managing SSRI or antipsychotic changes. Make it the last taper, not the first." },
    ],
  },
  {
    id: "3-2",
    layer: 3,
    num: "3.2",
    title: "Protracted Withdrawal",
    duration: "15 min",
    objectives: [
      "Define protracted withdrawal syndrome and distinguish it from relapse",
      "Provide appropriate support for patients experiencing months-long withdrawal",
    ],
    content: [
      { type: "scenario", title: "Catherine, 44", text: "Catherine completed her diazepam taper 8 months ago after 12 years of use. She still has significant symptoms: persistent anxiety (different in character from her original anxiety), tinnitus, muscle tension, visual disturbances, and cognitive fog. Two clinicians have told her that her \"anxiety disorder has returned.\"" },
      { type: "h3", text: "What Protracted Withdrawal Is" },
      { type: "p", text: "Protracted withdrawal refers to symptoms that persist for months or years after complete discontinuation. It is best documented with benzodiazepines but occurs with antidepressants as well." },
      { type: "p", text: "The symptoms are real. They are not psychological. They represent a nervous system still recalibrating after years of pharmacological influence." },
      { type: "h3", text: "Why It Gets Misdiagnosed" },
      { type: "p", text: "The logic seems straightforward: patient had anxiety before → patient has anxiety after stopping → anxiety disorder has returned. But Catherine's current anxiety emerged during tapering, is accompanied by tinnitus and cognitive fog (never present before), and feels different to her." },
      { type: "p", text: "Restarting a benzodiazepine would re-expose the nervous system to the drug it is trying to recover from, restart the cycle of dependence, and make eventual discontinuation even more difficult." },
      { type: "pearl", text: "The most therapeutic thing you can say to a patient with protracted withdrawal is: \"This is real. It has a name. It will get better. And I will not put you back on the medication that caused it.\" For many patients, this is the first time anyone has said this to them." },
    ],
  },
  {
    id: "3-3",
    layer: 3,
    num: "3.3",
    title: "The Difficult Conversations",
    duration: "10 min",
    objectives: [
      "Navigate conversations where the patient wants to taper but timing is wrong",
      "Navigate conversations where you recommend tapering but the patient is resistant",
      "Manage the patient who wants to stop cold turkey",
    ],
    content: [
      { type: "h3", text: "\"I Want to Stop Everything Now\"" },
      { type: "p", text: "Validate the goal. Redirect the method. \"I hear you. You want to be done with these medications, and I'm going to help you get there. But stopping abruptly would be unsafe. We're going to do this — but in a way your body can handle.\"" },
      { type: "h3", text: "\"I've Been Fine for Years. Do I Still Need This?\"" },
      { type: "p", text: "Take the question seriously. \"That's a really good question. Let's look at your history together. If your condition has been stable for a long time, trying a gradual taper is reasonable. I can't guarantee how it will go, but I can guarantee we'll do it carefully.\"" },
      { type: "h3", text: "\"My Doctor Says I Need This for Life\"" },
      { type: "p", text: "Don't criticize the colleague. Provide accurate information. \"Some people do need medication long-term. But many people who were told they'd need it forever were actually experiencing withdrawal mistaken for relapse. Our understanding has evolved. If you want to explore this, we can do it safely.\"" },
      { type: "h3", text: "\"I Don't Want to Taper\"" },
      { type: "p", text: "This is their right. \"I want to be transparent — I think there might be a benefit to gradually reducing your medication. But this is your decision. I'd like to revisit this in six months. If your feelings change, I'll be here.\"" },
      { type: "video", videoId: "PSjYH044-2Q", start: 2477, end: 2572, time: "41:17 – 42:52", title: "Educating Family, Friends, and Other Clinicians", desc: "Why everyone around the patient needs to understand withdrawal — to prevent misinterpretation, avoid pressure to reinstate, and keep \"everybody heading in the same direction.\"", source: "IIPDW — Dr. Mark Horowitz & Stevie Lewis" },
      { type: "pearl", text: "In all four conversations, the underlying skill is the same: validate the patient's experience, provide accurate information, preserve their autonomy, and keep the door open. Deprescribing is a relationship, not a transaction." },
      { type: "video", videoId: "Ks70lCqRC9k", start: 2551, end: 2702, time: "42:31 – 45:02", title: "Finding an Informed Clinician — Screening Questions", desc: "\"How would you distinguish withdrawal from relapse? Do you use liquids? How long does it take?\" — plus the Maudsley Guidelines, the UK/US guidance gap, and why patients are giving textbooks to their doctors.", source: "Metabolic Mind — Dr. Mark Horowitz" },
    ],
  },
  {
    id: "3-4",
    layer: 3,
    num: "3.4",
    title: "Using Data to Guide Decisions",
    duration: "10 min",
    objectives: [
      "Identify which data points are most useful for monitoring taper progress",
      "Interpret temporal associations between dose changes and symptom changes",
    ],
    content: [
      { type: "scenario", title: "Alex, 35", text: "Alex is 10 weeks into a sertraline taper, currently at 75mg. She tracks symptoms daily (0–10 for anxiety, sleep, energy) and wears a smartwatch. Her last dose reduction was 3 weeks ago. She says she feels \"about the same\" but isn't sure whether to proceed." },
      { type: "h3", text: "What to Track" },
      { type: "p", bold: "Subjective ratings. ", text: "Simple 0–10 scales for core domains: anxiety, sleep, energy, mood, and drug-specific symptoms. Daily ratings, weekly averages." },
      { type: "p", bold: "Temporal patterns. ", text: "Did symptoms change in proximity to a dose change? A spike 2–5 days after a reduction is almost certainly withdrawal." },
      { type: "p", bold: "Sleep architecture. ", text: "Wearable sleep data can reveal withdrawal effects patients don't consciously notice: increased light sleep, more night waking." },
      { type: "p", bold: "HRV. ", text: "Drops in heart rate variability can indicate physiological stress including withdrawal. Noisy at individual level but useful over weeks." },
      { type: "h3", text: "Interpretation" },
      { type: "p", text: "For Alex: \"about the same\" is excellent news 3 weeks post-reduction. If her data shows a brief spike that resolved and sleep has recovered, she's ready. If data shows persistent decline, hold longer." },
      { type: "pearl", text: "Do not let wearable data override patient experience. A patient who reports feeling terrible but has \"normal\" HRV is still feeling terrible. Objective data supplements subjective reports — it does not replace them." },
    ],
  },
  {
    id: "3-5",
    layer: 3,
    num: "3.5",
    title: "Layer 3 Assessment",
    duration: "15 min",
    isAssessment: true,
    content: [],
    questions: [
      {
        q: "A patient is on duloxetine 60mg, clonazepam 1mg, and mirtazapine 15mg. She's stable with no major stressors. What taper order?",
        opts: ["Clonazepam first (most dangerous)", "All three simultaneously", "Mirtazapine first, then duloxetine, then clonazepam last", "Duloxetine first (hardest to taper)"],
        answer: 2,
        explain: "Start simplest (mirtazapine), then antidepressant (duloxetine), then benzodiazepine (clonazepam) last. Benzo tapers take longest and carry greatest medical risk."
      },
      {
        q: "A patient completed a diazepam taper 6 months ago. She reports persistent anxiety, tinnitus, and cognitive fog. Two clinicians diagnosed relapse. What's the most important consideration?",
        opts: ["Restart diazepam", "These symptoms are consistent with protracted benzodiazepine withdrawal", "Start an SSRI", "Refer for cognitive testing"],
        answer: 1,
        explain: "Persistent anxiety with tinnitus and cognitive fog emerging during taper is classic protracted withdrawal. The symptom profile differs from her original condition."
      },
      {
        q: "A patient tracking symptoms reports feeling \"about the same\" 3 weeks post-reduction. Her data shows a brief spike that resolved, sleep has recovered, HRV is back to baseline. Recommendation?",
        opts: ["Hold another 4 weeks", "Proceed to next reduction — data shows successful adaptation", "Increase dose back", "Stop wearable monitoring"],
        answer: 1,
        explain: "A brief, self-limiting spike that resolves with recovery in objective markers indicates successful neuroadaptation. Proceeding is appropriate."
      },
    ],
  },
];

const LAYERS = [
  { num: 0, title: "Introduction", color: GRAY },
  { num: 1, title: "The Foundation", color: PURPLE },
  { num: 2, title: "The Protocols", color: TEAL },
  { num: 3, title: "The Hard Stuff", color: AMBER },
];

// ─── Quiz Component ───
function Quiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});

  const select = (qi, oi) => {
    if (revealed[qi] !== undefined) return;
    setAnswers(a => ({ ...a, [qi]: oi }));
  };

  const check = (qi) => {
    setRevealed(r => ({ ...r, [qi]: true }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {questions.map((q, qi) => (
        <div key={qi}>
          <p style={{ fontSize: 16, color: TEXT, lineHeight: 1.65, fontWeight: 500, margin: "0 0 14px" }}>
            <span style={{ color: PURPLE, fontWeight: 700 }}>{qi + 1}.</span> {q.q}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 4 }}>
            {q.opts.map((opt, oi) => {
              const selected = answers[qi] === oi;
              const isCorrect = oi === q.answer;
              const shown = revealed[qi];
              let bg = "transparent";
              let border = BORDER;
              if (shown && isCorrect) { bg = "#E8F5EB"; border = "#34A853"; }
              else if (shown && selected && !isCorrect) { bg = "#FDEAEA"; border = "#D64545"; }
              else if (selected) { bg = PURPLE_LIGHT; border = PURPLE; }

              return (
                <div key={oi} onClick={() => select(qi, oi)} style={{
                  padding: "12px 16px", borderRadius: 8, border: `1.5px solid ${border}`,
                  background: bg, cursor: shown ? "default" : "pointer", fontSize: 15,
                  color: TEXT, lineHeight: 1.5, transition: "all 0.15s",
                }}>
                  <span style={{ fontWeight: 600, color: MUTED, marginRight: 10 }}>{String.fromCharCode(65 + oi)}</span>
                  {opt}
                </div>
              );
            })}
          </div>
          {answers[qi] !== undefined && !revealed[qi] && (
            <button onClick={() => check(qi)} style={{
              marginTop: 12, padding: "8px 20px", borderRadius: 8, border: "none",
              background: PURPLE, color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>Check Answer</button>
          )}
          {revealed[qi] && (
            <div style={{
              marginTop: 12, padding: "14px 16px", borderRadius: 8, fontSize: 14,
              background: answers[qi] === q.answer ? "#E8F5EB" : "#FDEAEA",
              color: answers[qi] === q.answer ? "#1B6B30" : "#933",
              lineHeight: 1.6,
            }}>
              {q.explain}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Content Renderer ───
function ContentBlock({ block }) {
  if (block.type === "h3") return (
    <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: "32px 0 10px", fontFamily: "Georgia, 'Times New Roman', serif" }}>{block.text}</h3>
  );
  if (block.type === "p") return (
    <p style={{ fontSize: 16, color: TEXT, lineHeight: 1.75, margin: "0 0 14px" }}>
      {block.bold && <strong style={{ color: TEXT }}>{block.bold}</strong>}
      {block.text}
    </p>
  );
  if (block.type === "list") return (
    <ul style={{ margin: "0 0 14px", paddingLeft: 24 }}>
      {block.items.map((item, i) => (
        <li key={i} style={{ fontSize: 16, color: TEXT, lineHeight: 1.75, marginBottom: 6 }}>{item}</li>
      ))}
    </ul>
  );
  if (block.type === "scenario") return (
    <div style={{
      margin: "20px 0", padding: "20px 22px", borderRadius: 8,
      borderLeft: `3px solid ${PURPLE}`, background: PURPLE_BG,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: PURPLE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Patient Scenario — {block.title}</div>
      <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.7, margin: 0 }}>{block.text}</p>
    </div>
  );
  if (block.type === "pearl") return (
    <div style={{
      margin: "20px 0", padding: "18px 22px", borderRadius: 8,
      borderLeft: `3px solid ${TEAL}`, background: TEAL_BG,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Clinical Pearl</div>
      <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.7, margin: 0 }}>{block.text}</p>
    </div>
  );
  if (block.type === "warning") return (
    <div style={{
      margin: "20px 0", padding: "18px 22px", borderRadius: 8,
      borderLeft: `3px solid ${AMBER}`, background: AMBER_BG,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: AMBER, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Caution</div>
      <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.7, margin: 0 }}>{block.text}</p>
    </div>
  );
  if (block.type === "video") return (
    <div style={{ margin: "24px 0" }}>
      <div style={{
        background: "#1A1625", borderRadius: 10, overflow: "hidden",
        boxShadow: "0 2px 12px rgba(91,46,145,0.10)",
      }}>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          <iframe
            src={`https://www.youtube.com/embed/${block.videoId}?start=${block.start}${block.end ? `&end=${block.end}` : ""}&rel=0&modestbranding=1&color=white`}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      <div style={{ marginTop: 10, padding: "0 2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "#fff", textTransform: "uppercase",
            letterSpacing: "0.08em", background: PURPLE, padding: "3px 8px", borderRadius: 4,
          }}>Video</div>
          <span style={{ fontSize: 12, color: MUTED }}>{block.time}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>{block.title}</div>
        {block.desc && <div style={{ fontSize: 13, color: GRAY, lineHeight: 1.5, marginTop: 3 }}>{block.desc}</div>}
        <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{block.source}</div>
      </div>
    </div>
  );
  return null;
}

// ─── Main App ───
export default function TaperMedsEducation() {
  const [activeId, setActiveId] = useState('intro');
  const [viewportWidth, setViewportWidth] = useState(1280);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const active = MODULES.find(m => m.id === activeId);
  const currentIdx = MODULES.findIndex(m => m.id === activeId);
  const isSmallScreen = viewportWidth <= 1100;
  const isMobile = viewportWidth <= 768;

  const goTo = (id) => {
    setActiveId(id);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  // Group modules by layer
  const grouped = LAYERS.map(l => ({
    ...l,
    modules: MODULES.filter(m => m.layer === l.num),
  }));

  return (
      <div style={{
        height: '100%',
        minHeight: 0,
        padding: isSmallScreen ? 0 : '20px 24px 24px',
        background: 'linear-gradient(180deg,#faf9ff 0%,#f3f1fb 100%)',
      }}>
        <div style={{
          display: 'flex',
          height: '100%',
          minHeight: 0,
          maxWidth: isSmallScreen ? '100%' : 1380,
          margin: '0 auto',
          border: isSmallScreen ? 'none' : `1px solid ${BORDER}`,
          borderRadius: isSmallScreen ? 0 : 28,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: isSmallScreen ? 'none' : '0 24px 72px rgba(30,14,98,0.10)',
        }}>
        {/* ─── Sidebar ─── */}
        {!isSmallScreen && <aside style={{
          width: 290,
          minWidth: 290,
          borderRight: `1px solid ${BORDER}`,
          display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0,
          background: 'linear-gradient(180deg,#f7f5ff 0%,#f3f1fb 100%)',
        }}>
          {/* Logo */}
          <div style={{ padding: "20px 22px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, background: '#f5f2ff' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: PURPLE }}>TaperMeds</span>
              <span style={{ fontSize: 11, color: MUTED, marginLeft: 6, fontWeight: 500 }}>Education</span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "12px 10px" }}>
            {grouped.map((layer) => (
              <div key={layer.num} style={{ marginBottom: 8 }}>
                {layer.num > 0 && (
                  <div style={{
                    padding: "8px 12px", fontSize: 11, fontWeight: 700,
                    color: layer.color, textTransform: "uppercase", letterSpacing: "0.08em",
                    marginTop: layer.num === 1 ? 4 : 12,
                  }}>
                    Layer {layer.num} — {layer.title}
                  </div>
                )}
                {layer.modules.map((mod) => {
                  const isActive = activeId === mod.id;
                  return (
                    <button key={mod.id} onClick={() => goTo(mod.id)} style={{
                      width: "100%", textAlign: "left", padding: "8px 12px", fontSize: 13.5,
                      borderRadius: 10, border: "none", cursor: "pointer",
                      background: isActive ? PURPLE_LIGHT : "transparent",
                      color: isActive ? PURPLE : TEXT,
                      fontWeight: isActive ? 600 : 400,
                      lineHeight: 1.4, transition: "all 0.1s",
                      display: "flex", gap: 8,
                    }}>
                      {mod.num && <span style={{ color: MUTED, fontWeight: 500, minWidth: 26 }}>{mod.num}</span>}
                      <span>{mod.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>}

        {/* ─── Main Content ─── */}
        <main ref={contentRef} style={{ flex: 1, minHeight: 0, overflow: "auto", background: '#fcfbff' }}>
          {/* Top bar */}
          <div style={{
            position: "sticky", top: 0, zIndex: 10, background: 'rgba(247,247,247,0.96)',
            backdropFilter: "blur(8px)", borderBottom: `1px solid ${BORDER}`,
            padding: isMobile ? "12px 16px" : isSmallScreen ? "12px 20px" : "12px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: isSmallScreen ? "wrap" : "nowrap",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                TaperMeds Education Portal
              </span>
              <span style={{ fontSize: 13, color: MUTED }}>
                {active?.layer > 0 ? `Layer ${active.layer}` : ""}{active?.num ? ` / ${active.num}` : ""}
              </span>
            </div>
            {isSmallScreen && (
              <div style={{ flex: 1, minWidth: isMobile ? "100%" : 280, maxWidth: isMobile ? "100%" : 420 }}>
                <select
                  value={activeId}
                  onChange={(e) => goTo(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    background: "#fff",
                    color: TEXT,
                    fontSize: 14,
                    padding: "8px 10px",
                    fontFamily: "inherit",
                  }}
                >
                  {grouped.map((layer) => (
                    <optgroup
                      key={layer.num}
                      label={layer.num > 0 ? `Layer ${layer.num} - ${layer.title}` : "Introduction"}
                    >
                      {layer.modules.map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.num ? `${mod.num} ` : ""}{mod.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
            <span style={{ fontSize: 12, color: TEXT, fontWeight: 600, padding: "6px 10px", borderRadius: 999, background: PURPLE_LIGHT }}>
              {currentIdx + 1} / {MODULES.length}
            </span>
          </div>

          {/* Content */}
          <div style={{
            maxWidth: isSmallScreen ? "100%" : 860,
            width: "100%",
            margin: "0 auto",
            padding: isMobile ? "28px 16px 96px" : isSmallScreen ? "36px 24px 108px" : "48px 56px 120px",
          }}>
            {/* Module header */}
            {active?.num && (
              <div style={{ fontSize: 13, fontWeight: 600, color: LAYERS[active.layer]?.color || PURPLE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Module {active.num}
                {active.duration && <span style={{ color: MUTED, fontWeight: 400, marginLeft: 12 }}>{active.duration}</span>}
              </div>
            )}

            <h1 style={{
              fontFamily: 'var(--font-libre), Georgia, serif',
              fontSize: isMobile ? 28 : active?.id === "intro" ? 36 : 32, fontWeight: 700, color: TEXT,
              lineHeight: 1.25, margin: "0 0 28px",
            }}>
              {active?.title}
            </h1>

            {/* Objectives */}
            {active?.objectives && (
              <div style={{
                margin: "0 0 28px", padding: "18px 22px", borderRadius: 8,
                background: LIGHT, border: `1px solid ${BORDER}`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Learning Objectives</div>
                {active.objectives.map((obj, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 15, color: TEXT, lineHeight: 1.6 }}>
                    <span style={{ color: PURPLE, fontWeight: 600, marginTop: 1 }}>{i + 1}.</span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Content blocks */}
            {active?.content.map((block, i) => <ContentBlock key={i} block={block} />)}

            {/* Assessment */}
            {active?.isAssessment && active?.questions && (
              <Quiz questions={active.questions} />
            )}

            {/* Navigation */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginTop: 56, paddingTop: 24, borderTop: `1px solid ${BORDER}`,
              gap: 16,
              flexWrap: isMobile ? "wrap" : "nowrap",
            }}>
              {currentIdx > 0 ? (
                <button onClick={() => goTo(MODULES[currentIdx - 1].id)} style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: 14,
                  color: MUTED, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                  padding: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={MUTED}><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                  {MODULES[currentIdx - 1].title}
                </button>
              ) : <div />}
              {currentIdx < MODULES.length - 1 ? (
                <button onClick={() => goTo(MODULES[currentIdx + 1].id)} style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: 14,
                  color: PURPLE, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                  padding: 0,
                }}>
                  {MODULES[currentIdx + 1].title}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={PURPLE}><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </button>
              ) : <div />}
            </div>
          </div>
        </main>
      </div>
      </div>
  );
}
