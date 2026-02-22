import { DM_Sans } from 'next/font/google';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata = {
  title: 'TaperCommunity — Peer Support for Medication Tapering',
  description:
    'A peer support community for safely tapering psychiatric medications. Evidence-based guidance, shared experiences, and taper journals.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <div className="flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
