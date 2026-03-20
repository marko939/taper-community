import { DM_Sans, Fraunces } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import StoreInitializer from '@/components/layout/StoreInitializer';
import NotificationFab from '@/components/layout/NotificationFab';
import BottomNav from '@/components/layout/BottomNav';
import PageViewTracker from '@/components/layout/PageViewTracker';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import BraveBanner from '@/components/layout/BraveBanner';
import SwipeBackWrapper from '@/components/layout/SwipeBackWrapper';
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
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TaperCommunity — Peer Support for Medication Tapering' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/',
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
        {/* Plausible Analytics — privacy-respecting, no cookies, GDPR-compliant */}
        <script async src="https://plausible.io/js/pa-TXjD9GUz0fIYQgcqOnIQL.js" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
          plausible.init();
        `}} />
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
            <SwipeBackWrapper>
              <ErrorBoundary>
                <BraveBanner />
                <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-6">
                  {children}
                </main>
              </ErrorBoundary>
              <Footer />
            </SwipeBackWrapper>
          </div>
          <NotificationFab />
          <BottomNav />
          <PageViewTracker />
          <Analytics />
        </FontSizeProvider>
      </body>
    </html>
  );
}
