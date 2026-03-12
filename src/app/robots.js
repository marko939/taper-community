export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/onboarding', '/settings'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
