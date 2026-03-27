export const metadata = {
  title: 'Drug Profiles — TaperCommunity',
  description: 'Browse pharmacological profiles and tapering guidance for 27 psychiatric medications including SSRIs, SNRIs, benzodiazepines, antipsychotics, and more.',
};

export default function DrugsLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://taper.community' },
            { '@type': 'ListItem', position: 2, name: 'Drug Profiles', item: 'https://taper.community/drugs' },
          ],
        }) }}
      />
      {children}
    </>
  );
}
