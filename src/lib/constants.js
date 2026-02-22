export const SYMPTOMS = [
  'Brain zaps',
  'Dizziness',
  'Nausea',
  'Insomnia',
  'Headache',
  'Irritability',
  'Anxiety',
  'Crying spells',
  'Fatigue',
  'Electric shock sensations',
  'Depersonalization',
  'GI upset',
  'Appetite changes',
  'Muscle aches',
  'Flu-like symptoms',
  'Emotional blunting',
  'Rage',
  'Sweating',
  'Tinnitus',
  'Visual disturbances',
];

export const MOOD_LABELS = {
  1: 'Crisis',
  2: 'Very bad',
  3: 'Bad',
  4: 'Poor',
  5: 'Okay',
  6: 'Fair',
  7: 'Good',
  8: 'Very good',
  9: 'Great',
  10: 'Excellent',
};

export const TAPER_STAGES = [
  { value: 'researching', label: 'Researching — considering tapering' },
  { value: 'planning', label: 'Planning — working with clinician on schedule' },
  { value: 'active', label: 'Actively tapering' },
  { value: 'holding', label: 'Holding at current dose' },
  { value: 'completed', label: 'Completed taper' },
  { value: 'reinstated', label: 'Reinstated — went back on medication' },
  { value: 'supporting', label: 'Supporting others (not currently tapering)' },
];

export const DRUG_CLASSES = [
  'SSRI',
  'SNRI',
  'TCA',
  'NaSSA',
  'NDRI',
  'Atypical Antipsychotic',
  'Benzodiazepine',
  'Gabapentinoid',
  'Other',
];

export const DRUG_CATEGORY_GROUPS = [
  { key: 'SSRI', label: 'SSRIs', desc: 'Selective Serotonin Reuptake Inhibitors', classes: ['SSRI'] },
  { key: 'SNRI', label: 'SNRIs', desc: 'Serotonin-Norepinephrine Reuptake Inhibitors', classes: ['SNRI'] },
  { key: 'Benzo', label: 'Benzos', desc: 'Benzodiazepines', classes: ['Benzodiazepine'] },
  { key: 'TCA', label: 'TCAs', desc: 'Tricyclic Antidepressants', classes: ['TCA'] },
  { key: 'Antipsychotic', label: 'Antipsychotics', desc: 'Atypical Antipsychotics', classes: ['Atypical Antipsychotic'] },
  { key: 'Other', label: 'Other', desc: 'NaSSAs, NDRIs, Gabapentinoids & more', classes: ['NaSSA', 'NDRI', 'Gabapentinoid', 'Other'] },
];

export const FORUM_SECTIONS = [
  {
    key: 'community',
    label: 'Community',
    forums: [
      {
        slug: 'introductions',
        name: 'Introductions',
        description: 'Welcome! Share your first post here — tell us about yourself and your tapering journey.',
      },
      {
        slug: 'support',
        name: 'Support',
        description: 'Emotional support, difficult moments, identity, and finding meaning during tapering and withdrawal.',
      },
      {
        slug: 'success-stories',
        name: 'Success Stories',
        description: 'Recovery stories and taper milestones worth celebrating.',
      },
    ],
  },
  {
    key: 'tapering',
    label: 'Tapering & Symptoms',
    forums: [
      {
        slug: 'tapering',
        name: 'Tapering',
        description: 'Dose reduction strategies, schedules, methods, withdrawal symptoms, supplements, and self-care.',
      },
    ],
  },
  {
    key: 'research',
    label: 'Research & News',
    forums: [
      {
        slug: 'research-and-news',
        name: 'Research & News',
        description: 'Scientific papers, clinical studies, news articles, books, advocacy, and media about psychiatric drug withdrawal.',
      },
    ],
  },
  {
    key: 'lifestyle',
    label: 'Relationships & Lifestyle',
    forums: [
      {
        slug: 'lifestyle',
        name: 'Relationships & Lifestyle',
        description: 'Diet, exercise, sleep, mindfulness, relationships, and other lifestyle factors during tapering.',
      },
    ],
  },
];

// Flat list of all general (non-drug) forum slugs for routing
export const GENERAL_FORUM_SLUGS = FORUM_SECTIONS.flatMap((s) =>
  s.forums.map((f) => f.slug)
);

// Legacy exports for backward compatibility during migration
export const FORUM_CATEGORIES = {
  drug: 'Drug-Specific',
  general: 'General Discussion',
  resources: 'Research & News',
};

export const THREAD_TAGS = [
  'taper update',
  'question',
  'symptom check',
  'success story',
  'resource',
  'vent',
  'clinician experience',
  'reinstatement',
  'holding',
  'tips',
  'research',
];
