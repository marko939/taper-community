export const metadata = {
  title: 'About TaperCommunity — Peer Support for Medication Tapering',
  description: 'Built from the ground up for the tapering community. Learn about our mission, principles, and how TaperCommunity supports safe medication withdrawal.',
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
            { '@type': 'ListItem', position: 2, name: 'About', item: 'https://taper.community/about' },
          ],
        }) }}
      />
      {children}
    </>
  );
}
