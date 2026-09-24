/**
 * Single source of truth for the site's section navigation.
 *
 * Header, Footer and the mobile Sidebar all render from this list. They used
 * to each carry their own hardcoded copy, which is how the header ended up
 * showing the newcomer categories while the footer and mobile menu still
 * listed the old generic ones.
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

/** Sections that exist in the backend but aren't in the primary nav. Kept for
 *  the footer/sidebar "More" lists so that coverage stays reachable. */
export const SECONDARY_SECTION_NAV: SectionNavItem[] = [
  { label: 'Top Stories', href: '/', color: '#D52B1E' },
  { label: 'Local News', href: '/local', color: '#1565C0' },
  { label: 'Politics', href: '/sections/politics', color: '#1565C0' },
  { label: 'World', href: '/sections/world', color: '#00695C' },
  { label: 'Business', href: '/sections/business', color: '#E65100' },
  { label: 'Health', href: '/sections/health', color: '#1B5E20' },
  { label: 'Technology', href: '/sections/technology', color: '#01579B' },
  { label: 'Sports', href: '/sections/sports', color: '#D52B1E' },
  { label: 'Entertainment', href: '/sections/entertainment', color: '#880E4F' },
  { label: 'Indigenous', href: '/sections/indigenous', color: '#4A148C' },
  { label: 'Education', href: '/sections/education', color: '#01579B' },
  { label: 'Aviation', href: '/sections/aviation', color: '#0277BD' },
  { label: 'Blacks in Canada', href: '/sections/blacks-in-canada', color: '#5D4037' },
];
