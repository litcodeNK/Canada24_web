'use client';

import { useEffect, useState } from 'react';
import type { Article } from '@/context/AppContext';
import { fetchCategoryArticles } from '@/services/newsService';
import { SectionBlock } from './SectionBlock';

/**
 * Category-specific homepage rows for the newcomer sections.
 *
 * The main feed is driven by /news/top-stories/, which returns the newest 20
 * articles overall. High-volume wire feeds (Global News, Financial Post)
 * publish so frequently that page one often spans well under an hour, so
 * lower-volume categories like Housing and Jobs & Money — the ones this site
 * exists for — never appear on the homepage at all even though they're in the
 * database. Fetching them per-category guarantees they surface regardless of
 * how noisy the mainstream feeds are.
 */
const NEWCOMER_SECTIONS = [
  { apiSection: 'immigration', title: 'IMMIGRATION', color: '#BF360C' },
  { apiSection: 'housing', title: 'HOUSING', color: '#00695C' },
  { apiSection: 'jobs-money', title: 'JOBS & MONEY', color: '#E65100' },
] as const;

export function NewcomerSections() {
  const [groups, setGroups] = useState<{ title: string; color: string; articles: Article[] }[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      NEWCOMER_SECTIONS.map(section =>
        fetchCategoryArticles(section.apiSection)
          .then(articles => ({ ...section, articles: articles.slice(0, 5) }))
          .catch(() => ({ ...section, articles: [] as Article[] })),
      ),
    ).then(results => {
      if (cancelled) return;
      // Drop empty categories rather than rendering a titled but empty block.
      setGroups(results.filter(g => g.articles.length > 0));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((group, idx) => (
        <SectionBlock
          key={group.title}
          title={group.title}
          color={group.color}
          articles={group.articles}
          layout={idx % 2 === 0 ? 'standard' : 'wide-left'}
        />
      ))}
    </>
  );
}
