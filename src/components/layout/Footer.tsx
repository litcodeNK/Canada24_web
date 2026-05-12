import Link from 'next/link';
import Image from 'next/image';

const FOOTER_COLS = [
  {
    heading: 'SECTIONS',
    links: [
      { href: '/', label: 'Top Stories' },
      { href: '/local', label: 'Local News' },
      { href: '/sections/politics', label: 'Politics' },
      { href: '/sections/world', label: 'World' },
      { href: '/sections/business', label: 'Business' },
      { href: '/sections/health', label: 'Health' },
      { href: '/sections/sports', label: 'Sports' },
      { href: '/sections/technology', label: 'Technology' },
      { href: '/sections/entertainment', label: 'Entertainment' },
    ],
  },
  {
    heading: 'MORE',
    links: [
      { href: '/videos', label: 'Video' },
      { href: '/sections/immigration', label: 'Immigration' },
      { href: '/sections/indigenous', label: 'Indigenous' },
      { href: '/sections/education', label: 'Education' },
      { href: '/sections/aviation', label: 'Aviation' },
      { href: '/sections/auto news', label: 'Auto News' },
      { href: '/sections/blacks in canada', label: 'Blacks in Canada' },
    ],
  },
  {
    heading: 'ACCOUNT',
    links: [
      { href: '/auth/email', label: 'Sign In' },
      { href: '/saved', label: 'Saved Articles' },
      { href: '/settings', label: 'Settings' },
      { href: '/onboarding/alerts', label: 'Alert Preferences' },
      { href: '/onboarding/regions', label: 'Manage Regions' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#1A1A1A] border-t border-gray-300 dark:border-[#2A2A2A] mt-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">

        {/* Logo row */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-300 dark:border-[#2A2A2A]">
          <div className="h-10 w-28 rounded-full overflow-hidden border border-gray-200 dark:border-[#333] bg-white flex-shrink-0">
            <Image
              src="/canada247-logo.jpg"
              alt="Canada 247"
              width={112}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-display font-black text-2xl tracking-tight text-[#1a1a1a] dark:text-white block leading-none">
              CANADA NEWS
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase font-sans">
              Canada in Real Time
            </span>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          {FOOTER_COLS.map(col => (
            <div key={col.heading}>
              <h3 className="text-[10px] font-bold tracking-[0.12em] text-gray-500 uppercase mb-3 font-sans">
                {col.heading}
              </h3>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#3a3a3a] dark:text-[#CCC] hover:text-canadaRed dark:hover:text-canadaRed transition-colors font-sans"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-300 dark:border-[#2A2A2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[12px] text-gray-500 font-sans">
            © {new Date().getFullYear()} Canada News. All rights reserved.
          </p>
          <nav aria-label="Legal links" className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map(label => (
              <span
                key={label}
                className="text-[12px] text-gray-500 hover:text-canadaRed cursor-pointer transition-colors font-sans"
              >
                {label}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
