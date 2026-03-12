import { DM_Sans, Fraunces } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import StoreInitializer from '@/components/layout/StoreInitializer';
import NotificationFab from '@/components/layout/NotificationFab';
import PageViewTracker from '@/components/layout/PageViewTracker';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import { FontSizeProvider } from '@/lib/fontSizeContext';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['300', '400', '600', '700'],
});

export const metadata = {
  title: 'TaperCommunity — Peer Support for Medication Tapering',
  description:
    'A peer support community for safely tapering psychiatric medications. Evidence-based guidance, shared experiences, and taper journals.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community'),
  openGraph: {
    title: 'TaperCommunity — Peer Support for Medication Tapering',
    description: 'A peer support community for safely tapering psychiatric medications. Evidence-based guidance, shared experiences, and taper journals.',
    siteName: 'TaperCommunity',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <head>
        {/* Organization + MedicalWebPage structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: 'TaperCommunity',
            url: 'https://taper.community',
            description: 'A peer support community for safely tapering psychiatric medications. Evidence-based guidance, shared experiences, and taper journals.',
            medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
            publisher: {
              '@type': 'Organization',
              name: 'TaperCommunity',
              url: 'https://taper.community',
              logo: { '@type': 'ImageObject', url: 'https://taper.community/tapercommunity-logo.png' },
              sameAs: [],
            },
          }) }}
        />
        {/* Apply saved font size before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var size = localStorage.getItem('tapercommunity_font_size') || 'large';
              var map = { small: '14px', medium: '16px', large: '18px', xlarge: '20px' };
              document.documentElement.style.fontSize = map[size] || '18px';
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-screen antialiased">
        <FontSizeProvider>
          <StoreInitializer />
          <div className="lg:flex">
            <Sidebar />
            <div className="min-w-0 flex-1">
              <ErrorBoundary>
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                  {children}
                </main>
              </ErrorBoundary>
              <Footer />
            </div>
          </div>
          <NotificationFab />
          <PageViewTracker />
          <Analytics />
        </FontSizeProvider>
      </body>
    </html>
  );
}
