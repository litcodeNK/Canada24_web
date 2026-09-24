/**
 * Single source of truth for the site's section navigation.
 *
 * Header, Footer and the mobile Sidebar all render from this list. They used
 * to each carry their own hardcoded copy, which is how the header ended up
 * showing the newcomer categories while the footer and mobile menu still
 * listed the old generic ones.
 *
 * Scoped to exactly the 6 categories in the mockup — no generic sections
 * (Politics, World, Business, Sports, etc.) are part of this site's nav or
 * homepage. Those RSS feeds may still run server-side (see the backend
 * report on that), but nothing in this frontend links to or renders them.
 *
 * `href: null` means there is no page behind the item yet — it renders as a
 * non-interactive "Soon" chip rather than a link to an empty section.
 */
export type SectionNavItem = {
  label: string;
  href: string | null;
  /** Accent colour used by the mobile sidebar's category dots. */
  color?: string;
};

export const SECTION_NAV: SectionNavItem[] = [
  { label: 'Immigration', href: '/sections/immigration', color: '#BF360C' },
  { label: 'Jobs & Money', href: '/sections/jobs-money', color: '#E65100' },
  { label: 'Housing', href: '/sections/housing', color: '#00695C' },
  { label: 'Auto', href: '/sections/auto', color: '#37474F' },
  { label: 'Settlement Guide', href: null },
  { label: 'Video', href: '/videos', color: '#D52B1E' },
];
