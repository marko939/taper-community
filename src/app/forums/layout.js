export const metadata = {
  title: 'Forums — TaperCommunity',
  description: 'Drug-specific peer support forums for tapering SSRIs, SNRIs, benzos, antipsychotics, and more. Connect with others on the same medication.',
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
    </>
  );
}
