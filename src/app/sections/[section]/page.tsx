'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { HeroCard } from '@/components/news/HeroCard';
import { SectionBlock } from '@/components/news/SectionBlock';
import { fetchCategoryArticles, sectionDisplayLabel } from '@/services/newsService';
import type { Article } from '@/context/AppContext';

const SECTION_COLORS: Record<string, string> = {
  POLITICS: '#1565C0', WORLD: '#00695C', BUSINESS: '#E65100',
  HEALTH: '#1B5E20', SPORTS: '#D52B1E', TECHNOLOGY: '#01579B',
  ENTERTAINMENT: '#880E4F', IMMIGRATION: '#BF360C', INDIGENOUS: '#4A148C',
  HOUSING: '#00695C', 'JOBS-MONEY': '#E65100', AUTO: '#37474F', 'AUTO-NEWS': '#37474F',
};

/* Keywords that place an article under a topic tab. Matched against headline
   and body; topics without an entry fall back to the topic name itself. */
const TOPIC_KEYWORDS: Record<string, string[]> = {
  Refugees: ['refugee', 'asylum', 'humanitarian'],
  Policy: ['policy', 'policies', 'ircc', 'minister', 'levels plan', 'regulation', 'legislation', 'bill c'],
  'Study Permit': ['study permit', 'student visa', 'international student', 'study in canada', 'pgwp'],
  'Work Permit': ['work permit', 'lmia', 'open work', 'temporary foreign', 'tfw'],
  'Work Permits': ['work permit', 'lmia', 'open work', 'temporary foreign', 'tfw'],
  Citizenship: ['citizenship', 'citizen', 'naturaliz'],
  Hiring: ['hiring', 'hire', 'job posting', 'job openings', 'vacanc', 'recruit', 'layoff'],
  Careers: ['career', 'job', 'employment', 'employer', 'workforce', 'wage', 'salary'],
  Credentials: ['credential', 'certif', 'licen', 'degree', 'recognition'],
  Banking: ['bank', 'credit', 'loan', 'interest rate', 'savings', 'tfsa', 'rrsp', 'tax'],
  Renting: ['rent', 'tenant', 'landlord', 'lease'],
  Buying: ['buy', 'purchase', 'homebuyer', 'first-time', 'price', 'sales'],
  Mortgages: ['mortgage', 'down payment', 'interest rate', 'lender'],
  Market: ['market', 'prices', 'sales', 'inventory', 'listings'],
  Affordability: ['afford', 'cost', 'inflation', 'cost of living', 'crisis'],
  Insurance: ['insurance', 'insurer', 'premium'],
  EVs: ['ev', 'electric', 'hybrid', 'battery', 'charging', 'tesla'],
  Licensing: ['licen', 'driver', 'road test', 'registration', 'g1', 'g2'],
  Reviews: ['review', 'first drive', 'tested', 'test drive', 'versus', ' vs '],
};

function matchesTopic(article: Article, topic: string): boolean {
  const haystack = `${article.headline} ${article.body ?? ''}`.toLowerCase();
  const keywords = TOPIC_KEYWORDS[topic] ?? [topic.toLowerCase()];
  return keywords.some(k => (k.length <= 3 ? new RegExp(`\\b${k}\\b`).test(haystack) : haystack.includes(k)));
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function SectionDetail() {
  const params = useParams();
  const section = decodeURIComponent(params.section as string);
  /* Slug-derived key drives the colour/topic lookups below; the display label
     is resolved separately so "jobs-money" reads as "JOBS & MONEY". */
  const sectionKey = section.toUpperCase();
  const sectionUpper = sectionDisplayLabel(section).toUpperCase();
  const color = SECTION_COLORS[sectionKey] ?? '#D52B1E';
  const topicParam = useSearchParams().get('topic');

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const activeTopic = topicParam;

  useEffect(() => {
    setLoading(true);
    fetchCategoryArticles(section)
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [section]);

  const visibleArticles = activeTopic ? articles.filter(a => matchesTopic(a, activeTopic)) : articles;
  const [hero, ...rest] = visibleArticles;
  const sectionChunks = chunk(rest, 5);

  return (
    <AppShell>
      {/* Section header strip */}
      <div
        className="border-b-2"
        style={{ borderColor: color }}
      >
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-5 pb-0">
          <div className="flex items-baseline gap-3 mb-3">
            <Link href="/sections" className="text-[#999] hover:text-[#1a1a1a] dark:hover:text-white transition-colors text-sm">
              Categories
            </Link>
            <span className="text-[#CCC] dark:text-[#555]">›</span>
            <h1
              className="bebas tracking-[0.08em] text-[1.6rem] leading-none"
              style={{ color }}
            >
              {sectionUpper}
            </h1>
            {activeTopic && (
              <>
                <span className="text-[#CCC] dark:text-[#555]">›</span>
                <span className="font-sans font-bold text-sm uppercase tracking-wider text-[#1a1a1a] dark:text-white">{activeTopic}</span>
                <Link href={`/sections/${encodeURIComponent(section)}`} className="text-xs text-[#999] hover:underline" aria-label="Clear topic filter">
                  ✕ Clear
                </Link>
              </>
            )}
          </div>

        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: color }} />
          </div>
        ) : visibleArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <p className="bebas tracking-widest text-[#999] text-xl mb-2">NO ARTICLES</p>
            <p className="text-[#999] text-sm">
              {activeTopic ? `No ${activeTopic} stories right now.` : `Check back soon for ${sectionUpper} coverage.`}
            </p>
            {activeTopic && (
              <Link href={`/sections/${encodeURIComponent(section)}`} className="mt-3 text-sm font-semibold underline" style={{ color }}>
                Show all {sectionUpper} stories
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Hero story */}
            {hero && (
              <div className="mt-6 pb-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
                <HeroCard article={hero} />
              </div>
            )}

            {/* Section blocks */}
            {sectionChunks.map((group, idx) => (
              <SectionBlock
                key={idx}
                title={sectionUpper}
                color={color}
                articles={group}
                layout={idx % 2 === 0 ? 'standard' : 'wide-left'}
              />
            ))}
          </>
        )}
      </div>
    </AppShell>
  );
}

export default function SectionDetailPage() {
  return (
    <Suspense fallback={null}>
      <SectionDetail />
    </Suspense>
  );
}
