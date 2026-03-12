import { GENERAL_FORUMS } from '@/lib/forumCategories';
import { DRUG_LIST } from '@/lib/drugs';
import Link from 'next/link';

export const metadata = {
  title: 'Medication Tapering Forums — TaperCommunity',
  description: 'Drug-specific peer support forums for tapering SSRIs, SNRIs, benzos, antipsychotics, and more. Connect with others on the same medication.',
  alternates: { canonical: '/forums' },
};

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://taper.community' },
            { '@type': 'ListItem', position: 2, name: 'Forums', item: 'https://taper.community/forums' },
          ],
        }) }}
      />
      {children}
      {/* Server-rendered forum links for search engine crawlers */}
      <div className="sr-only" aria-hidden="false">
        <h2>Community Forums</h2>
        <ul>
          {GENERAL_FORUMS.map((f) => (
            <li key={f.slug}>
              <Link href={`/forums/${f.slug}`}>{f.name}</Link> — {f.description}
            </li>
          ))}
        </ul>
        <h2>Drug-Specific Forums</h2>
        <ul>
          {DRUG_LIST.map((d) => (
            <li key={d.slug}>
              <Link href={`/drugs/${d.slug}`}>{d.name} ({d.generic}) — {d.class}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
