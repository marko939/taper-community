import { DM_Sans, Fraunces } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import StoreInitializer from '@/components/layout/StoreInitializer';
import NotificationFab from '@/components/layout/NotificationFab';
import PageViewTracker from '@/components/layout/PageViewTracker';
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="min-h-screen antialiased">
        <StoreInitializer />
        <div className="lg:flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>
        </div>
        <NotificationFab />
        <PageViewTracker />
        <Analytics />
      </body>
    </html>
  );
}
