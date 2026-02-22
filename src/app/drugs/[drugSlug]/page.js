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
    description: `Evidence-based tapering information for ${drug.name} (${drug.generic}). ${drug.mechanismOfAction || drug.taperNotes}`,
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

  return (
    <div className="space-y-8">
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
