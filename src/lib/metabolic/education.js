export const TIERS = [
  {
    id: 'beginner',
    label: 'Beginner',
    color: 'green',
    description: 'Foundational concepts — what metabolic health is and why it matters during tapering.',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    color: 'amber',
    description: 'The biology and practical application — how and when to use dietary interventions.',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    color: 'red',
    description: 'Research, expert frameworks, and building a personalised metabolic protocol.',
  },
];

export const MODULES = [

  // ─────────────────────────────────────────────
  //  BEGINNER
  // ─────────────────────────────────────────────

  {
    id: 'why-diet-tapering',
    tier: 'beginner',
    title: 'Why does what I eat matter when I\'m tapering?',
    duration: '7 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Understand why the tapering brain has unusually high energy and nutrient demands',
          'Identify the overlap between diet-driven symptoms and withdrawal symptoms',
          'State the most important rule: change one variable at a time',
        ],
      },
      {
        type: 'p',
        text: 'When you reduce or stop a psychiatric medication, your brain enters a period of profound recalibration. It has adapted to the drug — sometimes over months or years — and now must relearn how to function without it. Neurons that relied on artificially elevated serotonin, sedated GABA receptors, or suppressed dopamine reuptake suddenly have to manage their own neurochemistry again.',
      },
      {
        type: 'p',
        text: 'This process is metabolically expensive. Your brain accounts for 20% of your body\'s total energy output despite being only 2% of your body weight. During neuroadaptation, that energy demand increases further. The brain needs stable glucose or ketones to fuel the process, amino acids to build new neurotransmitters, and anti-inflammatory nutrients to protect against the oxidative stress that comes with rewiring.',
      },
      {
        type: 'h3',
        text: 'What this has to do with your diet',
      },
      {
        type: 'p',
        text: 'The fuel your brain uses during this process comes directly from what you eat. If your diet is high in refined sugar, processed carbohydrates, and seed oils, your brain is trying to heal while running on unstable, inflammatory fuel. This creates a cycle: poor fuel leads to blood sugar instability, which triggers cortisol and adrenaline surges, which worsen anxiety, brain fog, and mood — symptoms that look and feel exactly like withdrawal.',
      },
      {
        type: 'p',
        text: 'Many people tapering SSRIs, SNRIs, benzodiazepines, or antipsychotics find that their worst symptom days correlate with poor eating: skipped meals, high-sugar days, or afternoons without protein. This is not a coincidence. Diet does not cause withdrawal, but it dramatically shapes how intense it feels.',
      },
      {
        type: 'h3',
        text: 'The overlap problem',
      },
      {
        type: 'p',
        text: 'The cruel reality of tapering is that blood sugar crashes, poor sleep from bad food, inflammatory meals, and caffeine dysregulation all produce symptoms that are clinically indistinguishable from withdrawal: anxiety, irritability, fatigue, brain fog, headaches, and poor sleep. This makes it nearly impossible to know whether you\'re struggling because the cut was too fast, or because your diet is making withdrawal worse.',
      },
      {
        type: 'p',
        text: 'Stabilising your diet removes these confounding variables. Once your blood sugar is stable, your inflammation is lower, and your nutrient intake is adequate, the symptoms that remain are more clearly withdrawal-related — which means you can make better decisions about your taper rate.',
      },
      {
        type: 'pearl',
        title: 'Key insight',
        text: 'You cannot control how fast your brain readapts to life without medication. But you can control the quality of fuel you give it during that process. Stabilising your metabolism — even with small dietary changes — may meaningfully reduce the severity of withdrawal symptoms.',
      },
      {
        type: 'h3',
        text: 'The one-variable rule',
      },
      {
        type: 'p',
        text: 'The most critical principle in metabolic support during tapering is this: do not change your diet and your medication dose at the same time. If you start a new dietary approach at the same time as a dose cut, you will not know which change is responsible for any symptoms that follow — whether things improve or get worse.',
      },
      {
        type: 'warning',
        title: 'Important: the timing rule',
        text: 'Never begin a significant dietary change in the same week as a dose reduction. Make dietary changes during stable holding periods, give yourself 2-4 weeks to assess the effect, then return to your taper. One variable at a time is the only way to understand what is actually helping.',
      },
      {
        type: 'p',
        text: 'This applies to any dietary intervention — going low-carb, starting keto, adding supplements, beginning intermittent fasting. Each of these is a genuine metabolic shift that your body needs time to adjust to. Layering them on top of a dose change compounds the variables and makes it impossible to make rational decisions about your taper.',
      },
      {
        type: 'video',
        videoId: 'xjEFo3a1AnI',
        start: 438,
        end: 1243,
        title: 'Dr. Chris Palmer: Nutrition & Mental Health — why diet matters for the brain',
        desc: 'Palmer opens the discussion on how nutrition directly affects brain function, mental health, and psychiatric symptoms — the foundational case for why what you eat matters during a taper.',
        source: 'Huberman Lab — Ep. 99',
        time: '7:18 – 20:43',
      },
      {
        type: 'takeaways',
        items: [
          'The tapering brain has elevated energy and nutrient demands — diet directly affects how it performs during neuroadaptation',
          'Blood sugar crashes produce symptoms that are clinically identical to withdrawal and amplify genuine withdrawal',
          'Stabilising diet removes confounding variables and helps you make better taper decisions',
          'Never change diet and medication dose simultaneously — one variable at a time',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Chris Palmer MD — Brain Energy', url: 'https://brainenergybook.com' },
          { label: 'Georgia Ede MD — Diagnosis: Diet', url: 'https://diagnosisdiet.com' },
          { label: 'Metabolic Mind — About', url: 'https://metabolicmind.org/about' },
        ],
      },
    ],
  },

  {
    id: 'blood-sugar-withdrawal',
    tier: 'beginner',
    title: 'Blood sugar instability and withdrawal symptoms',
    duration: '8 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Understand the cortisol-blood sugar mechanism and why it worsens withdrawal',
          'Identify signs that blood sugar instability is contributing to your symptoms',
          'Implement at least three immediate stabilising changes',
        ],
      },
      {
        type: 'p',
        text: 'Blood sugar instability is probably the single most underappreciated aggravator of withdrawal symptoms. When you eat refined carbohydrates or sugar, your blood glucose rises rapidly. Your pancreas releases insulin to bring it back down — often overshooting, causing your blood sugar to drop below baseline. This crash triggers your adrenal glands to release cortisol and adrenaline to bring blood glucose back up.',
      },
      {
        type: 'p',
        text: 'Those stress hormones — cortisol and adrenaline — produce a very specific constellation of symptoms: heart pounding or racing, anxiety, shakiness, irritability, sweating, difficulty concentrating, and a feeling of dread or doom. Sound familiar? These are almost identical to the symptoms of SSRI or benzodiazepine withdrawal. The difference is that blood sugar-driven symptoms can be fixed in 20 minutes with a protein-rich snack. Genuine withdrawal cannot.',
      },
      {
        type: 'h3',
        text: 'Why tapering makes you more vulnerable',
      },
      {
        type: 'p',
        text: 'Many psychiatric medications affect appetite, glucose metabolism, and stress hormone regulation. When you taper, these regulatory mechanisms are in flux. Your cortisol response may already be dysregulated from the medication itself (particularly with benzodiazepines and SSRIs). This means blood sugar crashes hit harder and recover more slowly during tapering than they would in a healthy individual.',
      },
      {
        type: 'p',
        text: 'Additionally, withdrawal often reduces appetite, makes people feel nauseous, or creates food aversions — which leads to skipped meals and irregular eating patterns. This is exactly the wrong direction metabolically. Irregular eating is one of the most reliable ways to create blood sugar rollercoasters.',
      },
      {
        type: 'h3',
        text: 'Signs blood sugar is making withdrawal worse',
      },
      {
        type: 'list',
        items: [
          'Anxiety or heart pounding that spikes 1-3 hours after eating, especially after sweet or starchy meals',
          'Symptoms that are significantly worse in the afternoon (classic post-lunch blood sugar dip)',
          'Feeling better almost immediately after eating something, then worse again 1-2 hours later',
          'Intense cravings for sugar, bread, or carbs — especially during a withdrawal wave',
          'Withdrawal symptoms that are clearly worse on days you skipped a meal',
          'Brain fog that lifts noticeably after a protein-rich meal',
        ],
      },
      {
        type: 'h3',
        text: 'The five stabilising moves',
      },
      {
        type: 'p',
        text: 'These changes are listed in order of impact. Start with the first one and give it a week before adding the next. Do not try to implement all five simultaneously — especially not during an active dose reduction.',
      },
      {
        type: 'list',
        items: [
          'Eat protein at breakfast, every day. Eggs, Greek yoghurt, smoked salmon, cheese, or a protein shake. No cereal, toast, or fruit juice alone. This single change stabilises the first half of your day.',
          'Never skip meals. Even if you have no appetite, eat something with protein every 4-5 hours. Set an alarm if needed. Skipping meals during withdrawal is like removing one of your brakes.',
          'Stop drinking sweetened drinks. Soda, juice, sports drinks, and sweetened coffee all cause sharp blood sugar spikes. Switch to water, sparkling water, tea, or black coffee.',
          'Eat protein and fat with any carbohydrates you do eat. This slows glucose absorption and blunts the spike. A banana alone spikes blood sugar; a banana with almond butter does not.',
          'Have a protein-rich snack between lunch and dinner if you tend to get symptoms in the afternoon. Nuts, hard-boiled eggs, cheese, or Greek yoghurt work well.',
        ],
      },
      {
        type: 'pearl',
        title: 'Key insight',
        text: 'Eating protein at breakfast is the single highest-leverage dietary change most people tapering can make. It takes five minutes and has an outsize effect on the entire day\'s blood sugar stability, cortisol rhythm, and symptom severity.',
      },
      {
        type: 'warning',
        title: 'Do not skip meals during active dose reductions',
        text: 'When you are in the middle of a dose cut, your nervous system is already under stress. Adding blood sugar crashes on top of withdrawal significantly worsens both. If your appetite is poor during a cut, prioritise liquid protein (smoothies, bone broth with protein powder) over eating nothing.',
      },
      {
        type: 'h3',
        text: 'Tracking your patterns',
      },
      {
        type: 'p',
        text: 'If you keep a withdrawal journal, add a food column. Record what you ate and when, and note your worst symptom moments. Many people are surprised within two weeks to find clear patterns. This data is genuinely useful — it helps you distinguish blood sugar-driven symptoms from withdrawal-driven ones, and gives you concrete evidence of what dietary changes are helping.',
      },
      {
        type: 'video',
        videoId: 'xjEFo3a1AnI',
        start: 5109,
        end: 5514,
        title: 'Dr. Chris Palmer: Neurons, Mitochondria & Blood Glucose',
        desc: 'Palmer explains the relationship between neuronal energy use, mitochondrial function, and blood glucose regulation — why stable blood sugar is a prerequisite for healthy brain function, not just a comfort concern.',
        source: 'Huberman Lab — Ep. 99',
        time: '1:25:09 – 1:31:54',
      },
      {
        type: 'takeaways',
        items: [
          'Blood sugar crashes trigger cortisol and adrenaline, producing symptoms identical to withdrawal',
          'Tapering makes you more vulnerable to blood sugar instability due to dysregulated stress hormones',
          'The most impactful single change: eat protein at breakfast every day without exception',
          'Never skip meals during active dose reductions — use liquid protein if appetite is poor',
          'Track meals alongside symptoms to identify your personal patterns',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Diet Doctor — Blood sugar & mental health', url: 'https://dietdoctor.com/mental-health' },
          { label: 'Glucose Goddess — Glucose stabilisation principles', url: 'https://www.glucosegoddess.com' },
        ],
      },
    ],
  },

  {
    id: 'anti-inflammatory-basics',
    tier: 'beginner',
    title: 'The anti-inflammatory diet basics for withdrawal support',
    duration: '9 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Understand what neuroinflammation is and why withdrawal increases it',
          'Identify the most common pro-inflammatory foods to reduce',
          'Build a simple, sustainable anti-inflammatory eating pattern',
        ],
      },
      {
        type: 'p',
        text: 'Withdrawal from psychiatric medication is an inflammatory process. When the brain loses a drug it has adapted to, the resulting neurochemical disruption activates the immune system — specifically microglial cells, the brain\'s resident immune cells. These cells release inflammatory cytokines, which worsen exactly the symptoms people most struggle with during tapering: nerve pain, heightened sensitivity to sound and light, burning sensations, mood crashes, and the "wired but tired" feeling.',
      },
      {
        type: 'p',
        text: 'This is not speculation. Elevated inflammatory markers have been measured in people experiencing antidepressant and benzodiazepine withdrawal. The connection is real and significant. Diet is one of the most powerful drivers of systemic inflammation — and changing it is one of the few things within your control during tapering.',
      },
      {
        type: 'h3',
        text: 'What neuroinflammation feels like during withdrawal',
      },
      {
        type: 'list',
        items: [
          'Burning or electric-shock sensations (brain zaps, nerve pain)',
          'Heightened sensitivity to noise, light, or touch (hyperalgesia)',
          'Muscle aches and joint pain that are disproportionate to activity',
          'A "brain on fire" feeling — cognitive overactivation with exhaustion',
          'Skin crawling or tingling sensations (paresthesia)',
          'Mood instability that feels neurological rather than emotional',
        ],
      },
      {
        type: 'h3',
        text: 'The main inflammatory food drivers',
      },
      {
        type: 'p',
        text: 'Three categories of food drive the majority of dietary inflammation in a modern diet. Reducing these has the most impact for most people, and does not require a complete dietary overhaul.',
      },
      {
        type: 'list',
        title: 'Refined seed oils (the biggest one)',
        items: [
          'Canola oil, soybean oil, sunflower oil, corn oil, cottonseed oil, "vegetable oil"',
          'These oils are extremely high in omega-6 linoleic acid, which becomes pro-inflammatory arachidonic acid in the body',
          'They are found in almost all restaurant food, most packaged snacks, and most processed sauces',
          'Replacing them with olive oil, butter, coconut oil, or tallow is the highest-impact anti-inflammatory swap',
        ],
      },
      {
        type: 'list',
        title: 'Refined sugar and high-fructose corn syrup',
        items: [
          'Directly activates inflammatory pathways and promotes advanced glycation end products (AGEs)',
          'Found in bread, sauces, cereals, yoghurt, juice, and almost all processed food',
          'Reducing or eliminating sweetened drinks is the fastest way to reduce sugar-driven inflammation',
        ],
      },
      {
        type: 'list',
        title: 'Ultra-processed food generally',
        items: [
          'Packaged snacks, fast food, ready meals, deli meats with additives — these combine seed oils, sugar, and food additives simultaneously',
          'A useful heuristic: if it comes in a packet with more than five ingredients, it likely contains one or more inflammatory components',
        ],
      },
      {
        type: 'h3',
        text: 'The main anti-inflammatory additions',
      },
      {
        type: 'list',
        items: [
          'Fatty fish (salmon, sardines, mackerel, herring) 2-3 times per week — rich in EPA and DHA, the most potent dietary anti-inflammatory agents',
          'Extra-virgin olive oil — contains oleocanthal, which has anti-inflammatory effects similar to a low dose of ibuprofen',
          'Leafy greens (spinach, kale, rocket) — rich in magnesium and polyphenols',
          'Turmeric and ginger — both have measurable anti-inflammatory effects; easiest as a daily supplement or added to food',
          'Berries (blueberries, blackberries, raspberries) — high in anthocyanins which reduce neuroinflammation',
          'Omega-3 supplements (EPA/DHA) — if you do not eat fish, 2-3g EPA/DHA daily has strong evidence for reducing neuroinflammation',
        ],
      },
      {
        type: 'pearl',
        title: 'Key insight',
        text: 'Omega-3 supplementation (2-3g EPA/DHA daily, from fish oil or algae oil) has the strongest evidence of any dietary supplement for reducing neuroinflammation. If you do only one supplement during your taper, this is the one with the most consistent support in the research literature.',
      },
      {
        type: 'h3',
        text: 'Building a simple anti-inflammatory day',
      },
      {
        type: 'p',
        text: 'You do not need to be perfect. The goal during tapering is to meaningfully reduce your inflammatory load without adding stress to an already demanding process. A practical target: reduce seed oils as much as possible, add omega-3s, cut sweetened drinks, and eat whole food most of the time. That alone moves the needle significantly.',
      },
      {
        type: 'warning',
        title: 'What to expect during the transition',
        text: 'Cutting sugar and processed food can cause 3-5 days of increased fatigue, headaches, and cravings — particularly if your diet was high in refined carbohydrates. This is a normal adaptation, not a withdrawal reaction. Time any dietary transition to a stable holding period, not an active dose reduction.',
      },
      {
        type: 'video',
        videoId: 'nMiX9jC_IuA',
        start: 480,
        end: 1080,
        title: 'Georgia Ede MD: Neuroinflammation and the anti-inflammatory diet',
        desc: 'Ede explains how inflammation damages brain function, why the modern diet promotes neuroinflammation, and which dietary changes have the strongest anti-inflammatory evidence.',
        source: 'The Empowering Neurologist',
        time: '8:00 – 18:00',
      },
      {
        type: 'takeaways',
        items: [
          'Withdrawal is genuinely inflammatory — elevated cytokines make nerve pain, sensitivity, and mood worse',
          'Seed oils (canola, soybean, sunflower) are the biggest dietary inflammation driver — replace with olive oil, butter, or coconut oil',
          'Omega-3s (2-3g EPA/DHA daily) have the strongest evidence of any single anti-inflammatory supplement',
          'You do not need a perfect diet — meaningful reduction in seed oils, sugar, and ultra-processed food makes a real difference',
          'Time any dietary transition to a stable holding period, never an active dose reduction',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Georgia Ede — Diagnosis: Diet research', url: 'https://diagnosisdiet.com/research' },
          { label: 'Diet Doctor — Omega-3 guide', url: 'https://dietdoctor.com/nutrition/omega-3' },
          { label: 'Metabolic Mind — Research', url: 'https://metabolicmind.org/research' },
        ],
      },
    ],
  },

  {
    id: 'practical-nutrition-taper',
    tier: 'beginner',
    title: 'Practical nutrition during a taper — the foundational rules',
    duration: '10 min',
    content: [
      {
        type: 'objectives',
        items: [
          'State the six core nutritional rules for supporting a taper',
          'Plan a sample taper-supporting day of eating',
          'Understand what to track in your withdrawal journal',
        ],
      },
      {
        type: 'p',
        text: 'Metabolic health during tapering does not require an extreme diet, expensive supplements, or complicated protocols. The foundation is simple, consistent nutrition that keeps your blood sugar stable, gives your brain adequate fuel, and reduces the inflammatory load your nervous system is dealing with. The six rules below are ordered by impact — start from the top and work down.',
      },
      {
        type: 'h3',
        text: 'The six foundational rules',
      },
      {
        type: 'list',
        title: 'Rule 1: Protein at every meal (30g target)',
        items: [
          'Protein slows glucose absorption, provides amino acids for neurotransmitter synthesis, and supports tissue repair',
          'Target 30g of protein per meal — this is approximately 3 eggs, a palm-sized piece of chicken or fish, 200g Greek yoghurt, or a good protein shake',
          'Breakfast protein is most critical — it sets the tone for blood sugar stability for the entire morning',
        ],
      },
      {
        type: 'list',
        title: 'Rule 2: Eat regularly — never skip meals',
        items: [
          'Eat every 4-5 hours, even if your appetite is poor',
          'Irregular eating during tapering creates blood sugar rollercoasters that amplify every withdrawal symptom',
          'If you have no appetite: bone broth, a protein shake, or a small amount of cheese and nuts counts as "eating"',
        ],
      },
      {
        type: 'list',
        title: 'Rule 3: Prioritise whole food over processed food',
        items: [
          'If it has more than five ingredients, think twice about it',
          'This is not about perfection — it is about reducing seed oils, refined sugar, and additives that increase inflammation',
          'A simple heuristic: eat food your great-grandparents would recognise',
        ],
      },
      {
        type: 'list',
        title: 'Rule 4: Stay hydrated and maintain electrolytes',
        items: [
          'Dehydration worsens virtually every withdrawal symptom — headache, brain fog, fatigue, anxiety',
          'Aim for 2-3 litres of water daily; more if you are sweating or in a warm climate',
          'Many people are low in sodium, magnesium, and potassium during withdrawal — see the electrolytes module for detail',
        ],
      },
      {
        type: 'list',
        title: 'Rule 5: Do not restrict calories during active tapering',
        items: [
          'Your brain needs energy to drive neuroadaptation — caloric restriction during an active taper is counterproductive',
          'If you want to lose weight, do so during a stable holding period — never during an active dose reduction',
          'Eating enough is not optional during tapering; it is therapeutic',
        ],
      },
      {
        type: 'list',
        title: 'Rule 6: Track meals and symptoms together',
        items: [
          'Add a brief food note to your withdrawal journal each day',
          'Rate your worst symptom of the day (0-10) and note what you ate',
          'Review weekly — patterns almost always emerge within 2-3 weeks',
        ],
      },
      {
        type: 'h3',
        text: 'A sample taper-supporting day',
      },
      {
        type: 'p',
        text: 'This is not a prescription — it is an example of what the foundational rules look like in practice. Adjust for your own food preferences and any dietary restrictions.',
      },
      {
        type: 'list',
        title: 'Breakfast (within 1 hour of waking)',
        items: [
          '3 eggs scrambled in butter or olive oil',
          'Half an avocado',
          'Coffee or tea (no sugar)',
          'Optional: smoked salmon or a small portion of cheese',
        ],
      },
      {
        type: 'list',
        title: 'Lunch (4-5 hours after breakfast)',
        items: [
          'A palm-sized portion of protein (chicken, fish, beef, tofu)',
          'Leafy salad with olive oil and lemon',
          'Some complex carbohydrate if desired (rice, sweet potato, lentils) — not refined',
          'Water',
        ],
      },
      {
        type: 'list',
        title: 'Mid-afternoon snack (if needed)',
        items: [
          'A small handful of nuts (walnuts, almonds, macadamias)',
          'Or: cheese and cucumber',
          'Or: Greek yoghurt (full-fat, unsweetened)',
        ],
      },
      {
        type: 'list',
        title: 'Dinner (4-5 hours after lunch)',
        items: [
          'Same structure as lunch — protein first, vegetables, modest starch',
          'Salmon or fatty fish 2-3 times per week for omega-3s',
          'Cook with olive oil, butter, coconut oil — not seed oils',
        ],
      },
      {
        type: 'pearl',
        title: 'The 80/20 principle',
        text: 'You do not need to follow these rules perfectly. Eating this way 80% of the time is dramatically better than not at all, and is sustainable long-term. The goal is a consistent baseline — not perfection on hard withdrawal days when you can barely get out of bed.',
      },
      {
        type: 'h3',
        text: 'Foods to prioritise on bad days',
      },
      {
        type: 'p',
        text: 'When a wave hits and cooking feels impossible, these are the foods that are easiest to prepare and still nutritionally supportive: eggs (scrambled in 3 minutes), bone broth (warm, salty, comforting and full of electrolytes), full-fat Greek yoghurt, smoked salmon, tinned sardines or mackerel, cheese, and nuts. Keep these stocked at all times.',
      },
      {
        type: 'video',
        videoId: 'ws_AlyJNo2I',
        start: 300,
        end: 900,
        title: 'Georgia Ede: Practical nutrition for mental health — Change Your Diet, Change Your Mind',
        desc: 'Ede outlines her practical approach to nutrition for mental health conditions — what to eat, what to avoid, and how to structure a brain-supportive dietary pattern.',
        source: 'Metabolic Mind',
        time: '5:00 – 15:00',
      },
      {
        type: 'takeaways',
        items: [
          '30g protein per meal is the most impactful single rule — it stabilises blood sugar and supports neurotransmitter production',
          'Never skip meals during tapering, even if appetite is poor — liquid protein counts',
          'Do not restrict calories during active dose reductions — your brain needs fuel to neuroadapt',
          'Track meals alongside symptoms — patterns emerge within 2-3 weeks that inform better taper decisions',
          'Perfect is the enemy of good — consistent 80% compliance beats sporadic perfection',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Metabolic Mind — Nutrition during tapering', url: 'https://metabolicmind.org' },
          { label: 'Diet Doctor — Protein guide', url: 'https://dietdoctor.com/nutrition/protein' },
        ],
      },
    ],
  },

  {
    id: 'eat-when-terrible',
    tier: 'beginner',
    title: 'What to eat when you feel terrible — low-effort nourishment',
    duration: '7 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Identify easy, high-protein anti-inflammatory foods that require minimal preparation',
          'Build a personal "survival foods" list for bad withdrawal days',
          'Understand why eating matters even on days when you feel too ill to care',
        ],
      },
      {
        type: 'p',
        text: 'There will be withdrawal days when cooking is impossible. Days where getting out of bed takes everything you have, where the smell of food is nauseating, where your hands are shaking too much to prepare a proper meal. These are the exact days when what you eat matters most — and also the days when it is hardest to eat well.',
      },
      {
        type: 'p',
        text: 'This module is about building a kit of foods that require almost no preparation, are high in protein and anti-inflammatory nutrients, and can be consumed even on the worst days. The goal is not a great diet. The goal is not zero nutrition. The goal is: something, with protein, regularly.',
      },
      {
        type: 'h3',
        text: 'Why eating still matters on bad days',
      },
      {
        type: 'p',
        text: 'On a severe withdrawal day, your stress hormone system is already activated. Your cortisol and adrenaline are likely elevated. Skipping meals on these days causes blood sugar to drop, which triggers further cortisol release, which worsens exactly the anxiety, heart racing, and doom feeling you are already experiencing. Eating — even imperfectly — breaks this cycle.',
      },
      {
        type: 'p',
        text: 'Amino acids from protein are also the raw materials your brain uses to make neurotransmitters. Without adequate protein intake, neurotransmitter production is compromised — the opposite of what you need during neuroadaptation. Even a small amount of protein every few hours keeps the supply chain running.',
      },
      {
        type: 'h3',
        text: 'The survival food list',
      },
      {
        type: 'list',
        title: 'Zero preparation (open and eat)',
        items: [
          'Tinned sardines or mackerel — open the tin, eat with a fork. High omega-3, high protein, zero prep.',
          'Hard-boiled eggs (pre-prepared in a batch on a good day) — peel and eat',
          'Full-fat Greek yoghurt — scoop directly from pot',
          'Cheese — cut a chunk and eat',
          'Nut butter sachets — squeeze from packet',
          'Nuts (walnuts, almonds, macadamias) — handful from a bag',
        ],
      },
      {
        type: 'list',
        title: 'Under five minutes',
        items: [
          'Scrambled eggs in the microwave — 2 minutes',
          'Bone broth from a carton — heat in a mug in the microwave. Warm, salty, full of minerals.',
          'Protein shake — protein powder + milk or water + shake. Done.',
          'Smoothie — frozen berries, protein powder, nut butter, milk — blend',
          'Canned fish on rice cakes — no cooking required',
        ],
      },
      {
        type: 'list',
        title: 'Ten minutes or under',
        items: [
          'Eggs any style — fried, scrambled, or poached',
          'Smoked salmon with cucumber and cream cheese',
          'Tinned tuna with olive oil and lemon',
          'Cottage cheese with berries',
        ],
      },
      {
        type: 'h3',
        text: 'Stocking your taper pantry',
      },
      {
        type: 'p',
        text: 'On a good day, stock up so that bad days have options. These are the items to always have available during a taper:',
      },
      {
        type: 'list',
        items: [
          'Tinned fish (sardines, mackerel, tuna, salmon) — at least 6-10 tins',
          'Eggs — always',
          'Full-fat Greek yoghurt — at least 2-3 pots',
          'A block of hard cheese',
          'A bag of mixed nuts',
          'Frozen berries — for smoothies or microwaved with yoghurt',
          'Bone broth cartons or powder',
          'Protein powder (whey or plant-based) and milk or nut milk',
          'Nut butter (almond, peanut, or mixed)',
          'Dark chocolate (70%+) — for when you need something that feels like a treat',
        ],
      },
      {
        type: 'pearl',
        title: 'Key insight',
        text: 'Preparing on good days for bad days is one of the most practical things you can do for your taper. Batch-cooking hard-boiled eggs, stocking the pantry with tinned fish and nuts, and keeping protein powder on hand costs nothing extra and eliminates one source of stress during waves.',
      },
      {
        type: 'h3',
        text: 'When appetite is truly gone',
      },
      {
        type: 'p',
        text: 'Some people experience profound appetite loss during withdrawal — particularly during benzodiazepine tapers or after SSRI discontinuation. If you genuinely cannot eat solid food, prioritise liquids: bone broth, protein shakes, whole milk, smoothies. Liquid calories and protein are far better than nothing. Ginger tea can help with nausea. Salt on everything — your sodium may be depleted.',
      },
      {
        type: 'warning',
        title: 'If you are unable to eat for more than 2-3 days',
        text: 'Significant inability to eat during tapering can indicate that a dose reduction has been too large or too fast. If you cannot eat, cannot drink, or are losing significant weight, contact a healthcare provider. Nutritional support is a medical issue if it reaches this level.',
      },
      {
        type: 'video',
        videoId: 'ws_AlyJNo2I',
        start: 900,
        end: 1500,
        title: 'Georgia Ede: Eating well when you feel unwell — practical low-effort nutrition',
        desc: 'Ede discusses how to maintain nutritional quality during periods of illness or low capacity — focusing on the highest-impact, lowest-effort changes.',
        source: 'Metabolic Mind',
        time: '15:00 – 25:00',
      },
      {
        type: 'takeaways',
        items: [
          'Skipping meals on bad days worsens withdrawal by adding blood sugar crashes on top of existing symptoms',
          'Keep your pantry stocked with zero-prep protein: tinned fish, eggs, Greek yoghurt, cheese, nuts',
          'Bone broth is one of the best withdrawal foods — warm, calming, full of minerals and electrolytes',
          'When appetite fails, liquids count: bone broth, protein shakes, whole milk, smoothies',
          'Prepare on good days for bad days — batch-cook eggs, stock up on tinned fish',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Diet Doctor — Keto pantry staples', url: 'https://dietdoctor.com/low-carb/keto/pantry' },
          { label: 'Metabolic Mind — Practical nutrition', url: 'https://metabolicmind.org' },
        ],
      },
    ],
  },

  // ── Beginner Assessment ──
  {
    id: 'beginner-assessment',
    tier: 'beginner',
    title: '🧪 Beginner knowledge check',
    duration: null,
    isAssessment: true,
    content: [
      {
        type: 'p',
        text: 'Test your understanding of the foundational concepts. Select the best answer for each question — you will get immediate feedback.',
      },
      {
        type: 'question',
        text: 'A community member notices that their worst withdrawal symptoms consistently happen between 2pm and 4pm. They have been skipping lunch because of poor appetite. What is the most likely explanation?',
        options: [
          'Their medication dose is too high and needs to be adjusted upward',
          'Blood sugar is crashing in the afternoon, producing cortisol and adrenaline surges that amplify withdrawal',
          'This is a normal circadian withdrawal pattern and cannot be influenced by diet',
          'They need to sleep more to reduce afternoon cortisol',
        ],
        correct: 1,
        explanation: 'Skipping lunch causes blood sugar to drop in the early afternoon. The resulting cortisol and adrenaline release produces anxiety, heart racing, irritability, and brain fog — symptoms that are clinically identical to withdrawal and that amplify any genuine withdrawal that is present. Eating a protein-rich lunch every day, even without appetite, is the first thing to try.',
      },
      {
        type: 'question',
        text: 'You are planning to try an anti-inflammatory diet to support your benzo taper. When is the best time to start?',
        options: [
          'At the same time as your next dose reduction, so both changes happen together',
          'Only after you have completely finished your taper',
          'During a stable holding period — at least 2-4 weeks before or after any dose change',
          'During a withdrawal wave, to help reduce symptoms',
        ],
        correct: 2,
        explanation: 'The one-variable rule is fundamental: never change your diet and your medication dose at the same time. A holding period of 2-4 weeks allows you to assess the dietary change in isolation before resuming your taper. This is the only way to know whether a dietary change is helping or not.',
      },
      {
        type: 'question',
        text: 'Which of the following is the single most evidence-supported dietary supplement for reducing neuroinflammation during withdrawal?',
        options: [
          'Vitamin D3',
          'Magnesium glycinate',
          'Omega-3 fatty acids (EPA/DHA, 2-3g daily)',
          'Zinc',
        ],
        correct: 2,
        explanation: 'Omega-3 fatty acids — specifically EPA and DHA from fish oil or algae oil — have the strongest evidence base of any dietary supplement for reducing neuroinflammation. The evidence for omega-3s in depression, anxiety, and inflammatory conditions is substantial. A dose of 2-3g EPA/DHA daily is well-supported. The others (magnesium, vitamin D, zinc) are also worth considering, but omega-3s have the most consistent research support.',
      },
      {
        type: 'question',
        text: 'What is the primary role of protein during tapering?',
        options: [
          'Protein provides calories to prevent weight loss during tapering',
          'Protein slows blood sugar absorption, provides amino acids for neurotransmitter synthesis, and stabilises cortisol rhythm',
          'Protein reduces medication cravings and helps prevent relapse',
          'Protein is mainly important for physical recovery, not brain function',
        ],
        correct: 1,
        explanation: 'Protein plays multiple critical roles during tapering. It slows the absorption of any carbohydrates consumed, which prevents blood sugar spikes and crashes. It provides amino acids that are the direct precursors to neurotransmitters — including tryptophan (serotonin), tyrosine (dopamine), and glutamine (GABA). And adequate protein helps stabilise the cortisol response, reducing the stress hormone surges that worsen withdrawal. 30g per meal is the practical target.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  //  INTERMEDIATE
  // ─────────────────────────────────────────────

  {
    id: 'mitochondria-tapering',
    tier: 'intermediate',
    title: 'Mitochondria — why your brain needs clean energy to heal',
    duration: '11 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Understand the role of mitochondria in neuronal function and psychiatric health',
          'Explain why withdrawal places unusually high demands on mitochondrial function',
          'Identify four dietary interventions with evidence for supporting mitochondrial health',
        ],
      },
      {
        type: 'p',
        text: 'Every neuron in your brain is powered by mitochondria — organelles that take in fuel (glucose or ketones) and convert it into ATP, the energy currency your cells need to function. When mitochondria work well, neurons fire reliably, neurotransmitters are synthesised efficiently, and cellular waste is cleared promptly. When they do not work well, everything suffers.',
      },
      {
        type: 'p',
        text: 'Mitochondria are not just passive power plants. They are dynamic, responsive structures that communicate with the nucleus, regulate cell death, control calcium signalling, and produce key neuroactive molecules. Their health is central to brain function in ways that are still being discovered — but increasingly clear.',
      },
      {
        type: 'video',
        videoId: 'qV1bD_bGLnI',
        start: 0,
        end: 839,
        title: 'Metabolism, Mitochondria & Bipolar Disorder — Chris Palmer MD',
        desc: 'Dr. Chris Palmer\'s conference presentation explaining the biopsychosocial model, what mitochondria actually do, how mitochondrial dysfunction maps onto bipolar disorder phases, and the evidence for metabolic intervention in serious psychiatric illness.',
        source: 'Metabolic Mind',
        time: 'Full video · ~14 min',
      },
      {
        type: 'h3',
        text: 'Why this matters for tapering',
      },
      {
        type: 'p',
        text: 'When you taper psychiatric medication, you are asking your neurons to re-establish their own equilibrium without chemical assistance. This is metabolically expensive. New receptor protein synthesis must occur. Neurotransmitter production rates need to readjust. Synaptic pruning and formation happens. All of this requires enormous amounts of ATP — which means high mitochondrial demand at exactly the time when, as Dr. Chris Palmer\'s research suggests, psychiatric medication may have already compromised mitochondrial function.',
      },
      {
        type: 'p',
        text: 'Many psychiatric medications affect mitochondrial function as a primary or secondary mechanism. SSRIs affect mitochondrial membrane potential. Antipsychotics can inhibit mitochondrial complex I. Benzodiazepines affect GABA-A receptors that are present on mitochondria. When you taper these drugs, mitochondria need to readapt — and during that readaptation window, their function may be transiently impaired.',
      },
      {
        type: 'h3',
        text: 'Chris Palmer\'s mitochondrial dysfunction hypothesis',
      },
      {
        type: 'p',
        text: 'Harvard psychiatrist Dr. Chris Palmer has proposed that mitochondrial dysfunction is the common biological thread linking all major psychiatric disorders — not just a symptom, but a root cause. In his 2022 book "Brain Energy," he argues that when mitochondria fail to produce adequate ATP, neurons cannot maintain homeostasis, neurotransmitter systems dysregulate, and the result is the constellation of symptoms we label as psychiatric conditions.',
      },
      {
        type: 'p',
        text: 'If this theory is even partially correct, it has significant implications for tapering. It suggests that supporting mitochondrial function through diet — particularly through providing the brain with ketones as an alternative, more efficient fuel source — may directly support the brain\'s ability to function without medication. The clinical evidence includes case reports of patients with treatment-resistant psychiatric conditions achieving remission through the ketogenic diet, some of whom were then able to reduce or discontinue medication.',
      },
      {
        type: 'video',
        videoId: 'xjEFo3a1AnI',
        start: 3944,
        end: 4583,
        title: 'Dr. Chris Palmer: Mitochondrial Function & Mental Health',
        desc: 'The dedicated mitochondria chapter from Palmer\'s landmark Huberman Lab appearance — he explains precisely how mitochondrial dysfunction produces psychiatric symptoms and what diet can do to support mitochondrial recovery.',
        source: 'Huberman Lab — Ep. 99',
        time: '1:05:44 – 1:16:23',
      },
      {
        type: 'h3',
        text: 'What metabolic flexibility means for tapering',
      },
      {
        type: 'p',
        text: 'A healthy brain is metabolically flexible — it can efficiently use both glucose and ketones for fuel, switching between them as needed. During ketosis, the liver produces ketone bodies (primarily beta-hydroxybutyrate and acetoacetate) that cross the blood-brain barrier and are used preferentially by mitochondria. Ketones are a more efficient fuel than glucose — they produce more ATP per unit of oxygen consumed, and they produce less oxidative stress.',
      },
      {
        type: 'pearl',
        title: 'Key insight',
        text: 'Ketones are a more efficient mitochondrial fuel than glucose. The brain can run 60-70% on ketones even without full dietary ketosis. Shifting toward a lower-carbohydrate diet — even without going fully ketogenic — increases ketone availability for the brain and may reduce the energy deficit that manifests as brain fog, fatigue, and cognitive symptoms during withdrawal.',
      },
      {
        type: 'video',
        videoId: 'hCyvqRq5YmM',
        start: 1340,
        end: 1869,
        title: 'Dr. Chris Palmer: Mitochondrial Functions, Stress Response & Mental Health',
        desc: 'From Palmer\'s 2025 Huberman Lab appearance — how mitochondrial health connects to the stress response and why improving mitochondrial function is central to psychiatric recovery and medication tapering.',
        source: 'Huberman Lab — Ep. 222',
        time: '22:20 – 31:09',
      },
      {
        type: 'h3',
        text: 'Four dietary interventions that support mitochondrial function',
      },
      {
        type: 'list',
        items: [
          'Reduce refined carbohydrates and sugar — high glucose spikes create oxidative stress that damages mitochondria; lower-carb eating reduces this burden',
          'Increase healthy fats (olive oil, butter, fatty fish, nuts) — fats are direct substrates for mitochondrial energy production via beta-oxidation',
          'Adequate protein — mitochondrial proteins are constantly turned over; amino acids from protein are required for their synthesis and repair',
          'Consider CoQ10 supplementation (100-300mg daily) — CoQ10 is essential for the mitochondrial electron transport chain and is directly consumed in energy production; levels decline with age and with some medications',
        ],
      },
      {
        type: 'warning',
        title: 'Do not start a ketogenic diet during active dose reductions',
        text: 'The ketogenic diet is a significant metabolic intervention that requires an adaptation period of 2-4 weeks during which brain glucose is falling and ketone production is ramping up. This transition can cause temporary cognitive changes, fatigue, and mood fluctuations — the exact symptoms you are trying to distinguish from withdrawal. Keto should only be trialled during stable holding periods.',
      },
      {
        type: 'h3',
        text: 'Practical steps without going ketogenic',
      },
      {
        type: 'p',
        text: 'You do not need to be in full ketosis to support mitochondrial health. Moving from a high-carb diet to a moderate-carb, higher-fat, adequate-protein diet is a significant improvement. Replacing refined carbohydrates with vegetables, protein, and healthy fats — without counting anything — meaningfully shifts the metabolic environment your brain operates in.',
      },
      {
        type: 'takeaways',
        items: [
          'Mitochondria are the power plants of neurons — their health directly determines how well your brain can function during neuroadaptation',
          'Many psychiatric medications affect mitochondrial function; tapering may involve a period of transiently impaired mitochondrial output',
          'Ketones are a more efficient brain fuel than glucose and produce less oxidative stress — lower-carb eating increases ketone availability',
          'Four supports: reduce refined carbs, increase healthy fats, adequate protein, consider CoQ10',
          'Never start ketogenic diet during an active dose reduction — only during stable holding periods',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Chris Palmer — Brain Energy book', url: 'https://brainenergybook.com' },
          { label: 'Metabolic Mind — Research', url: 'https://metabolicmind.org/research' },
          { label: 'Diet Doctor — CoQ10 guide', url: 'https://dietdoctor.com' },
        ],
      },
    ],
  },

  {
    id: 'ketogenic-tapering',
    tier: 'intermediate',
    title: 'The ketogenic diet and psychiatric medication tapering',
    duration: '13 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Understand what ketosis is and how it differs from simply eating low-carb',
          'Evaluate the evidence for ketogenic diet in psychiatric conditions relevant to tapering',
          'Know the safe timing framework for trialling keto during a taper',
        ],
      },
      {
        type: 'p',
        text: 'The ketogenic diet is the most intensively studied dietary intervention in metabolic psychiatry, and it has the strongest evidence base of any dietary approach for supporting brain health. Understanding it is important for anyone tapering psychiatric medication — not because everyone should try it, but because the evidence helps explain why diet matters for brain function, and because it may be a genuine therapeutic option for some people.',
      },
      {
        type: 'h3',
        text: 'What ketosis actually is',
      },
      {
        type: 'p',
        text: 'Ketosis is a metabolic state in which your liver produces ketone bodies — primarily beta-hydroxybutyrate (BHB), acetoacetate, and acetone — from fat. This happens when carbohydrate intake is low enough that blood glucose falls and insulin drops, triggering fat mobilisation from adipose tissue and ketone production in the liver. The brain and other organs then use ketones as their primary fuel instead of glucose.',
      },
      {
        type: 'p',
        text: 'The ketogenic diet is not simply "low-carb." True ketosis typically requires keeping carbohydrate intake below 20-50g per day (compared to the 200-300g in a typical Western diet), with fat comprising 60-75% of calories and moderate protein (excessive protein can be converted to glucose through gluconeogenesis, preventing ketosis). A low-carb diet (50-150g carbs/day) is beneficial but typically does not produce sustained ketosis.',
      },
      {
        type: 'h3',
        text: 'The clinical evidence for keto in psychiatric conditions',
      },
      {
        type: 'p',
        text: 'The ketogenic diet was originally developed in the 1920s for epilepsy — and it works, reducing seizure frequency by more than 50% in roughly half of patients who try it. The neurological effects that suppress seizures — reduced neuronal excitability, enhanced GABA signalling, reduced glutamate activity, improved mitochondrial function, lower inflammation — overlap substantially with what is dysregulated in anxiety, depression, and withdrawal.',
      },
      {
        type: 'list',
        title: 'Areas with growing clinical evidence',
        items: [
          'Bipolar disorder: Multiple case reports and small trials showing significant mood stabilisation, including patients who were able to reduce or discontinue medication under supervision',
          'Major depression: Clinical trials showing ketogenic diet comparable to antidepressants in some measures of depression, particularly treatment-resistant cases',
          'Schizophrenia: Case reports from Chris Palmer and others of significant symptom improvement in otherwise treatment-resistant patients on ketogenic diet',
          'Anxiety: GABA enhancement and reduced glutamate may explain the anxiolytic effects reported by many people on ketogenic diets',
          'ADHD: Emerging evidence and many anecdotal reports of improved focus, reduced impulsivity',
        ],
      },
      {
        type: 'p',
        text: 'Importantly, most of these studies show that psychiatric benefits often take 4-8 weeks to manifest — and that they can persist even with modest departures from strict keto, suggesting that the metabolic adaptation itself (not just real-time ketone levels) drives the benefit.',
      },
      {
        type: 'h3',
        text: 'Why ketones may specifically help during withdrawal',
      },
      {
        type: 'p',
        text: 'Several mechanisms make ketosis specifically relevant during medication tapering:',
      },
      {
        type: 'list',
        items: [
          'Neuroinflammation reduction: BHB directly inhibits the NLRP3 inflammasome, a key driver of neuroinflammation. During withdrawal — which is itself inflammatory — this may provide meaningful relief',
          'GABAergic support: Ketosis enhances GABA production and GABA-A receptor sensitivity. This is particularly relevant for benzodiazepine tapers, where GABA receptor downregulation is the central withdrawal mechanism',
          'Glutamate modulation: Ketosis reduces excessive glutamate activity (excitotoxicity), which is a driver of the hypersensitivity and agitation common in withdrawal',
          'Mitochondrial efficiency: As discussed in the previous module, ketones are a more efficient brain fuel, providing more ATP per unit and less oxidative stress',
          'Blood sugar stability: By definition, a ketogenic diet eliminates the blood sugar spikes and crashes that amplify withdrawal symptoms',
        ],
      },
      {
        type: 'h3',
        text: 'The timing framework — when and how to trial keto',
      },
      {
        type: 'p',
        text: 'The most critical rule: never start a ketogenic diet during an active dose reduction. The keto adaptation period (2-4 weeks) involves temporary cognitive changes, fatigue, and sometimes mood fluctuations — "keto flu" — that are impossible to distinguish from withdrawal symptoms if they coincide with a dose cut.',
      },
      {
        type: 'list',
        title: 'Safe protocol for trialling keto during a taper',
        items: [
          'Choose a stable holding period — at least 4-6 weeks of no dose changes where you feel relatively stable',
          'Spend week 1-2 transitioning: gradually reduce carbohydrates from your normal level toward <50g/day. Do not go cold turkey.',
          'During keto adaptation (weeks 2-4): aggressively supplement electrolytes (sodium, potassium, magnesium) — this prevents the majority of keto flu symptoms',
          'Assess at weeks 4-6: How is your sleep, anxiety baseline, energy, and cognitive function? Track carefully.',
          'If beneficial: maintain keto through your next taper step. Resume dose reduction only once you are stably fat-adapted and feeling better, not during adaptation.',
          'If difficult: keto may not be the right approach for you at this stage of your taper. Low-carb without ketosis is a less demanding middle ground.',
        ],
      },
      {
        type: 'pearl',
        title: 'Key insight',
        text: 'The safest keto protocol during tapering is: trial during a 6-week hold, transition gradually, supplement electrolytes aggressively, and only resume dose reductions once you are stable and fat-adapted. Do not add keto and a dose cut at the same time.',
      },
      {
        type: 'h3',
        text: 'The keto flu — and how to avoid it',
      },
      {
        type: 'p',
        text: 'The "keto flu" refers to a cluster of symptoms that occur in the first 1-3 weeks of starting a ketogenic diet: headache, fatigue, brain fog, muscle cramps, irritability, and poor sleep. It is almost entirely caused by electrolyte depletion — particularly sodium, potassium, and magnesium — as the kidneys excrete excess water and electrolytes when insulin drops.',
      },
      {
        type: 'list',
        title: 'Preventing keto flu',
        items: [
          'Sodium: add salt liberally to food; drink salted water or broth daily (aim for 3-5g sodium/day)',
          'Magnesium: 300-400mg magnesium glycinate or citrate daily',
          'Potassium: eat avocados, leafy greens, salmon; or use a potassium supplement if needed',
          'Water: drink 2-3 litres minimum, more if exercising',
          'Transition gradually over 1-2 weeks rather than cold turkey',
        ],
      },
      {
        type: 'warning',
        title: 'Tell your prescriber',
        text: 'The ketogenic diet can alter the absorption, distribution, and metabolism of some psychiatric medications. It can also affect lithium levels significantly. If you take psychiatric medications, inform your prescriber before starting a ketogenic diet. Some medications may need dose adjustments.',
      },
      {
        type: 'h3',
        text: 'Coming off keto',
      },
      {
        type: 'p',
        text: 'If you decide to stop the ketogenic diet, transition out gradually — over 2-4 weeks — rather than returning to a high-carb diet abruptly. Sudden reintroduction of large amounts of carbohydrate can cause significant blood sugar instability and, for some people, a temporary worsening of mood and energy. Transition by slowly increasing complex carbohydrates (vegetables, legumes, rice) over several weeks.',
      },
      {
        type: 'video',
        videoId: 'hCyvqRq5YmM',
        start: 4754,
        end: 5406,
        title: 'Dr. Chris Palmer: Ketogenic Diet for Epilepsy, Schizophrenia & Bipolar — The Clinical Evidence',
        desc: 'Palmer reviews the clinical evidence for ketogenic therapy across psychiatric conditions — from its established role in epilepsy to emerging trials in schizophrenia and bipolar disorder — and why the metabolic mechanism applies to psychiatric treatment broadly.',
        source: 'Huberman Lab — Ep. 222',
        time: '1:19:14 – 1:30:06',
      },
      {
        type: 'takeaways',
        items: [
          'True ketosis requires <20-50g carbs/day, not just "low-carb" — it is a distinct metabolic state',
          'The strongest evidence for keto in psychiatry comes from bipolar disorder, depression, and schizophrenia',
          'Keto may help withdrawal specifically via: neuroinflammation reduction, GABAergic support, glutamate modulation, and blood sugar stability',
          'Safe timing: trial only during stable 6-week holds, never during active dose reductions',
          'Prevent keto flu with aggressive electrolyte supplementation — most keto adaptation symptoms are electrolyte depletion',
          'Inform your prescriber — keto affects medication metabolism',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Metabolic Mind — Ketogenic diet & mental health', url: 'https://metabolicmind.org/research' },
          { label: 'Diet Doctor — Ketogenic diet guide', url: 'https://dietdoctor.com/low-carb/keto' },
          { label: 'PubMed — Ketogenic diet psychiatry', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=ketogenic+diet+psychiatry' },
        ],
      },
    ],
  },

  {
    id: 'fasting-carb-safety',
    tier: 'intermediate',
    title: 'Fasting, carb cycling, and tapering — safety and timing',
    duration: '10 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Distinguish between safe and potentially risky fasting approaches during a taper',
          'Understand the mechanism of intermittent fasting and its potential benefits',
          'Apply clear timing rules to any dietary experiment during tapering',
        ],
      },
      {
        type: 'p',
        text: 'Fasting — particularly intermittent fasting (IF) — has become one of the most widely discussed dietary interventions for brain health. The research on IF\'s effects on neuroinflammation, brain-derived neurotrophic factor (BDNF), autophagy, and mitochondrial health is genuinely interesting. But fasting during psychiatric medication tapering requires careful thought — the potential benefits are real, but so are the risks if timed badly.',
      },
      {
        type: 'h3',
        text: 'Types of fasting — not all are equal',
      },
      {
        type: 'list',
        items: [
          'Overnight fast (12-14 hours, e.g., 7pm to 7-9am): The gentlest form. This is what most humans did historically and still do if they do not eat at night. Has meaningful benefits with minimal risk.',
          'Intermittent fasting 16:8 (16-hour fast, 8-hour eating window): More deliberate, requires skipping breakfast or ending eating at 4-5pm. Moderate intensity — viable for many people during stable taper phases.',
          'Extended fasting (24+ hours): Significantly more demanding. Involves sustained periods of low blood glucose, elevated cortisol, and acute stress hormone activation. Not recommended during active tapering.',
          '5:2 (two very low-calorie days per week): A middle ground — two days at 500-600 calories. Can be appropriate during stable phases but adds metabolic stress that is hard to separate from withdrawal.',
        ],
      },
      {
        type: 'h3',
        text: 'Why extended fasting is risky during active tapering',
      },
      {
        type: 'p',
        text: 'Extended fasting triggers a significant stress hormone response. Cortisol rises to mobilise glucose stores. Adrenaline increases to stimulate gluconeogenesis. For a nervous system that is already under the stress of medication withdrawal — already producing excess cortisol, already sensitised to noradrenaline — this additional stress hormone load can be destabilising.',
      },
      {
        type: 'p',
        text: 'Extended fasting can also exacerbate electrolyte depletion (particularly dangerous during withdrawal), worsen sleep quality, and in some people temporarily worsen psychiatric symptoms through the activation of stress pathways. The benefits of extended fasting — autophagy, deep metabolic reset — are not worth these risks during active withdrawal.',
      },
      {
        type: 'warning',
        title: 'Extended fasting (>24 hours) is not recommended during active tapering',
        text: 'During active dose reductions, your nervous system is already under significant stress. Adding the metabolic stress of extended fasting — which activates cortisol and adrenaline — compounds the load in ways that can make withdrawal much more difficult. Save extended fasting for after your taper is complete.',
      },
      {
        type: 'h3',
        text: 'Intermittent fasting — the mechanism',
      },
      {
        type: 'p',
        text: 'Intermittent fasting works through several overlapping mechanisms that are relevant to brain health:',
      },
      {
        type: 'list',
        items: [
          'BDNF (brain-derived neurotrophic factor) increase: Fasting increases BDNF, which promotes neuroplasticity, neurogenesis, and synaptic function — all of which support the neuroadaptation required during tapering',
          'Autophagy: Extended fasting (and to a lesser extent IF) activates autophagy — the cellular self-cleaning process that removes damaged proteins and organelles, including damaged mitochondria',
          'Insulin sensitivity improvement: Lower insulin during fasting windows improves insulin signalling, which benefits mitochondrial function and reduces neuroinflammation',
          'Mild ketosis: Even a 16-hour fast can produce modest ketone levels (0.3-0.8 mmol/L), providing some ketone benefit to the brain without full dietary ketosis',
        ],
      },
      {
        type: 'pearl',
        title: 'Key insight',
        text: 'A 13-14 hour overnight fast (7pm to 8-9am) is the minimum-risk entry point for fasting during tapering. It has meaningful benefits — mild ketone production, improved insulin sensitivity, a modest BDNF boost — with almost no risk of cortisol-driven destabilisation. Most people already fast roughly this long without trying.',
      },
      {
        type: 'h3',
        text: 'Carb cycling — what it is and whether it makes sense during tapering',
      },
      {
        type: 'p',
        text: 'Carb cycling involves alternating between low-carb and higher-carb days — for example, eating very low carb on four days of the week and eating moderate carbs on three days. It is used by athletes to combine the metabolic benefits of ketosis with adequate carbohydrate for performance.',
      },
      {
        type: 'p',
        text: 'During tapering, carb cycling is generally not recommended. The transitions in and out of mild ketosis every few days prevent full fat-adaptation and can cause more blood sugar variability than a consistent approach. If you want to eat lower-carb to support brain health, a consistent low-carb or ketogenic approach is cleaner and easier to evaluate than cycling.',
      },
      {
        type: 'h3',
        text: 'Red lines — when to stop any dietary experiment',
      },
      {
        type: 'list',
        items: [
          'If you start any dietary experiment and your withdrawal symptoms significantly worsen within the first 3-5 days: stop the experiment. Go back to what you were eating before.',
          'If you are losing more than 1-2 lbs per week on any dietary change during an active taper: add calories. You need adequate energy for neuroadaptation.',
          'If you are unable to eat enough to sustain energy during a fast: break the fast. Eating enough is always more important than fasting.',
          'If you are experiencing significant blood sugar symptoms (shakiness, heart pounding, dizziness) during a fasting window: eat immediately. This is a signal your body is not handling the fast well at this time.',
        ],
      },
      {
        type: 'video',
        videoId: 'hCyvqRq5YmM',
        start: 4972,
        end: 5920,
        title: 'Dr. Chris Palmer: Fasting, Ketogenic Diet & Mitochondria — Safety and Timing',
        desc: 'Palmer covers intermittent fasting, the ketogenic diet, and when each is appropriate — including timing rules, who should avoid extended fasting, and how to use dietary tools safely during psychiatric medication changes.',
        source: 'Huberman Lab — Ep. 222',
        time: '1:22:52 – 1:38:40',
      },
      {
        type: 'takeaways',
        items: [
          'A 13-14 hour overnight fast is safe and beneficial during tapering — most people can do this without any deliberate effort',
          'IF 16:8 may be appropriate during stable holding periods for some people — assess carefully',
          'Extended fasting (>24 hours) is not recommended during active dose reductions — it adds cortisol and adrenaline load',
          'Carb cycling is generally not worth the complexity during tapering — a consistent approach is easier to evaluate',
          'If any dietary experiment worsens withdrawal symptoms, stop immediately and return to baseline',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Diet Doctor — Intermittent fasting guide', url: 'https://dietdoctor.com/intermittent-fasting' },
          { label: 'Metabolic Mind — Research', url: 'https://metabolicmind.org/research' },
        ],
      },
    ],
  },

  {
    id: 'electrolytes-withdrawal',
    tier: 'intermediate',
    title: 'Electrolytes and hydration — the overlooked withdrawal factor',
    duration: '8 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Understand why electrolyte balance is disrupted during withdrawal',
          'Identify the specific roles of sodium, magnesium, and potassium in nervous system function',
          'Build a practical daily electrolyte protocol',
        ],
      },
      {
        type: 'p',
        text: 'Electrolytes are minerals that carry electrical charges and are essential for virtually every process in the nervous system: neuron firing, neurotransmitter release, cellular fluid balance, heart rhythm, and muscle function. They are the medium through which your neurons communicate — and during withdrawal, the regulation of these minerals is disrupted in ways that directly worsen symptoms.',
      },
      {
        type: 'p',
        text: 'Despite this, electrolytes are almost never discussed in conventional guidance about medication tapering. Many people going through difficult withdrawals are significantly depleted in sodium, magnesium, or potassium without knowing it — because the symptoms of depletion (heart palpitations, anxiety, muscle cramps, insomnia, irritability) look exactly like withdrawal.',
      },
      {
        type: 'h3',
        text: 'Why withdrawal disrupts electrolyte balance',
      },
      {
        type: 'list',
        items: [
          'Many psychiatric medications affect the renin-angiotensin-aldosterone system (RAAS), which regulates sodium and potassium balance. Tapering disrupts this regulation.',
          'Cortisol dysregulation during withdrawal affects aldosterone and therefore sodium reabsorption — many people become relatively sodium-depleted',
          'Sweating from withdrawal anxiety and hot flushes depletes sodium and magnesium',
          'Reduced appetite means less dietary intake of all electrolytes',
          'Some people hyper-hydrate with plain water during withdrawal, which dilutes sodium (hyponatraemia)',
          'SSRIs specifically have been associated with SIADH (syndrome of inappropriate antidiuretic hormone secretion), which affects sodium levels — tapering reverses this but the readjustment takes time',
        ],
      },
      {
        type: 'h3',
        text: 'Sodium — the most underappreciated withdrawal mineral',
      },
      {
        type: 'p',
        text: 'Sodium is the primary electrolyte in extracellular fluid and is essential for neuron action potentials — the electrical signals that are the basis of all brain function. Low sodium causes cellular swelling, reduces neuronal excitability, and produces symptoms including: headache, brain fog, anxiety, fatigue, muscle weakness, and in severe cases, nausea and confusion.',
      },
      {
        type: 'p',
        text: 'Many people on low-carb or ketogenic diets become sodium-depleted, because lower insulin causes the kidneys to excrete more sodium. Combined with the dysregulation of withdrawal, this can produce significant hyponatraemia-like symptoms. The fix is simple: add more salt to your food, drink salted water or broth, and avoid drinking excessive plain water.',
      },
      {
        type: 'h3',
        text: 'Magnesium — the anxiety mineral',
      },
      {
        type: 'p',
        text: 'Magnesium is involved in over 300 enzymatic reactions in the body, including GABA receptor function, NMDA receptor regulation, and cortisol metabolism. It acts as a natural calcium channel blocker — excessive calcium influx into neurons (as can happen during withdrawal from GABA-active drugs) is partially modulated by adequate magnesium.',
      },
      {
        type: 'p',
        text: 'Magnesium deficiency is common in modern diets (estimates suggest 50-70% of the population is below adequate intake) and is significantly worsened by stress, sweating, and reduced appetite. The symptoms of magnesium deficiency — anxiety, muscle cramps, heart palpitations, insomnia, irritability, and light sensitivity — overlap extensively with both benzodiazepine and SSRI withdrawal.',
      },
      {
        type: 'pearl',
        title: 'Key insight',
        text: 'Magnesium glycinate (200-400mg at night) is one of the most widely reported non-pharmaceutical interventions for improving sleep and reducing anxiety during withdrawal. The glycinate form is highly bioavailable and gentler on the digestive system than magnesium oxide or citrate. This is the magnesium supplement form to use.',
      },
      {
        type: 'h3',
        text: 'Potassium — nervous system and cardiovascular function',
      },
      {
        type: 'p',
        text: 'Potassium is the primary intracellular electrolyte and is essential for maintaining the resting membrane potential of neurons. It works closely with sodium to create the electrochemical gradient that allows neurons to fire. Low potassium causes muscle weakness, fatigue, constipation, heart rhythm abnormalities, and in the context of withdrawal, can worsen anxiety and exacerbate the cardiovascular symptoms (palpitations, irregular heartbeat) that many people experience.',
      },
      {
        type: 'h3',
        text: 'Building a daily electrolyte protocol',
      },
      {
        type: 'list',
        title: 'Sodium (aim for 3-4g sodium per day)',
        items: [
          'Salt your food generously — this is not the time for a low-sodium diet',
          'Drink bone broth or salted broth daily if you can tolerate it',
          'If on low-carb or ketogenic diet: actively supplement sodium — add 1/4 tsp salt to water with meals',
          'Electrolyte drinks or powders that contain sodium (not just sugar) can help on symptomatic days',
        ],
      },
      {
        type: 'list',
        title: 'Magnesium (200-400mg magnesium glycinate daily)',
        items: [
          'Take at night — magnesium has a mild sedative effect that is beneficial for withdrawal-related insomnia',
          'Start with 200mg and increase slowly — too much too fast can cause loose stools',
          'Food sources: pumpkin seeds, leafy greens, dark chocolate, nuts, fish',
        ],
      },
      {
        type: 'list',
        title: 'Potassium (aim for 3,500-4,700mg daily from food)',
        items: [
          'Best food sources: avocados (975mg each), leafy greens, salmon, white beans, sweet potato',
          'Potassium supplements require care — do not take more than 99mg/dose without medical guidance',
          'Coconut water is a natural potassium-rich drink without the sugar of most sports drinks',
        ],
      },
      {
        type: 'warning',
        title: 'Electrolyte supplementation and medications',
        text: 'If you take lithium, ACE inhibitors, or potassium-sparing diuretics, electrolyte supplementation needs to be discussed with your prescriber. These medications affect electrolyte balance and supplementation can alter their effects or safety. Always check first.',
      },
      {
        type: 'video',
        videoId: 'Hja4VURshKA',
        start: 643,
        end: 951,
        title: 'Dealing with Keto Flu — Electrolytes & Adaptation in Metabolic Recovery',
        desc: 'Dr. Chris Palmer, Dr. Georgia Ede, and ketogenic dietitian Beth Zupec-Kania explain the electrolyte and adaptation challenges when shifting to a lower-carb or ketogenic diet — and how to manage them safely during psychiatric recovery.',
        source: 'Metabolic Mind',
        time: '10:43 – 15:51',
      },
      {
        type: 'takeaways',
        items: [
          'Electrolyte depletion during withdrawal produces symptoms (palpitations, anxiety, insomnia, muscle cramps) that are clinically indistinguishable from withdrawal itself',
          'Sodium, magnesium, and potassium are the most commonly depleted during tapering',
          'Magnesium glycinate 200-400mg at night is the most widely reported electrolyte intervention for withdrawal sleep and anxiety',
          'Salt food generously and drink bone broth — many people are paradoxically low-sodium during tapering',
          'Check with prescriber before electrolyte supplementation if you take lithium or diuretics',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Diet Doctor — Electrolytes on keto', url: 'https://dietdoctor.com/low-carb/keto/electrolytes' },
          { label: 'Magnesium in clinical practice — review', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=magnesium+anxiety+review' },
        ],
      },
    ],
  },

  {
    id: 'medication-metabolism',
    tier: 'intermediate',
    title: 'How your medications changed your metabolism — and what tapering reverses',
    duration: '11 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Identify the metabolic effects of major psychiatric drug classes (SSRIs, antipsychotics, benzodiazepines)',
          'Understand how the metabolic transition during tapering manifests in symptoms and body changes',
          'Apply nutritional strategies to support the metabolic readjustment',
        ],
      },
      {
        type: 'p',
        text: 'Most discussions of psychiatric medication tapering focus on neurological withdrawal — receptor upregulation, neurotransmitter rebound, neuroadaptation. Far less discussed are the metabolic effects of long-term psychiatric medication use — and how the reversal of those effects during tapering creates its own set of challenges that are partly nutritional in nature.',
      },
      {
        type: 'p',
        text: 'Many psychiatric medications have significant metabolic side effects: weight gain, insulin resistance, changes in appetite, altered cortisol rhythms, and mitochondrial effects. When you taper, your body attempts to reverse these changes — but the reversal is not smooth or linear, and the transition period can involve metabolic symptoms that are distinct from (but overlapping with) neurological withdrawal.',
      },
      {
        type: 'h3',
        text: 'SSRIs — appetite, weight, and serotonin metabolism',
      },
      {
        type: 'p',
        text: 'SSRIs increase synaptic serotonin by blocking its reuptake. Serotonin has extensive effects outside the brain — approximately 90% of the body\'s serotonin is produced in the gut and affects gastrointestinal function, appetite regulation, and metabolic rate. Long-term SSRI use can alter gut serotonin signalling in ways that affect appetite, digestion, and metabolism.',
      },
      {
        type: 'list',
        title: 'Common metabolic effects of SSRIs and their reversal during tapering',
        items: [
          'Weight gain (particularly paroxetine): Some SSRIs, especially paroxetine and mirtazapine, cause significant weight gain through appetite stimulation and metabolic rate reduction. During tapering, appetite typically normalises — but this takes weeks to months, not days.',
          'Carbohydrate cravings: SSRIs can increase carbohydrate cravings (especially sweet foods) via serotonin-dopamine interactions. These cravings may intensify during withdrawal before resolving.',
          'GI changes: SSRIs affect gut motility through peripheral serotonin effects. Tapering often causes GI symptoms — nausea, diarrhoea, or constipation — as gut serotonin signalling readjusts.',
          'Sexual function and appetite changes: Both are mediated partly through serotonin and both tend to reverse during tapering, but on their own timeline.',
        ],
      },
      {
        type: 'h3',
        text: 'Antipsychotics — insulin resistance and weight gain',
      },
      {
        type: 'p',
        text: 'Second-generation antipsychotics (olanzapine, quetiapine, clozapine, risperidone) are among the most metabolically disruptive medications in psychiatry. They cause weight gain through multiple mechanisms: histamine H1 blockade (increases appetite), muscarinic receptor effects, and direct interference with insulin signalling. Olanzapine and clozapine are associated with weight gains of 10-40kg in some patients and significantly increased rates of type 2 diabetes.',
      },
      {
        type: 'p',
        text: 'When tapering antipsychotics, insulin sensitivity tends to improve. This is a metabolic benefit — but the improvement in insulin signalling during tapering can cause temporary blood sugar instability as the body recalibrates. Some people experience hypoglycaemia-like symptoms (shakiness, sweating, hunger) as insulin sensitivity improves faster than glucose regulation adapts.',
      },
      {
        type: 'h3',
        text: 'Benzodiazepines — cortisol, HPA axis, and stress metabolism',
      },
      {
        type: 'p',
        text: 'Benzodiazepines work by enhancing GABAergic inhibition, which has widespread effects including on the hypothalamic-pituitary-adrenal (HPA) axis — the stress hormone system. Long-term benzo use suppresses cortisol reactivity. When you taper, the HPA axis gradually reactivates — but it often overshoots, producing a period of heightened cortisol reactivity and stress hormone dysregulation that can last months.',
      },
      {
        type: 'p',
        text: 'This HPA axis reactivation has significant metabolic consequences: elevated cortisol promotes insulin resistance, increases appetite (particularly for carbohydrates and calorie-dense food), disrupts sleep, and impairs immune function. This is why benzo withdrawal is particularly associated with metabolic instability, blood sugar dysregulation, and intense carbohydrate cravings.',
      },
      {
        type: 'h3',
        text: 'The metabolic transition: what to expect during tapering',
      },
      {
        type: 'list',
        items: [
          'Appetite changes (up or down): Expect appetite to be unpredictable during active dose reductions. It often normalises 4-8 weeks after a stable dose.',
          'Weight fluctuations: Water retention and release are common during tapering (particularly with antipsychotics). Do not react to short-term weight changes during a taper.',
          'Blood sugar instability: More common during benzo and antipsychotic tapers than SSRI tapers. Protein at every meal is especially important.',
          'Energy and fatigue: Metabolic readjustment takes energy. Many people experience fatigue during the early phase of a taper that is partly metabolic, not just neurological.',
          'Carbohydrate cravings: Often intense during withdrawal, driven by cortisol and serotonin changes. Understand this is physiological, not character weakness.',
        ],
      },
      {
        type: 'h3',
        text: 'Supporting the metabolic transition',
      },
      {
        type: 'list',
        items: [
          'Protein priority: 30g per meal — this stabilises blood sugar during the HPA axis reactivation period and provides amino acids for neurotransmitter synthesis',
          'Avoid refined sugar and refined carbohydrates — they worsen the blood sugar instability that cortisol dysregulation produces',
          'Do not restrict calories — even if you gained weight on medication, the taper is not the time to diet. Address weight after tapering is complete.',
          'Electrolytes, particularly magnesium and sodium — both are important for HPA axis function and cortisol metabolism',
          'Omega-3 fatty acids — reduce the neuroinflammation associated with cortisol dysregulation',
          'Track your food and symptoms together — this helps you distinguish medication-specific metabolic effects from general withdrawal',
        ],
      },
      {
        type: 'warning',
        title: 'Weight changes during tapering — context matters',
        text: 'Do not attempt caloric restriction during active tapering. Your brain requires adequate energy for neuroadaptation. If you gained weight on a medication and are concerned, address this during stable holding periods — not during dose reductions. Attempting to lose weight during an active taper significantly worsens withdrawal severity in many people.',
      },
      {
        type: 'video',
        videoId: 'nMiX9jC_IuA',
        start: 1080,
        end: 1680,
        title: 'Georgia Ede MD: How Psychiatric Medications Affect Metabolism — and What Reversal Looks Like',
        desc: 'Ede covers the metabolic side effects of antidepressants, antipsychotics, and benzodiazepines, and what the metabolic transition during tapering actually involves.',
        source: 'The Empowering Neurologist — David Perlmutter MD',
        time: '18:00 – 28:00',
      },
      {
        type: 'video',
        videoId: 'Ks70lCqRC9k',
        start: 0,
        end: 900,
        title: 'Dr. Mark Horowitz: Safe Tapering Practices for Antidepressants',
        desc: 'Dr. Mark Horowitz — lead author of the Maudsley Deprescribing Guidelines and the world\'s leading expert on psychiatric medication tapering — explains hyperbolic tapering, how to distinguish withdrawal from relapse, the role of metabolic support during deprescribing, and his personal experience coming off antidepressants.',
        source: 'Metabolic Mind',
        time: '0:00 – 15:00',
      },
      {
        type: 'takeaways',
        items: [
          'Psychiatric medications have significant metabolic side effects beyond their neurological effects — tapering reverses these, but the reversal is not smooth',
          'SSRIs affect gut serotonin, appetite, and carbohydrate cravings; antipsychotics cause insulin resistance and weight gain; benzos disrupt the HPA axis and cortisol regulation',
          'The metabolic transition during tapering causes blood sugar instability, appetite changes, and carbohydrate cravings that are physiological — not character weaknesses',
          'Never restrict calories during active dose reductions — address weight goals during stable holding periods',
          'Protein at every meal is the most important nutritional support for the metabolic transition',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Metabolic Mind — Antipsychotics and metabolic effects', url: 'https://metabolicmind.org' },
          { label: 'PubMed — Antipsychotic metabolic effects review', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=antipsychotic+metabolic+side+effects+review' },
          { label: 'PubMed — Benzo withdrawal HPA axis', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=benzodiazepine+withdrawal+cortisol+HPA' },
        ],
      },
    ],
  },

  // ── Intermediate Assessment ──
  {
    id: 'intermediate-assessment',
    tier: 'intermediate',
    title: '🧪 Intermediate knowledge check',
    duration: null,
    isAssessment: true,
    content: [
      {
        type: 'p',
        text: 'Test your understanding of the intermediate concepts. Select the best answer for each question.',
      },
      {
        type: 'question',
        text: 'Which of the following best describes the state of nutritional ketosis?',
        options: [
          'Eating fewer than 100g of carbohydrates per day',
          'A metabolic state in which the liver produces ketone bodies from fat because glucose and insulin levels are low',
          'Burning fat for energy during exercise',
          'Eating a high-fat diet regardless of carbohydrate intake',
        ],
        correct: 1,
        explanation: 'Nutritional ketosis is a specific metabolic state — not just low-carb eating. It requires carbohydrate intake below roughly 20-50g/day so that blood glucose and insulin fall low enough to trigger hepatic (liver) ketone production. You can eat high-fat without being in ketosis if carbohydrate intake is too high. Exercise can increase ketone production but alone does not reliably produce nutritional ketosis.',
      },
      {
        type: 'question',
        text: 'A community member on a benzo taper notices heart palpitations every evening. Their GP has ruled out cardiac causes. Which electrolyte deficiency is most likely contributing?',
        options: [
          'Calcium',
          'Sodium',
          'Magnesium',
          'Iron',
        ],
        correct: 2,
        explanation: 'Magnesium deficiency is strongly associated with cardiac arrhythmias, heart palpitations, and palpitations at rest. Magnesium acts as a natural calcium channel blocker and is essential for maintaining normal heart rhythm. During benzo withdrawal, sweating, reduced appetite, and stress all deplete magnesium. Magnesium glycinate 200-400mg at night is the most evidence-supported first intervention for this symptom pattern.',
      },
      {
        type: 'question',
        text: 'A person has been on olanzapine for five years and wants to begin tapering. Which of the following metabolic changes should they anticipate?',
        options: [
          'Increased insulin resistance as the taper progresses',
          'Immediate weight loss beginning in the first week of tapering',
          'Gradual improvement in insulin sensitivity, potentially with transient blood sugar instability as the body readjusts',
          'No metabolic changes, as olanzapine\'s effects are purely neurological',
        ],
        correct: 2,
        explanation: 'Olanzapine is among the most metabolically disruptive medications in psychiatry, causing significant insulin resistance and weight gain. Tapering reverses these effects — insulin sensitivity improves, weight may normalise over months. However, the improvement in insulin signalling does not happen instantaneously and can cause a transition period of blood sugar instability as glucose regulation readjusts to the new (more sensitive) insulin environment. This is why protein at every meal is especially important during antipsychotic tapers.',
      },
      {
        type: 'question',
        text: 'When is the safest time to begin trialling a ketogenic diet during a medication taper?',
        options: [
          'At the same time as a dose reduction, to maximise benefits simultaneously',
          'During a severe withdrawal wave, to help calm the nervous system',
          'During a stable holding period of 4-6 weeks with no planned dose changes',
          'Only after completing the taper entirely',
        ],
        correct: 2,
        explanation: 'The ketogenic adaptation period (2-4 weeks) involves "keto flu" symptoms — fatigue, brain fog, mood fluctuations — that are impossible to distinguish from withdrawal if they coincide with a dose reduction. The safe approach is to transition to keto during a stable holding period (4-6 weeks minimum), assess the effect, and only resume tapering once you are stably fat-adapted and feeling better. Starting keto during a wave or during a cut compounds variables and makes rational decision-making about your taper impossible.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  //  ADVANCED
  // ─────────────────────────────────────────────

  {
    id: 'brain-energy-deprescribing',
    tier: 'advanced',
    title: 'Chris Palmer\'s Brain Energy theory and deprescribing',
    duration: '14 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Summarise the Brain Energy hypothesis and its core claims',
          'Understand how this theory reframes the role of psychiatric medications',
          'Evaluate the implications of the metabolic model for deprescribing',
        ],
      },
      {
        type: 'p',
        text: 'In 2022, Harvard psychiatrist Dr. Chris Palmer published "Brain Energy" — a book that makes a bold and well-evidenced argument: that all mental disorders are fundamentally metabolic disorders of the brain, and that the common thread linking them is mitochondrial dysfunction. This is not a fringe claim. Palmer is a faculty member at Harvard Medical School with decades of clinical experience, and his theory draws on an enormous body of convergent evidence from neuroscience, metabolic medicine, genetics, and clinical psychiatry.',
      },
      {
        type: 'p',
        text: 'For people deprescribing psychiatric medication, Brain Energy is perhaps the most important theoretical framework to understand — because if Palmer is even partially right, it changes how we should think about what medication withdrawal means, and what role diet might play in recovery.',
      },
      {
        type: 'video',
        videoId: 'hCyvqRq5YmM',
        start: 824,
        end: 1340,
        time: '13:44 – 22:20',
        title: 'Dr. Chris Palmer: Why the Neurotransmitter Model of Depression Falls Short',
        desc: 'Palmer challenges the serotonin deficiency model of depression in real time with Huberman — arguing that neurotransmitter imbalances are downstream of metabolic dysfunction, not primary causes, and establishing the metabolic brain energy framework.',
        source: 'Huberman Lab — Ep. 222',
      },
      {
        type: 'h3',
        text: 'The theory: mental disorders as metabolic brain disorders',
      },
      {
        type: 'p',
        text: 'Palmer\'s central argument is that mitochondria are the key regulators of virtually everything that goes wrong in psychiatric conditions: neurotransmitter synthesis and release, synaptic plasticity, neuroinflammation, gene expression, stress hormone regulation, and the epigenetic changes that are associated with psychiatric disorders. When mitochondria function poorly — due to genetics, diet, environmental factors, trauma, sleep deprivation, or a combination — the entire system begins to fail in ways we label as depression, anxiety, bipolar disorder, schizophrenia, or ADHD.',
      },
      {
        type: 'p',
        text: 'This "metabolic first" view challenges the traditional neurotransmitter model of psychiatry — the idea that depression is primarily a serotonin deficiency, or that schizophrenia is primarily about dopamine excess. Palmer argues that these neurotransmitter imbalances are real, but they are downstream effects of mitochondrial dysfunction, not the primary cause. Fixing the mitochondria — including through dietary intervention — may address the root cause rather than just managing symptoms.',
      },
      {
        type: 'h3',
        text: 'What this means for how medications "work"',
      },
      {
        type: 'p',
        text: 'If mental disorders have metabolic roots, then how do psychiatric medications produce their therapeutic effects? Palmer\'s analysis is illuminating: many psychiatric medications turn out to have significant effects on mitochondrial function and energy metabolism, in addition to their primary neurotransmitter targets. Antidepressants affect mitochondrial membrane potential. Antipsychotics alter mitochondrial dynamics. Lithium (one of the most effective psychiatric drugs known) has well-documented effects on mitochondrial function and cellular energy.',
      },
      {
        type: 'p',
        text: 'This reframing has significant implications for deprescribing. It suggests that medications may "work" partly by compensating for underlying metabolic dysfunction — not just by adjusting neurotransmitter levels. If this is true, then building metabolic health through diet, exercise, sleep, and stress reduction may reduce the degree to which medication is needed. Some patients may be able to achieve similar therapeutic effects through metabolic interventions that they were previously achieving through medication.',
      },
      {
        type: 'pearl',
        title: 'Key insight',
        text: 'Palmer\'s theory suggests that building metabolic health (diet, exercise, sleep, stress management) may reduce the biological need for psychiatric medication in some people — not by treating withdrawal, but by addressing the root metabolic dysfunction that made medication necessary in the first place.',
      },
      {
        type: 'h3',
        text: 'The clinical evidence: cases of metabolic treatment + deprescribing',
      },
      {
        type: 'video',
        videoId: 'RGv2AuIGRSg',
        start: 30,
        end: 888,
        time: 'Full video · ~14 min',
        title: 'Georgia Ede MD: Treating Serious Mental Illness with Ketogenic Therapy — Clinical Cases',
        desc: 'Georgia Ede presents five real patient cases of serious mental illness — schizophrenia, bipolar disorder, and severe depression — treated with ketogenic therapy, including outcomes and medication changes. Recorded at the first Metabolic Psychiatry Roadmap Retreat.',
        source: 'Metabolic Mind',
      },
      {
        type: 'p',
        text: 'Palmer\'s published case reports include patients with treatment-resistant schizophrenia who had been ill for decades, had failed multiple medication regimens, and achieved near-complete symptom remission on a ketogenic diet — while being able to reduce their antipsychotic burden significantly. He reports similar cases in bipolar disorder, schizoaffective disorder, and severe depression.',
      },
      {
        type: 'p',
        text: 'These are not typical cases. They represent individuals with severe, intractable illness who found a metabolic intervention that changed their trajectory. But they demonstrate what is possible when the metabolic dimension of psychiatric illness is taken seriously. For people tapering from more commonly used medications (SSRIs, benzos, standard antipsychotic doses), the potential benefits of metabolic optimisation are lower-stakes but potentially still significant.',
      },
      {
        type: 'h3',
        text: 'Critique and limitations',
      },
      {
        type: 'p',
        text: 'Palmer\'s theory is compelling but not yet fully proven. The evidence base consists largely of case reports, mechanistic arguments, and convergent evidence from adjacent fields — not large-scale randomised controlled trials in psychiatric populations. Critics have raised valid concerns about causality (is mitochondrial dysfunction a cause or a consequence of psychiatric conditions?), about extrapolating from severe cases to the general population, and about the practical challenges of maintaining a ketogenic diet long-term.',
      },
      {
        type: 'p',
        text: 'The most intellectually honest position: Palmer\'s theory is highly plausible, has meaningful supporting evidence, and offers a useful framework for thinking about metabolic interventions during tapering. It should be engaged with critically rather than accepted as definitively proven — or dismissed as fringe.',
      },
      {
        type: 'h3',
        text: 'What to take from Palmer\'s work as someone tapering',
      },
      {
        type: 'list',
        items: [
          'Diet likely matters more for brain health than mainstream psychiatry has acknowledged — the metabolic evidence is real and substantial',
          'Improving mitochondrial health through diet (particularly lower-carb and higher-fat eating) may support brain function during neuroadaptation',
          'Metabolic interventions may reduce the biological need for psychiatric medication in some people — but this should happen slowly and under medical supervision',
          'The relationship between diet and brain chemistry is bidirectional: good diet supports better brain function, which may allow medication to be reduced; medication reduction allows metabolic improvement, which supports brain function',
          'Palmer\'s work does not mean "diet can replace medication" — it means metabolic health is an important factor that is usually ignored in deprescribing discussions',
        ],
      },
      {
        type: 'takeaways',
        items: [
          'Brain Energy theory: all mental disorders are metabolic disorders — mitochondrial dysfunction is the common thread',
          'Psychiatric medications may work partly through metabolic mechanisms, not just neurotransmitter adjustment',
          'Metabolic optimisation (diet, exercise, sleep) may reduce the biological need for medication in some people, supporting deprescribing',
          'Clinical evidence includes cases of treatment-resistant patients achieving remission through ketogenic diet + medication reduction',
          'The theory is plausible and important but not yet definitively proven by large-scale RCTs — engage critically',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Brain Energy — Chris Palmer MD', url: 'https://brainenergybook.com' },
          { label: 'Palmer — Harvard faculty page', url: 'https://connects.catalyst.harvard.edu/Profiles/display/Person/115540' },
          { label: 'PubMed — Palmer ketogenic psychiatry case reports', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=chris+palmer+ketogenic+psychiatry' },
          { label: 'Metabolic Mind', url: 'https://metabolicmind.org' },
        ],
      },
    ],
  },

  {
    id: 'georgia-ede-deprescribing',
    tier: 'advanced',
    title: 'Georgia Ede\'s nutritional psychiatry and clinical applications',
    duration: '12 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Understand Georgia Ede\'s framework for connecting diet to brain chemistry',
          'Evaluate her critique of standard dietary guidelines through a tapering lens',
          'Apply practical elements of her clinical approach to deprescribing support',
        ],
      },
      {
        type: 'p',
        text: 'Dr. Georgia Ede is a Harvard-trained psychiatrist who has spent over twenty years investigating the relationship between food and brain chemistry. Her work at Harvard University Health Services, where she ran a dietary-based mental health service, represents one of the most rigorous clinical applications of nutritional psychiatry in a real-world setting. Her 2024 book "Change Your Diet, Change Your Mind" is arguably the most comprehensive evidence-based resource on how diet affects brain chemistry and psychiatric conditions.',
      },
      {
        type: 'p',
        text: 'Ede\'s approach is distinct from Chris Palmer\'s in its focus. While Palmer emphasises the mitochondrial and metabolic architecture of psychiatric illness, Ede focuses on specific neurochemical pathways — how particular foods and dietary patterns affect the synthesis, availability, and receptor sensitivity of serotonin, dopamine, GABA, glutamate, and acetylcholine. These are the same neurochemical systems that psychiatric medications target.',
      },
      {
        type: 'h3',
        text: 'The core framework: neurotransmitters and their dietary substrates',
      },
      {
        type: 'p',
        text: 'Neurotransmitters are not just affected by medications — they are built from food. The brain synthesises serotonin from tryptophan, an amino acid found in animal protein. Dopamine and noradrenaline are synthesised from tyrosine and phenylalanine. GABA is synthesised from glutamate, which in turn requires adequate glutamine. Acetylcholine is synthesised from choline, found primarily in egg yolks, liver, and meat.',
      },
      {
        type: 'p',
        text: 'This means that your diet directly determines whether your brain has adequate raw materials to maintain neurotransmitter function without medication support. If tryptophan intake is low (common on plant-dominant diets), serotonin synthesis may be compromised. If choline intake is low (common if eggs and liver are avoided), acetylcholine production suffers. During tapering — when you are asking your brain to manage its own neurochemistry without pharmaceutical assistance — adequate dietary substrates become genuinely important.',
      },
      {
        type: 'h3',
        text: 'Ede\'s critique of standard dietary guidelines',
      },
      {
        type: 'p',
        text: 'Ede is a vocal critic of the standard Western dietary guidelines — the advice to eat mostly grains, limit fat, and use seed oils instead of saturated fat — arguing that this advice is based on flawed epidemiology and is actively harmful to brain health. Her analysis of the evidence is thorough and specific:',
      },
      {
        type: 'list',
        items: [
          'Whole grains: While marketed as healthy, whole grains contain antinutrients (lectins, phytates) that impair mineral absorption, including the minerals critical for neurotransmitter synthesis. They also cause blood sugar spikes in most people, particularly refined grain products.',
          'Seed oils (polyunsaturated vegetable oils): These oils — promoted as heart-healthy — are extremely high in omega-6 linoleic acid, which when consumed in excess is metabolised into pro-inflammatory arachidonic acid. Ede\'s analysis of the evidence suggests that high omega-6 intake is associated with increased rates of depression, anxiety, and suicide — and she links this to the massive increase in seed oil consumption since the mid-20th century.',
          'Low-fat dietary advice: Removing fat from the diet means reducing the cholesterol, saturated fat, and fat-soluble vitamins (A, D, E, K) that are essential for brain structure, myelin production, and the synthesis of steroid hormones (including cortisol and sex hormones that affect mood).',
          'High plant-based emphasis: While plant foods have real nutritional value, a diet that severely restricts animal foods may lack adequate tryptophan, vitamin B12, DHA, choline, zinc, and haem iron — all of which are critical for brain function and neurotransmitter synthesis.',
        ],
      },
      {
        type: 'h3',
        text: 'The practical framework for brain-supporting nutrition',
      },
      {
        type: 'p',
        text: 'Ede\'s practical guidance is not a rigid protocol but a set of principles that can be adapted. In broad strokes, the dietary pattern she recommends for optimal brain chemistry is:',
      },
      {
        type: 'list',
        items: [
          'Prioritise animal protein: Meat, fish, eggs, and dairy provide the most bioavailable amino acid substrates for all neurotransmitters, as well as B12, haem iron, zinc, and DHA that are difficult to obtain adequately from plant sources',
          'Eliminate or severely restrict seed oils: Replace canola, soybean, sunflower, corn oil with olive oil, butter, ghee, coconut oil, or beef tallow',
          'Reduce refined carbohydrates significantly: The blood sugar instability produced by refined carbs is directly damaging to neurotransmitter systems — particularly serotonin and dopamine signalling',
          'Eat the most nutritionally dense foods: Organ meats (especially liver), eggs, oysters, fatty fish, and beef are among the most nutrient-dense foods available. They are also among the most evolutionarily consistent with how human brains developed.',
          'Reduce or eliminate ultra-processed food: The combination of seed oils, refined carbs, food additives, and excess sugar creates a dietary environment that damages brain chemistry through multiple simultaneous mechanisms',
        ],
      },
      {
        type: 'h3',
        text: 'Serotonin, dopamine, and GABA through a dietary lens',
      },
      {
        type: 'p',
        text: 'For people tapering SSRIs (which target serotonin) or benzodiazepines (which target GABA), Ede\'s framework offers something specific and useful: an explanation of how diet affects the precise neurochemical systems being disrupted by their taper.',
      },
      {
        type: 'list',
        title: 'Serotonin (SSRI tapering)',
        items: [
          'Synthesised from tryptophan (from animal protein, especially turkey, chicken, eggs, dairy)',
          'Serotonin production also requires adequate B6, folate, and magnesium as cofactors',
          'High carbohydrate intake can temporarily increase brain tryptophan uptake (the "carb craving" connection) but also causes long-term dysregulation',
          'Adequate protein + cofactors gives the brain the best supply of serotonin precursors as SSRIs are reduced',
        ],
      },
      {
        type: 'list',
        title: 'GABA (benzodiazepine tapering)',
        items: [
          'Synthesised from glutamate, which requires vitamin B6 (pyridoxal-5-phosphate) as an essential cofactor',
          'Magnesium modulates GABA-A receptor sensitivity — deficiency reduces the brain\'s ability to respond to its own GABA',
          'Zinc is required for GABA synthesis and GABA-A receptor function',
          'Dietary glutamine (from protein) provides the precursor for GABA production',
        ],
      },
      {
        type: 'h3',
        text: 'Applying Ede\'s approach to deprescribing support',
      },
      {
        type: 'p',
        text: 'The most actionable elements of Ede\'s framework for someone actively tapering are: eliminating seed oils (high impact, immediate change), increasing animal protein (provides neurotransmitter substrates), reducing refined carbohydrates (stabilises blood sugar and reduces inflammation), and ensuring adequate micronutrient intake (particularly B vitamins, magnesium, zinc, and DHA).',
      },
      {
        type: 'p',
        text: 'Ede emphasises that dietary changes for brain chemistry are not instant — most people need 6-12 weeks to see meaningful changes in how they feel, because the brain\'s neurochemical environment changes gradually as dietary patterns shift. Patience and consistency are required.',
      },
      {
        type: 'video',
        videoId: 'TXlVfwJ6RQU',
        start: 0,
        end: 960,
        title: 'Georgia Ede MD: Our Descent into Madness — Modern Diets & the Mental Health Crisis',
        desc: 'Ede makes the evidence-based case that modern diets — not lifestyle alone — are driving the global mental health crisis, covering RCTs of dietary interventions, insulin resistance, inflammation, hormonal dysregulation, and what dietary patterns offer the most hope.',
        source: 'Low Carb Down Under',
        time: '0:00 – 16:00',
      },
      {
        type: 'video',
        videoId: '23_fnung5To',
        start: 0,
        end: 900,
        title: 'Georgia Ede MD: What Is Nutritional & Metabolic Psychiatry? — PHC 2023',
        desc: 'Ede\'s comprehensive Public Health Collaboration 2023 talk defining the field of nutritional and metabolic psychiatry — how food affects brain chemistry, what the clinical evidence shows, and how diet interacts with psychiatric medication.',
        source: 'Public Health Collaboration',
        time: '0:00 – 15:00',
      },
      {
        type: 'takeaways',
        items: [
          'Neurotransmitters are built from food — dietary substrates (tryptophan, tyrosine, glutamine, choline) directly determine whether your brain can produce adequate neurotransmitters without medication',
          'Seed oils are the most harmful element of the modern diet for brain chemistry — replacing them with olive oil, butter, and ghee is the highest-impact dietary change',
          'Animal protein provides the most bioavailable neurotransmitter substrates — particularly important during SSRI and benzo tapering',
          'Standard dietary guidelines (low-fat, high-grain, seed-oil-based) may be actively harmful for brain chemistry during tapering',
          'Dietary changes for neurochemistry take 6-12 weeks to show meaningful effects — consistency matters more than perfection',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Diagnosis: Diet — Georgia Ede MD', url: 'https://diagnosisdiet.com' },
          { label: 'Georgia Ede — Change Your Diet, Change Your Mind', url: 'https://diagnosisdiet.com/book' },
          { label: 'Georgia Ede — Research publications', url: 'https://diagnosisdiet.com/research' },
        ],
      },
    ],
  },

  {
    id: 'research-library',
    tier: 'advanced',
    title: 'Reading the research — what the clinical evidence actually shows',
    duration: '13 min',
    content: [
      {
        type: 'objectives',
        items: [
          'Evaluate the strength of evidence for metabolic interventions in mental health',
          'Identify the areas with the most robust research versus emerging evidence',
          'Understand the significant gap in withdrawal-specific research and how to navigate it',
        ],
      },
      {
        type: 'p',
        text: 'One of the most important skills in managing your own health during tapering is the ability to evaluate research evidence critically — not to dismiss everything that isn\'t an RCT, and not to accept every anecdote as proof. This module gives you a framework for understanding what the evidence for metabolic interventions actually says, where it is strong, where it is weak, and how to think about applying uncertain evidence to your individual situation.',
      },
      {
        type: 'h3',
        text: 'Evidence hierarchy in this field',
      },
      {
        type: 'p',
        text: 'In conventional medicine, randomised controlled trials (RCTs) are considered the gold standard of evidence. Below that: cohort studies, case-control studies, case reports, and finally expert opinion and anecdote. This hierarchy exists for good reasons — RCTs minimise confounders and allow causal conclusions. But it has limitations, particularly in nutritional research.',
      },
      {
        type: 'list',
        items: [
          'Nutritional RCTs are difficult to blind — you cannot hide from a participant whether they are eating a ketogenic diet',
          'Long-term dietary interventions are expensive and have high dropout rates, making multi-year RCTs rare',
          'The most important dietary changes (remove seed oils, reduce processed food) are almost impossible to study in isolation because they occur together',
          'Industry funding has heavily distorted nutritional research — much of the evidence base favouring low-fat, high-grain diets was influenced by food industry funding',
          'For rare conditions or interventions, case reports and case series may be the only available evidence and still have scientific value',
        ],
      },
      {
        type: 'h3',
        text: 'Strongest evidence: ketogenic diet for psychiatric conditions',
      },
      {
        type: 'p',
        text: 'The ketogenic diet has the strongest evidence base of any dietary intervention in psychiatry. Evidence ranges from well-established mechanistic studies (how keto affects brain chemistry) to multiple clinical trials and case series.',
      },
      {
        type: 'list',
        title: 'The evidence landscape for keto in psychiatry',
        items: [
          'Epilepsy: Robust RCT evidence. Ketogenic diet reduces seizure frequency by >50% in roughly 50% of patients with drug-resistant epilepsy. The neurological mechanisms (reduced excitability, enhanced GABA) are the same as those relevant for anxiety, depression, and withdrawal.',
          'Bipolar disorder: Growing body of case reports and small trials. Multiple published cases of treatment-resistant bipolar disorder in full remission on ketogenic diet. One RCT currently underway (Stanford, published 2022: a 6-week keto pilot in bipolar patients showed significant improvements in mood, cognition, and metabolic markers).',
          'Major depression: Small RCTs and case series. A 2019 randomised pilot trial found keto comparable to antidepressants on some depression measures. Evidence is early but consistent in direction.',
          'Schizophrenia: Case reports only, but striking. Palmer\'s published cases of treatment-resistant schizophrenia achieving near-remission on keto are notable. A clinical trial is currently recruiting.',
          'PTSD and anxiety: Emerging. Mechanistic evidence is strong (GABA enhancement, glutamate reduction, neuroinflammation reduction), but clinical trials are still sparse.',
        ],
      },
      {
        type: 'h3',
        text: 'Moderate evidence: omega-3 fatty acids and anti-inflammatory diet',
      },
      {
        type: 'list',
        items: [
          'Omega-3 supplementation (EPA/DHA): One of the most extensively studied nutritional interventions in psychiatry. Meta-analyses of multiple RCTs show consistent benefits in depression. A 2019 meta-analysis of 19 RCTs found that omega-3 supplementation significantly reduced depressive symptoms. The effect size is modest but consistent.',
          'Mediterranean diet for depression: The SMILES trial (2017) — an Australian RCT — found that a Mediterranean dietary pattern significantly reduced depression scores compared to social support alone. This is one of the strongest pieces of evidence that diet pattern affects psychiatric outcomes.',
          'Anti-inflammatory diet generally: Multiple epidemiological studies link inflammatory dietary patterns to increased rates of depression and anxiety. Fewer intervention studies, but the mechanistic evidence and epidemiology are consistent.',
        ],
      },
      {
        type: 'h3',
        text: 'The withdrawal-specific research gap',
      },
      {
        type: 'p',
        text: 'Here is the critical gap that needs to be acknowledged: there is virtually no published clinical research specifically studying dietary interventions during psychiatric medication withdrawal. None. The existing evidence base consists of studies in general psychiatric populations, in healthy subjects, or in people with untreated conditions. Whether and how these interventions translate to the withdrawal context is extrapolated, not directly measured.',
      },
      {
        type: 'p',
        text: 'This does not mean dietary interventions do not work during withdrawal — it means the research has not been done. This is primarily a funding problem: there is no pharmaceutical company with financial interest in funding a study on whether eating more fish helps people taper antidepressants. Research in this space relies on public funding and academic interest, both of which are in short supply.',
      },
      {
        type: 'pearl',
        title: 'Key insight',
        text: 'The absence of withdrawal-specific dietary research is not evidence that dietary interventions do not help during withdrawal. It reflects funding priorities and the pharmaceutical industry\'s dominance of psychiatric research. The mechanisms are well-established; the clinical application is plausible; the gap is in prospective trials specifically in withdrawal populations.',
      },
      {
        type: 'h3',
        text: 'Emerging research areas',
      },
      {
        type: 'list',
        items: [
          'Gut-brain axis during withdrawal: Mounting evidence that the gut microbiome affects neurotransmitter production, neuroinflammation, and mood. Whether modulating the microbiome through diet affects withdrawal severity is an active research question.',
          'Mitochondrial interventions: Beyond the ketogenic diet, specific mitochondrial supplements (CoQ10, alpha-lipoic acid, N-acetylcysteine) are being studied in psychiatric populations. Early data is promising.',
          'Circadian rhythm alignment: Research connecting meal timing, fasting windows, and light exposure to psychiatric outcomes — relevant because withdrawal severely disrupts circadian rhythms.',
          'Psychobiotic foods: Specific fermented foods and probiotic strains showing benefit in clinical anxiety and depression trials — early stage but interesting.',
        ],
      },
      {
        type: 'h3',
        text: 'How to apply uncertain evidence to your situation',
      },
      {
        type: 'p',
        text: 'The challenge in applying metabolic psychiatry evidence to tapering is that you are extrapolating from evidence in related but not identical populations. The principled way to do this is:',
      },
      {
        type: 'list',
        items: [
          'Assess plausibility: Is the mechanism biologically plausible? If the mechanistic evidence is strong (e.g., magnesium and GABA-A receptor function), the extrapolation to withdrawal is reasonable even without direct evidence.',
          'Assess safety: Is the intervention safe? Eating more fish, supplementing magnesium, replacing seed oils with olive oil — these are low-risk interventions. Higher-risk interventions (extended fasting, high-dose supplements) require more caution.',
          'Test systematically: Apply the one-variable rule. Change one dietary element during a stable holding period. Track your symptoms rigorously. Assess the effect before adding the next change.',
          'Use community evidence: The tapering community has collectively accumulated substantial experience with dietary interventions. This is anecdotal but not worthless — patterns that appear consistently across many people have evidential weight even without a formal trial.',
          'Be honest about what you don\'t know: Some people will benefit from ketosis; others will find it too stressful during tapering. There is no universal protocol — the evidence points to directions, not certainties.',
        ],
      },
      {
        type: 'h3',
        text: 'Navigating the information landscape',
      },
      {
        type: 'p',
        text: 'The metabolic psychiatry space has significant noise alongside the signal. What to trust: peer-reviewed research published in established journals, clinicians with deep expertise in both psychiatry and nutrition (Palmer, Ede, Iain Campbell, Shebani Sethi), and community member experiences that are tracked and reported rigorously. What to be cautious about: supplement companies citing cherry-picked studies, social media accounts promoting extreme interventions without nuance, and anyone claiming a single dietary change will eliminate withdrawal.',
      },
      {
        type: 'video',
        videoId: 'hCyvqRq5YmM',
        start: 4170,
        end: 4754,
        title: 'Dr. Chris Palmer: Food Industry Influence, Research Bias & How to Read Nutrition Evidence',
        desc: 'Palmer and Huberman discuss how ultra-processed food companies fund and shape nutrition research, why published dietary guidelines cannot always be trusted at face value, and how to evaluate metabolic psychiatry evidence critically.',
        source: 'Huberman Lab — Ep. 222',
        time: '1:09:30 – 1:19:14',
      },
      {
        type: 'video',
        videoId: 'mVPhltup0IY',
        start: 265,
        end: 1231,
        title: 'Dr. Shebani Sethi: Defining Metabolic Psychiatry — Rethinking Mental Illness Through Metabolism',
        desc: 'Stanford psychiatrist Dr. Shebani Sethi — who coined the term "metabolic psychiatry" and founded the first academic metabolic psychiatry clinic — explains how insulin resistance, inflammation, and metabolic dysfunction drive psychiatric symptoms, and what the clinical evidence from Stanford\'s programme shows.',
        source: 'Mark Hyman MD',
        time: '4:25 – 20:31',
      },
      {
        type: 'takeaways',
        items: [
          'The strongest dietary evidence in psychiatry is for the ketogenic diet, with growing RCT data in depression, bipolar disorder, and emerging data in schizophrenia',
          'Omega-3 fatty acids and Mediterranean dietary patterns have moderate RCT evidence for depression and general psychiatric health',
          'There is virtually no withdrawal-specific dietary research — the gap is a funding and priority problem, not evidence of inefficacy',
          'Apply the evidence using: plausibility assessment, safety assessment, systematic one-variable testing, and honest uncertainty acknowledgment',
          'Trust peer-reviewed research and expert clinicians; be cautious of supplement marketing and extreme interventions promoted without nuance',
        ],
      },
      {
        type: 'sources',
        items: [
          { label: 'Metabolic Mind Research Hub', url: 'https://metabolicmind.org/research' },
          { label: 'PubMed — Ketogenic diet psychiatry', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=ketogenic+diet+psychiatry' },
          { label: 'PubMed — Omega-3 depression meta-analysis', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=omega-3+depression+meta-analysis' },
          { label: 'SMILES Trial — Mediterranean diet & depression', url: 'https://pubmed.ncbi.nlm.nih.gov/28137247/' },
          { label: 'Diet Doctor Science Library', url: 'https://dietdoctor.com/science' },
        ],
      },
    ],
  },

  // ── Advanced Assessment ──
  {
    id: 'advanced-assessment',
    tier: 'advanced',
    title: '🧪 Advanced knowledge check',
    duration: null,
    isAssessment: true,
    content: [
      {
        type: 'p',
        text: 'Test your understanding of the advanced concepts in metabolic psychiatry and deprescribing.',
      },
      {
        type: 'question',
        text: 'According to Chris Palmer\'s Brain Energy theory, what is the common thread linking all major psychiatric disorders?',
        options: [
          'Serotonin deficiency in the synaptic cleft',
          'Childhood trauma and adverse life experiences',
          'Mitochondrial dysfunction causing impaired cellular energy production in brain cells',
          'Genetic variants in dopamine receptor genes',
        ],
        correct: 2,
        explanation: 'Palmer\'s central argument is that mitochondrial dysfunction — impaired energy production in neurons — is the unifying biological mechanism across all major psychiatric conditions. Neurotransmitter imbalances (serotonin, dopamine, GABA) are real, but Palmer argues they are downstream effects of mitochondrial dysfunction, not the primary cause. Fixing the mitochondria, including through dietary intervention, may address root causes rather than just managing symptoms. This is distinct from the traditional neurotransmitter deficit model that has dominated psychiatry since the 1960s.',
      },
      {
        type: 'question',
        text: 'The SMILES trial (2017) is considered one of the strongest pieces of evidence that diet affects psychiatric outcomes. What did it find?',
        options: [
          'A ketogenic diet was superior to antidepressants in treating major depression',
          'A Mediterranean dietary pattern significantly reduced depression scores compared to social support alone',
          'Omega-3 supplementation alone was sufficient to treat moderate depression',
          'Fasting twice per week eliminated depressive symptoms in 60% of participants',
        ],
        correct: 1,
        explanation: 'The SMILES trial (Supporting the Modification of lifestyle In Lowered Emotional States, Jacka et al. 2017) was a randomised controlled trial that compared a Mediterranean-style dietary intervention to standard social support in people with major depression. The dietary intervention group showed significantly greater improvement in depression scores, and 32% of those in the dietary group achieved remission compared to 8% in the social support group. This remains one of the most cited pieces of RCT evidence that dietary pattern directly affects clinical depression outcomes.',
      },
      {
        type: 'question',
        text: 'Georgia Ede argues that which dietary component is most damaging to brain chemistry in the modern diet?',
        options: [
          'Saturated fat from animal sources',
          'Refined seed oils (canola, soybean, sunflower, corn oil)',
          'Natural sugars from fruit',
          'Sodium from salt',
        ],
        correct: 1,
        explanation: 'Ede\'s analysis identifies refined seed oils — particularly omega-6-rich industrial vegetable oils like canola, soybean, sunflower, and corn oil — as the most damaging dietary element for brain health. She argues that the massive increase in consumption of these oils since the mid-20th century correlates with increased rates of depression, anxiety, and suicide. The mechanism: excess omega-6 linoleic acid is metabolised into pro-inflammatory arachidonic acid, which drives neuroinflammation. Saturated fat from animal sources and natural food sugars are less problematic than often suggested, while natural sodium is essential for brain function.',
      },
      {
        type: 'question',
        text: 'Why is there virtually no published research specifically on dietary interventions during psychiatric medication withdrawal?',
        options: [
          'Scientists have studied this thoroughly and found that diet has no effect on withdrawal',
          'The mechanisms of withdrawal are too complex to study with dietary interventions',
          'There is no financial incentive for pharmaceutical or food companies to fund withdrawal-specific dietary trials',
          'Ethics committees have prohibited withdrawal-related dietary studies as too risky',
        ],
        correct: 2,
        explanation: 'The withdrawal-specific dietary research gap is primarily a funding problem. Pharmaceutical companies fund research on medications, not dietary alternatives. Food companies fund research that promotes their products. Academic research requires grant funding that typically follows disease categories, not withdrawal states. There is no commercial entity with strong financial interest in funding a rigorous trial of dietary interventions during medication tapering. The absence of this research does not mean dietary interventions are ineffective during withdrawal — it means the research has not been prioritised or funded.',
      },
      {
        type: 'question',
        text: 'Which neurotransmitter relevant to benzodiazepine tapering is most dependent on dietary sources for its synthesis?',
        options: [
          'Serotonin, which requires tryptophan from protein',
          'GABA, which requires glutamine (from protein) and vitamin B6 as a cofactor',
          'Dopamine, which requires tyrosine from red meat',
          'Acetylcholine, which requires choline from eggs',
        ],
        correct: 1,
        explanation: 'GABA (gamma-aminobutyric acid) — the primary inhibitory neurotransmitter that benzodiazepines enhance — is synthesised from glutamate, which in turn requires dietary glutamine as a precursor. The conversion of glutamate to GABA requires vitamin B6 (specifically pyridoxal-5-phosphate) as an essential enzymatic cofactor. Magnesium modulates GABA-A receptor sensitivity. During benzo tapering, ensuring adequate protein (for glutamine), B6, and magnesium through diet and supplementation supports the brain\'s capacity to produce and respond to its own GABA without pharmaceutical assistance. The other options are also correct in terms of dietary substrate requirements but are less directly relevant to benzo tapering.',
      },
    ],
  },
];

export function getModulesByTier(tierId) {
  return MODULES.filter((m) => m.tier === tierId);
}
