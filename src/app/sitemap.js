import { DRUG_LIST } from '@/lib/drugs';

export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  const staticPages = [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/forums`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/education`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/resources`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/deprescribers`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/drugs`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/auth/signin`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/auth/signup`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/join`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/compare/survivingantidepressants`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/compare/benzobuddies`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const drugPages = DRUG_LIST.map((drug) => ({
    url: `${siteUrl}/drugs/${drug.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...drugPages];
}
