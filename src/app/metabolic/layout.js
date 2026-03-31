import MetabolicNav from '@/components/metabolic/MetabolicNav';

export default function MetabolicLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://taper.community' },
            { '@type': 'ListItem', position: 2, name: 'Metabolic Health & Diet', item: 'https://taper.community/metabolic' },
          ],
        }) }}
      />
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
        <MetabolicNav />
      </div>
      {children}
    </>
  );
}
