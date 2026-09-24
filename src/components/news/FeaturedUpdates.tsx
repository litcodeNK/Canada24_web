'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { Article } from '@/context/AppContext';
import { fetchCategoryArticles } from '@/services/newsService';

/* The three newcomer-facing categories from the mockup. `slug` is the URL the
   card links to; `apiSection` is what fetchCategoryArticles resolves against
   (it matches the backend's section *label*). */
const FEATURED_SECTIONS = [
  { slug: 'jobs-money', apiSection: 'jobs-money', label: 'Jobs & Money', badge: 'bg-[#E65100]' },
  { slug: 'housing', apiSection: 'housing', label: 'Housing', badge: 'bg-[#00695C]' },
  { slug: 'auto', apiSection: 'auto', label: 'Auto', badge: 'bg-[#37474F]' },
] as const;

function formatShortDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

export function FeaturedUpdates() {
  const [cards, setCards] = useState<{ section: (typeof FEATURED_SECTIONS)[number]; article: Article }[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      FEATURED_SECTIONS.map(section =>
        fetchCategoryArticles(section.apiSection)
          .then(articles => (articles.length > 0 ? { section, article: articles[0] } : null))
          .catch(() => null),
      ),
    ).then(results => {
      if (cancelled) return;
      // Categories with no articles yet are dropped rather than rendered as
      // empty placeholders — the grid shows only real content.
      setCards(results.filter((r): r is { section: (typeof FEATURED_SECTIONS)[number]; article: Article } => r !== null));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <section className="w-full" aria-label="Featured updates">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif font-black text-[22px] sm:text-[26px] text-[#1a1a1a] dark:text-[#F5F5F5] tracking-tight">
          Featured Updates
        </h2>
        <Link
          href="/sections"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-canadaRed hover:underline"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(({ section, article }) => {
          const date = formatShortDate(article.publishedAt);
          const readTime = article.readTimeMinutes && article.readTimeMinutes > 0
            ? `${article.readTimeMinutes} min read`
            : '';

          return (
            <Link
              key={section.slug}
              href={`/article/${article.id}`}
              className="group flex flex-col rounded-xl overflow-hidden border border-[#E8E8E8] dark:border-[#2A2A2A] hover:border-canadaRed dark:hover:border-canadaRed transition-colors"
            >
              <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-[#1C1C1C]">
                {article.imgUrl && (
                  <Image
                    src={article.imgUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                    loading="lazy"
                    unoptimized
                  />
                )}
                <span
                  className={`absolute top-2.5 left-2.5 ${section.badge} text-white text-[9.5px] font-bold tracking-wider uppercase px-2 py-1 rounded`}
                >
                  {section.label}
                </span>
              </div>

              <div className="flex flex-col flex-1 p-3.5">
                <h3 className="font-bold text-[14px] leading-snug text-[#1a1a1a] dark:text-[#F5F5F5] group-hover:text-canadaRed transition-colors line-clamp-2 mb-1.5">
                  {article.headline}
                </h3>

                {article.body && (
                  <p className="text-[12.5px] text-[#666] dark:text-[#AAA] leading-relaxed line-clamp-2 mb-3">
                    {article.body}
                  </p>
                )}

                <div className="mt-auto flex items-center gap-2 text-[11px] text-[#999]">
                  {date && <span>{date}</span>}
                  {date && readTime && <span className="text-[#E8E8E8] dark:text-[#444]">•</span>}
                  {readTime && <span>{readTime}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
