import Link from 'next/link';

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
    <footer className="bg-white dark:bg-[#1A1A1A] border-t border-[#E8E8E8] dark:border-[#2A2A2A] mt-12">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10">
        {/* Logo row */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
          <div className="w-8 h-8 bg-[#D52B1E] flex items-center justify-center flex-shrink-0">
            <span className="bebas text-white text-base leading-none">C</span>
          </div>
          <div>
            <span className="bebas text-[#1a1a1a] dark:text-white text-2xl tracking-widest block leading-none">CANADA 247</span>
            <span className="text-[10px] text-[#999] font-medium tracking-widest uppercase">Canada in Real Time</span>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          {FOOTER_COLS.map(col => (
            <div key={col.heading}>
              <h3 className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase mb-3">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#3a3a3a] dark:text-[#CCC] hover:text-[#D52B1E] dark:hover:text-[#D52B1E] transition-colors"
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
        <div className="pt-6 border-t border-[#E8E8E8] dark:border-[#2A2A2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[12px] text-[#999]">
            © {new Date().getFullYear()} Canada 247. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map(label => (
              <span key={label} className="text-[12px] text-[#999] hover:text-[#D52B1E] cursor-pointer transition-colors">{label}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
