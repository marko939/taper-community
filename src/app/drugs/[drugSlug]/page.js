import { getDrug, DRUG_SLUGS } from '@/lib/drugs';
import DrugProfileCard from '@/components/drugs/DrugProfileCard';
import DeprescriberCTA from '@/components/layout/DeprescriberCTA';
import Link from 'next/link';

export async function generateStaticParams() {
  return DRUG_SLUGS.map((slug) => ({ drugSlug: slug }));
}

export async function generateMetadata({ params }) {
  const { drugSlug } = await params;
  const drug = getDrug(drugSlug);
  if (!drug) return { title: 'Drug Not Found' };

  return {
    title: `${drug.name} (${drug.generic}) Tapering Guide — TaperCommunity`,
    description: `Evidence-based ${drug.name} (${drug.generic}) tapering guide. Withdrawal timeline, tapering protocol, community tips, and ${drug.class} deprescribing info.`.slice(0, 160),
    alternates: { canonical: `/drugs/${drugSlug}` },
  };
}

export default async function DrugProfilePage({ params }) {
  const { drugSlug } = await params;
  const drug = getDrug(drugSlug);

  if (!drug) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Drug not found</h1>
        <Link href="/forums" className="mt-4 inline-block font-medium text-accent-blue hover:underline">Back to Forums</Link>
      </div>
    );
  }

  const otherDrugs = DRUG_SLUGS.filter((s) => s !== drugSlug).slice(0, 4);

  const drugSchema = {
    '@context': 'https://schema.org',
    '@type': 'Drug',
    name: drug.name,
    nonProprietaryName: drug.generic,
    drugClass: { '@type': 'DrugClass', name: drug.class },
    description: drug.description || drug.taperNotes,
    mechanismOfAction: drug.mechanismOfAction || undefined,
    administrationRoute: 'Oral',
    url: `https://taper.community/drugs/${drug.slug}`,
  };

  // Build FAQ schema from drug data — first-mover advantage for rich results
  const faqEntries = [];
  if (drug.withdrawalSymptoms?.length) {
    faqEntries.push({
      '@type': 'Question',
      name: `What are the withdrawal symptoms of ${drug.name} (${drug.generic})?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Common withdrawal symptoms of ${drug.name} (${drug.generic}) include: ${drug.withdrawalSymptoms.join(', ')}. Symptom severity varies by individual, dose, and duration of use.`,
      },
    });
  }
  if (drug.taperNotes || drug.maudsleyGuidance) {
    faqEntries.push({
      '@type': 'Question',
      name: `How should I taper off ${drug.name} (${drug.generic})?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: [drug.taperNotes, drug.maudsleyGuidance].filter(Boolean).join(' '),
      },
    });
  }
  if (drug.withdrawalTimeline) {
    const tl = drug.withdrawalTimeline;
    faqEntries.push({
      '@type': 'Question',
      name: `How long does ${drug.name} withdrawal last?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${drug.name} withdrawal typically begins ${tl.onset}, peaks around ${tl.peak}, and resolves within ${tl.resolution}.${tl.protracted ? ` ${tl.protracted}` : ''}`,
      },
    });
  }
  if (drug.communityTips?.length) {
    faqEntries.push({
      '@type': 'Question',
      name: `What tips do others have for tapering ${drug.name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: drug.communityTips.slice(0, 4).join(' '),
      },
    });
  }

  const faqSchema = faqEntries.length > 0
    ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqEntries }
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://taper.community' },
      { '@type': 'ListItem', position: 2, name: 'Drug Profiles', item: 'https://taper.community/drugs' },
      { '@type': 'ListItem', position: 3, name: `${drug.name} Tapering Guide`, item: `https://taper.community/drugs/${drug.slug}` },
    ],
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(drugSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mb-2 flex items-center gap-2">
        <Link href="/forums" className="text-sm text-text-subtle hover:text-foreground">
          Forums
        </Link>
        <span className="text-text-subtle">/</span>
        <span className="text-sm text-text-subtle">Drug Profiles</span>
        <span className="text-text-subtle">/</span>
      </div>

      <DrugProfileCard drug={drug} />

      <DeprescriberCTA />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Other Drug Profiles</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {otherDrugs.map((slug) => {
            const d = getDrug(slug);
            return (
              <Link
                key={slug}
                href={`/drugs/${slug}`}
                className="card no-underline transition hover:shadow-lg"
              >
                <h3 className="font-semibold text-foreground">{d.name}</h3>
                <p className="text-xs text-text-subtle">{d.generic} — {d.class}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
