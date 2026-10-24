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
};

export const SECTION_NAV: SectionNavItem[] = [
  { label: 'Immigration', href: '/sections/immigration', color: '#BF360C', topics: ['Refugees', 'Policy', 'Study Permit', 'Work Permit', 'Citizenship'] },
  { label: 'Jobs & Money', href: '/sections/jobs-money', color: '#E65100', topics: ['Work Permits', 'Hiring', 'Careers', 'Credentials', 'Banking'] },
  { label: 'Housing', href: '/sections/housing', color: '#00695C', topics: ['Renting', 'Buying', 'Mortgages', 'Market', 'Affordability'] },
  { label: 'Auto', href: '/sections/auto', color: '#37474F', topics: ['Buying', 'Insurance', 'EVs', 'Licensing', 'Reviews'] },
  { label: 'Video', href: '/videos', color: '#D52B1E' },
];

export function topicHref(item: SectionNavItem, topic: string): string {
  return `${item.href}?topic=${encodeURIComponent(topic)}`;
}
