'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp, DEFAULT_ARTICLE_IMAGE } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { LatestNewsRail } from '@/components/layout/LatestNewsRail';
import { HomeHero } from '@/components/news/HomeHero';
import { FeaturedUpdates } from '@/components/news/FeaturedUpdates';
import { ImmigrationByProvince } from '@/components/news/ImmigrationByProvince';
import { LatestVideos } from '@/components/news/LatestVideos';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import { SectionBlock } from '@/components/news/SectionBlock';
import { fetchCategoryArticles } from '@/services/newsService';
import { SECTION_NAV } from '@/lib/nav';
import { useRouter } from 'next/navigation';
import type { Article } from '@/context/AppContext';

/**
 * Categories shown on the homepage — deliberately just the 4 real-news items
 * from SECTION_NAV (Video has no articles of its own; Settlement Guide has
 * no page at all yet). Everything the homepage renders (hero, section rows,
 * the Trending strip, the right-rail "Latest News" list) is built from these
 * fetches, not from the unfiltered /news/top-stories/ feed — that endpoint
 * spans all ~16 backend categories, which is exactly what this site's nav no
 * longer surfaces.
 */
const HOMEPAGE_SECTIONS = SECTION_NAV.filter(
  (item): item is typeof item & { href: string } => item.href !== null && item.href.startsWith('/sections/'),
);

export default function TopStoriesPage() {
  const { topStories, communityStories, loadingNews, refreshNews, onboardingComplete, hasSeenWelcome, completeWelcome, appReady } = useApp();
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();

  // Homepage content is scoped to the 4 real-news mockup categories, fetched
  // directly rather than filtered client-side from topStories — topStories
  // stays unfiltered because other consumers (search, saved-article lookup,
  // the article detail page's cache) need every category, not just these 4.
  const [categoryArticles, setCategoryArticles] = useState<Record<string, Article[]>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      HOMEPAGE_SECTIONS.map(section =>
        fetchCategoryArticles(section.href.replace('/sections/', ''))
          .then(articles => [section.label, articles] as const)
          .catch(() => [section.label, [] as Article[]] as const),
      ),
    ).then(entries => {
      if (!cancelled) setCategoryArticles(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (appReady && hasSeenWelcome && !isAuthLoading && user && !onboardingComplete) router.replace('/onboarding/regions');
  }, [appReady, hasSeenWelcome, isAuthLoading, user, onboardingComplete, router]);

  if (!appReady || isAuthLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0D0D0D]">
      <div className="w-8 h-8 border-2 border-canadaRed border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!hasSeenWelcome) {
    return (
      <WelcomeScreen
        isAuthenticated={Boolean(user)}
        onContinue={completeWelcome}
      />
    );
  }

  if (user && !onboardingComplete) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0D0D0D]">
      <div className="w-8 h-8 border-2 border-canadaRed border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Merge the 4 categories into one feed for the hero/Trending/Latest-News
  // rail, sorted newest first — each article has exactly one category, so
  // there's no cross-category duplication to worry about.
  const homeArticles = Object.values(categoryArticles)
    .flat()
    .sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime());

  const [hero, ...rest] = homeArticles;
  const latestFeed = rest.slice(0, 10);
  const heroId = hero?.id;

  const leftSections = HOMEPAGE_SECTIONS.slice(0, 2);
  const middleSections = HOMEPAGE_SECTIONS.slice(2);

  return (
    <AppShell>
      <BreakingTicker articles={homeArticles} />

      {/* Advertisement label */}
      <div className="w-full text-center py-4">
        <span className="text-[11px] text-gray-400 font-sans tracking-wide">Advertisement</span>
      </div>

      {/* ── 3-column layout ── */}
      <main
        id="main-content"
        className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_320px] gap-6 xl:gap-8 pb-8 overflow-x-hidden"
      >

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col min-w-0 lg:border-r border-gray-300 dark:border-[#2A2A2A] lg:pr-6">

          {/* Date + refresh row */}
          <div className="flex items-center justify-between py-3 border-b border-gray-300 dark:border-[#2A2A2A] mb-6">
            <p className="text-[11px] text-[#999] uppercase tracking-wider font-semibold font-sans">
              <time dateTime={new Date().toISOString()}>
                {new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </p>
            <button
              onClick={refreshNews}
              disabled={loadingNews}
              className="text-[11px] text-[#999] flex items-center gap-1.5 hover:text-canadaRed transition-colors disabled:opacity-50 font-medium tracking-wide uppercase font-sans"
              aria-label={loadingNews ? 'Refreshing news' : 'Refresh news'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={loadingNews ? 'animate-spin' : ''} aria-hidden="true">
                <polyline points="23,4 23,10 17,10"/>
                <polyline points="1,20 1,14 7,14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              {loadingNews ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {/* Hero story */}
          {hero && <HomeHero article={hero} />}

          <div className="mt-8">
            <ImmigrationByProvince />
          </div>

          <div className="mt-8">
            <FeaturedUpdates />
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-300 dark:bg-[#2A2A2A] w-full mb-6" />

          {/* One SectionBlock per mockup category — the hero's own article is
              excluded so it isn't repeated immediately below itself. */}
          {leftSections.map((section, idx) => {
            const articles = (categoryArticles[section.label] ?? []).filter(a => a.id !== heroId);
            return (
              <SectionBlock
                key={section.label}
                title={section.label.toUpperCase()}
                color={section.color ?? '#D52B1E'}
                articles={articles}
                layout={idx % 2 === 0 ? 'standard' : 'wide-left'}
              />
            );
          })}
        </div>

        {/* ── MIDDLE COLUMN ── */}
        <div className="flex flex-col min-w-0 lg:border-r border-gray-300 dark:border-[#2A2A2A] lg:pr-6">

          {/* Middle section blocks */}
          {middleSections.map((section, idx) => {
            const articles = (categoryArticles[section.label] ?? []).filter(a => a.id !== heroId);
            return (
              <SectionBlock
                key={section.label}
                title={section.label.toUpperCase()}
                color={section.color ?? '#D52B1E'}
                articles={articles}
                layout={idx % 2 === 0 ? 'wide-left' : 'standard'}
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
            <section className="py-6 border-b border-dashed border-gray-300 dark:border-[#2A2A2A]">
              <div className="mb-5">
                <div className="w-12 h-1 bg-blue-500 mb-3" />
                <div className="flex items-center justify-between pb-3 border-b border-gray-300 dark:border-[#2A2A2A]">
                  <h2 className="font-sans font-bold text-lg tracking-wide text-[#1a1a1a] dark:text-white">
                    LATEST
                  </h2>
                  <Link href="/" className="text-[12px] font-semibold text-blue-500 hover:underline tracking-wide uppercase font-sans">
                    See all →
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-0">
                {latestFeed.map(article => (
                  <LatestItem key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Newsletter sign-up promo — classic framed newspaper call-out box (signed-out visitors only) */}
          {!user && (
            <div className="border-2 border-[#1a1a1a] dark:border-white/25 bg-white dark:bg-[#1C1C1C] p-6 mt-6 text-center">
              <Image
                src="/canada247-logo.png"
                alt="Canada 247"
                width={686}
                height={583}
                className="h-12 w-auto object-contain mx-auto mb-3"
              />
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-canadaRed mb-2 font-sans">
                Stay Informed
              </p>
              <h3 className="font-serif font-black text-xl leading-tight text-[#1a1a1a] dark:text-white mb-2">
                Canada News Daily Briefing
              </h3>
              <div className="w-10 h-px bg-canadaRed mx-auto mb-3" />
              <p className="font-serif italic text-[14px] text-[#666] dark:text-[#999] leading-relaxed mb-5">
                The top Canadian stories, every morning.
              </p>
              <Link
                href="/auth/email"
                className="inline-block border-2 border-canadaRed text-canadaRed text-[12px] font-bold tracking-[0.15em] uppercase px-8 py-2.5 hover:bg-canadaRed hover:text-white transition-colors font-sans"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — sticky rail, hidden below lg ── */}
        <aside className="hidden lg:block min-w-0">
          <div className="sticky top-[176px] sm:top-[216px]">
            <LatestNewsRail articles={homeArticles} />
          </div>
        </aside>
      </main>

      <LatestVideos />

      {loadingNews && (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-canadaRed border-t-transparent rounded-full animate-spin" aria-label="Loading" />
        </div>
      )}
    </AppShell>
  );
}

function WelcomeScreen({
  isAuthenticated,
  onContinue,
}: {
  isAuthenticated: boolean;
  onContinue: () => void;
}) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#060606] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(213,43,30,0.16),transparent_46%)]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-7 pb-10 pt-12 text-center">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Image
            src="/canada247-logo.png"
            alt="Canada 24/7"
            width={686}
            height={583}
            priority
            className="mx-auto h-[110px] w-auto object-contain drop-shadow-lg"
          />

          <div className="mt-10">
            <h1 className="font-sans text-[38px] font-black leading-[1.05] tracking-[-0.03em] text-white">
              News. Updates.
              <br />
              Canada. Always.
            </h1>
            <p className="mx-auto mt-5 max-w-[300px] text-base leading-7 text-white/75">
              We&rsquo;ve got you covered — a sharper daily briefing built for readers who want clarity and a stronger sense of what matters next.
            </p>
          </div>
        </div>

        {isAuthenticated ? (
          <button
            onClick={onContinue}
            className="block w-full rounded-[18px] bg-[#ff2b23] px-6 py-4 text-center text-[18px] font-bold text-white transition-colors hover:bg-[#e2251e]"
          >
            Continue to view news
          </button>
        ) : (
          <div className="space-y-4">
            <Link
              href="/auth/email"
              className="block w-full rounded-[18px] bg-[#ff2b23] px-6 py-4 text-center text-[18px] font-bold text-white transition-colors hover:bg-[#e2251e]"
            >
              Sign in
            </Link>
            <Link
              href="/auth/email"
              className="block w-full rounded-[18px] bg-white px-6 py-4 text-center text-[18px] font-bold text-[#111111] transition-colors hover:bg-[#f1f1f1]"
            >
              Create a free account
            </Link>
            <button
              onClick={onContinue}
              className="pt-2 text-sm font-medium text-white/62 transition-colors hover:text-white"
            >
              Skip for now
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function LatestItem({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex items-start gap-3 py-4 border-t border-dashed border-gray-300 dark:border-[#2A2A2A] first:border-t-0"
    >
      <div className="flex-shrink-0 pt-0.5 w-14">
        <time className="text-[11px] text-[#999] whitespace-nowrap font-sans" dateTime={article.time}>
          {article.time}
        </time>
      </div>
      <div className="flex-1 min-w-0">
        {article.category && (
          <span className="category-label block mb-0.5">{article.category}</span>
        )}
        <h3 className="font-serif font-bold text-[15px] leading-snug text-[#1a1a1a] dark:text-[#F5F5F5] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors line-clamp-2">
          {article.headline}
        </h3>
      </div>
      <div className="flex-shrink-0 w-16 h-11 overflow-hidden bg-gray-100 dark:bg-[#2A2A2A] hidden sm:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.imgUrl || DEFAULT_ARTICLE_IMAGE} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
    </Link>
  );
}
