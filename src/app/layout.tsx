import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Canada 247 – Canada In Real Time',
  description: 'Breaking news, local coverage, and real-time updates from across Canada.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-[#F5F5F5] min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
