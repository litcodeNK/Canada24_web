'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { HeroCard } from '@/components/news/HeroCard';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import { SectionBlock } from '@/components/news/SectionBlock';
import { useRouter } from 'next/navigation';
import type { Article } from '@/context/AppContext';

const CATEGORY_COLORS: Record<string, string> = {
  POLITICS: '#1565C0', WORLD: '#00695C', BUSINESS: '#E65100',
  HEALTH: '#1B5E20', SPORTS: '#D52B1E', TECHNOLOGY: '#01579B',
  ENTERTAINMENT: '#880E4F', IMMIGRATION: '#BF360C', INDIGENOUS: '#4A148C',
  DEFAULT: '#D52B1E',
};

function sectionColor(cat?: string) {
  return CATEGORY_COLORS[(cat ?? '').toUpperCase()] ?? CATEGORY_COLORS.DEFAULT;
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function groupLabel(articles: Article[]): string {
  const counts: Record<string, number> = {};
  for (const a of articles) if (a.category) counts[a.category] = (counts[a.category] ?? 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : 'TOP STORIES';
}

export default function TopStoriesPage() {
  const { topStories, communityStories, loadingNews, refreshNews, onboardingComplete } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!onboardingComplete) router.replace('/onboarding/regions');
  }, [onboardingComplete, router]);

  if (!onboardingComplete) return null;

  const [hero, ...rest] = topStories;
  const sectionChunks = chunk(rest.slice(0, 20), 5);
  const latestFeed = rest.slice(20, 30);

  /* Most Popular: top-liked articles for sidebar */
  const mostPopular = [...topStories]
    .sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0))
    .slice(0, 6);

  return (
    <AppShell>
      <BreakingTicker articles={topStories} />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">

        {/* Date + refresh row */}
        <div className="flex items-center justify-between py-3 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
          <p className="text-[11px] text-[#999] uppercase tracking-wider font-semibold">
            {new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <button
            onClick={refreshNews}
            disabled={loadingNews}
            className="text-[11px] text-[#999] flex items-center gap-1.5 hover:text-[#D52B1E] transition-colors disabled:opacity-50 font-medium tracking-wide uppercase"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={loadingNews ? 'animate-spin' : ''}>
              <polyline points="23,4 23,10 17,10"/>
              <polyline points="1,20 1,14 7,14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {loadingNews ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* ── HERO STORY ── */}
        {hero && (
          <div className="mt-6 pb-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
            <HeroCard article={hero} />
          </div>
        )}

        {/* ── MAIN CONTENT + SIDEBAR ── */}
        <div className="xl:grid xl:grid-cols-[1fr_300px] xl:gap-10">

          {/* Left: section blocks */}
          <div>
            {sectionChunks.map((group, idx) => {
              const label = groupLabel(group);
              const color = sectionColor(group.find(a => a.category)?.category);
              const layout = idx % 2 === 0 ? 'standard' : 'wide-left';
              return (
                <SectionBlock
                  key={idx}
                  title={label}
                  color={color}
                  articles={group}
                  layout={layout}
                />
              );
            })}

            {/* Community stories */}
            {communityStories.length > 0 && (
              <SectionBlock
                title="COMMUNITY"
                color="#6A1B9A"
                articles={communityStories.slice(0, 5)}
                layout="standard"
              />
            )}

            {/* Latest feed */}
            {latestFeed.length > 0 && (
              <section className="py-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
                <div className="flex items-center justify-between mb-5 border-b border-[#E8E8E8] dark:border-[#2A2A2A] pb-3">
                  <h2 className="text-[1.2rem] sm:text-[1.35rem] font-extrabold leading-none tracking-tight text-[#D52B1E]">
                    Latest
                  </h2>
                  <Link href="/" className="text-[12px] font-semibold text-[#D52B1E] hover:underline tracking-wide uppercase">
                    See all →
                  </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
                  {latestFeed.map(article => (
                    <LatestItem key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: sticky sidebar (desktop xl+) */}
          {mostPopular.length > 0 && (
            <aside className="hidden xl:block">
              <div className="sticky top-[120px] space-y-6">
                {/* Most Popular */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
                    <h3 className="text-[1rem] font-extrabold tracking-tight text-[#1a1a1a] dark:text-white">
                      Most Popular
                    </h3>
                  </div>
                  <ol className="space-y-0">
                    {mostPopular.map((article, idx) => (
                      <li key={article.id}>
                        <Link
                          href={`/article/${article.id}`}
                          className="group flex items-start gap-3 py-3.5 border-b border-[#E8E8E8] dark:border-[#2A2A2A] last:border-0"
                        >
                          <span
                            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[11px] font-extrabold mt-0.5"
                            style={{ color: idx === 0 ? '#D52B1E' : '#CCC' }}
                          >
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            {article.category && (
                              <span className="category-label block mb-0.5">{article.category}</span>
                            )}
                            <h4 className="font-bold text-[#1a1a1a] dark:text-[#F5F5F5] text-[13px] leading-snug group-hover:text-[#D52B1E] transition-colors line-clamp-3">
                              {article.headline}
                            </h4>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Newsletter sign-up promo block */}
                <div className="bg-[#F7F7F7] dark:bg-[#1C1C1C] border border-[#E8E8E8] dark:border-[#2A2A2A] p-5">
                  <p className="bebas tracking-[0.1em] text-[#D52B1E] text-sm mb-1">STAY INFORMED</p>
                  <h4 className="font-extrabold text-[#1a1a1a] dark:text-white text-[1rem] leading-tight mb-2">
                    Canada 247 Daily Briefing
                  </h4>
                  <p className="text-[13px] text-[#666] dark:text-[#999] leading-snug mb-3">
                    The top Canadian stories, every morning.
                  </p>
                  <Link
                    href="/auth/email"
                    className="block w-full text-center bg-[#D52B1E] text-white text-[12px] font-bold tracking-wider uppercase py-2.5 hover:bg-[#B02010] transition-colors"
                  >
                    Sign Up Free
                  </Link>
                </div>

                {/* Section quick links */}
                <div>
                  <div className="flex items-center mb-3 pb-2 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
                    <h3 className="text-[1rem] font-extrabold tracking-tight text-[#1a1a1a] dark:text-white">Sections</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { href: '/sections/politics', label: 'Politics', color: '#1565C0' },
                      { href: '/sections/world', label: 'World', color: '#00695C' },
                      { href: '/sections/business', label: 'Business', color: '#E65100' },
                      { href: '/sections/health', label: 'Health', color: '#1B5E20' },
                      { href: '/sections/sports', label: 'Sports', color: '#D52B1E' },
                      { href: '/sections/technology', label: 'Tech', color: '#01579B' },
                      { href: '/sections/entertainment', label: 'Entertainment', color: '#880E4F' },
                      { href: '/sections/immigration', label: 'Immigration', color: '#BF360C' },
                    ].map(({ href, label, color }) => (
                      <Link
                        key={href}
                        href={href}
                        className="text-[12px] font-semibold hover:underline transition-colors py-0.5"
                        style={{ color }}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>

        {loadingNews && (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-2 border-[#D52B1E] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

      </div>
    </AppShell>
  );
}

function LatestItem({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`} className="group flex items-start gap-3 py-3 border-b border-[#E8E8E8] dark:border-[#2A2A2A] last:border-b-0">
      <div className="flex-shrink-0 pt-0.5 w-14">
        <span className="text-[11px] text-[#999] whitespace-nowrap">{article.time}</span>
      </div>
      <div className="flex-1 min-w-0">
        {article.category && (
          <span className="category-label block mb-0.5">{article.category}</span>
        )}
        <h3 className="font-bold text-[#1a1a1a] dark:text-[#F5F5F5] text-[14px] leading-snug group-hover:text-[#D52B1E] transition-colors line-clamp-2">
          {article.headline}
        </h3>
      </div>
      {article.imgUrl && (
        <div className="flex-shrink-0 w-16 h-11 overflow-hidden bg-gray-100 dark:bg-[#2A2A2A] hidden sm:block">
          <img src={article.imgUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
    </Link>
  );
}
