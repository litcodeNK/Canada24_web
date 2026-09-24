'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Bookmark, Settings, Bell, Globe, type LucideIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionThumb } from './SectionThumb';
import { SECTION_NAV, SECONDARY_SECTION_NAV } from '@/lib/nav';

type FooterLink = { href: string | null; label: string; icon?: LucideIcon };

const FOOTER_COLS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: 'SECTIONS',
    // Same list the header and mobile menu render — see src/lib/nav.ts.
    links: SECTION_NAV,
  },
  {
    heading: 'MORE',
    links: SECONDARY_SECTION_NAV,
  },
  {
    heading: 'ACCOUNT',
    links: [
      { href: '/auth/email', label: 'Sign In', icon: LogIn },
      { href: '/saved', label: 'Saved Articles', icon: Bookmark },
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/onboarding/alerts', label: 'Alert Preferences', icon: Bell },
      { href: '/onboarding/regions', label: 'Manage Regions', icon: Globe },
    ],
  },
];

export function Footer() {
  const { sectionThumbnails } = useApp();

  return (
    <div className="relative mt-6 sm:mt-10">
      {/* Wave cap: a two-period sine curve (y = mid + amp*sin(2*periods*pi*x/W)),
          sampled by trigonometry rather than an arbitrary blob, in the same
          canadaRed accent used on the logo. It's the card's only "border radius". */}
      <svg
        className="block w-full h-10 sm:h-16 text-canadaRed drop-shadow-[0_-6px_16px_rgba(213,43,30,0.25)]"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,20.0 L30.0,20.89 L60.0,23.48 L90.0,27.62 L120.0,33.0 L150.0,39.27 L180.0,46.0 L210.0,52.73 L240.0,59.0 L270.0,64.38 L300.0,68.52 L330.0,71.11 L360.0,72.0 L390.0,71.11 L420.0,68.52 L450.0,64.38 L480.0,59.0 L510.0,52.73 L540.0,46.0 L570.0,39.27 L600.0,33.0 L630.0,27.62 L660.0,23.48 L690.0,20.89 L720.0,20.0 L750.0,20.89 L780.0,23.48 L810.0,27.62 L840.0,33.0 L870.0,39.27 L900.0,46.0 L930.0,52.73 L960.0,59.0 L990.0,64.38 L1020.0,68.52 L1050.0,71.11 L1080.0,72.0 L1110.0,71.11 L1140.0,68.52 L1170.0,64.38 L1200.0,59.0 L1230.0,52.73 L1260.0,46.0 L1290.0,39.27 L1320.0,33.0 L1350.0,27.62 L1380.0,23.48 L1410.0,20.89 L1440.0,20.0 L1440,100 L0,100 Z"
        />
      </svg>

      <footer className="relative bg-white dark:bg-[#1A1A1A] shadow-[0_-20px_45px_-25px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">

        {/* Logo row */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-300 dark:border-[#2A2A2A]">
          <Image
            src="/canada247-logo.png"
            alt="Canada 247"
            width={686}
            height={583}
            className="h-10 w-auto object-contain flex-shrink-0"
          />
          <div>
            <span className="font-display font-black text-2xl tracking-tight text-[#1a1a1a] dark:text-white block leading-none">
              CANADA NEWS
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase font-sans">
              Canada in Real Time
            </span>
          </div>
        </div>

        {/* Columns — floating navy card, same treatment as the header/footer cards elsewhere */}
        <div className="bg-navy rounded-2xl sm:rounded-3xl shadow-xl shadow-navy/20 p-5 sm:p-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {FOOTER_COLS.map(col => (
              <div key={col.heading}>
                <h3 className="text-[10px] font-bold tracking-[0.12em] text-white/45 uppercase mb-3 font-sans">
                  {col.heading}
                </h3>
                <ul className="space-y-1">
                  {col.links.map(link => {
                    const Icon = link.icon;
                    const thumb = Icon ? (
                      <span className="w-8 h-8 rounded-lg flex-shrink-0 bg-white/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white/70 group-hover:text-canadaRed transition-colors" />
                      </span>
                    ) : (
                      <SectionThumb
                        src={sectionThumbnails[link.label]}
                        className="w-8 h-8 rounded-lg flex-shrink-0 bg-white/10"
                      />
                    );
                    return (
                      <li key={link.label}>
                        {link.href === null ? (
                          /* No page behind it yet — shown, but not linked. */
                          <span className="flex items-center gap-2.5 py-1.5 opacity-60">
                            {thumb}
                            <span className="text-[13px] text-white/80 font-sans inline-flex items-center gap-1.5">
                              {link.label}
                              <span className="text-[8.5px] font-bold uppercase tracking-wider border border-current rounded px-1 py-px leading-none opacity-70">
                                Soon
                              </span>
                            </span>
                          </span>
                        ) : (
                          <Link
                            href={link.href}
                            className="group flex items-center gap-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            {thumb}
                            <span className="text-[13px] text-white/80 group-hover:text-white transition-colors font-sans">
                              {link.label}
                            </span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-300 dark:border-[#2A2A2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[12px] text-gray-500 font-sans">
            © {new Date().getFullYear()} Canada News. All rights reserved.
          </p>
          <nav aria-label="Legal links" className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-[12px] text-gray-500 hover:text-canadaRed transition-colors font-sans"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[12px] text-gray-500 hover:text-canadaRed transition-colors font-sans"
            >
              Terms of Service
            </Link>
            <a
              href="mailto:info@canada247.com"
              className="text-[12px] text-gray-500 hover:text-canadaRed transition-colors font-sans"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
      </footer>
    </div>
  );
}
