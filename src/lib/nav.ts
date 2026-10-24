/**
 * Single source of truth for the site's section navigation.
 *
 * Header, Footer and the mobile Sidebar all render from this list. They used
 * to each carry their own hardcoded copy, which is how the header ended up
 * showing the newcomer categories while the footer and mobile menu still
 * listed the old generic ones.
 *
 * Scoped to exactly the 5 categories in the top nav — no generic sections
 * (Politics, World, Business, Sports, etc.) are part of this site's nav or
 * homepage. Those RSS feeds may still run server-side (see the backend
 * report on that), but nothing in this frontend links to or renders them.
 */
export type SectionNavItem = {
  label: string;
  href: string;
  /** Accent colour used by the mobile sidebar's category dots. */
  color?: string;
  /** Sub-topics shown in the header dropdown; each links to `${href}?topic=…`. */
  topics?: string[];
  /** One-line blurb shown on the homepage category cards. */
  description?: string;
};

export const SECTION_NAV: SectionNavItem[] = [
  { label: 'Immigration', href: '/sections/immigration', color: '#BF360C', topics: ['Refugees', 'Policy', 'Study Permit', 'Work Permit', 'Citizenship'], description: 'Study permits, work permits, refugee and citizenship updates for newcomers.' },
  { label: 'Jobs & Money', href: '/sections/jobs-money', color: '#E65100', topics: ['Work Permits', 'Hiring', 'Careers', 'Credentials', 'Banking'], description: 'Hiring, careers, credentials and banking news to help you settle in.' },
  { label: 'Housing', href: '/sections/housing', color: '#00695C', topics: ['Renting', 'Buying', 'Mortgages', 'Market', 'Affordability'], description: 'Renting, buying, mortgages and affordability across Canada.' },
  { label: 'Settlement', href: '/sections/settlement', color: '#6A1B9A', topics: ['Newcomer Services', 'Language', 'Healthcare', 'Education', 'Community'], description: 'Settling in Canada: newcomer services, language, healthcare, schools and community.' },
  { label: 'Auto', href: '/sections/auto', color: '#37474F', topics: ['Buying', 'Insurance', 'EVs', 'Licensing', 'Reviews'], description: 'Buying, insurance, EVs and licensing for Canadian drivers.' },
  { label: 'Video', href: '/videos', color: '#D52B1E', description: 'Watch the latest news videos and live coverage.' },
];

export function topicHref(item: SectionNavItem, topic: string): string {
  return `${item.href}?topic=${encodeURIComponent(topic)}`;
}
