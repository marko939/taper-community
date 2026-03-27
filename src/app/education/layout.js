export default function EducationLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://taper.community' },
            { '@type': 'ListItem', position: 2, name: 'Education', item: 'https://taper.community/education' },
          ],
        }) }}
      />
      <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8" style={{ height: 'calc(100vh - 0px)' }}>
        {children}
      </div>
    </>
  );
}
