export const metadata = {
  title: 'Resources — TaperCommunity',
  description: 'Evidence-based tapering articles, drug profiles, and deprescribing guides. Free resources for safely tapering psychiatric medications.',
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
            { '@type': 'ListItem', position: 2, name: 'Resources', item: 'https://taper.community/resources' },
          ],
        }) }}
      />
      {children}
    </>
  );
}
