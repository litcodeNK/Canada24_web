import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://canada247.news'),
  title: {
    default: 'Canada News — Breaking News, Politics, World & More',
    template: '%s | Canada News',
  },
  description: 'Breaking news, local coverage, and real-time updates from across Canada — politics, world, business, health, sports, technology, and entertainment.',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'Canada News',
    title: 'Canada News — Breaking News, Politics, World & More',
    description: 'Breaking news and real-time updates from across Canada.',
    images: [{ url: '/assets/canada247-logo.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canada News — Breaking News, Politics, World & More',
    description: 'Breaking news and real-time updates from across Canada.',
  },
  icons: { icon: '/favicon.ico' },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Canada News',
  url: 'https://canada247.news',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://canada247.news/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sourceSerif.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Bebas Neue for brand font */}
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-[#F5F5F5] min-h-screen font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 z-[9999] bg-canadaRed text-white px-4 py-2 text-sm font-bold"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
