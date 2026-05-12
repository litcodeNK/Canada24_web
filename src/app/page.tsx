'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { LatestNewsRail } from '@/components/layout/LatestNewsRail';
import { HeroCard } from '@/components/news/HeroCard';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import { SectionBlock } from '@/components/news/SectionBlock';
import { useRouter } from 'next/navigation';
import { ArrowRight, Bell, Globe2, Newspaper, ShieldCheck } from 'lucide-react';
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
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && user && !onboardingComplete) router.replace('/onboarding/regions');
  }, [isAuthLoading, user, onboardingComplete, router]);

  if (isAuthLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0D0D0D]">
      <div className="w-8 h-8 border-2 border-canadaRed border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) {
    return <WelcomeScreen />;
  }

  if (!onboardingComplete) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0D0D0D]">
      <div className="w-8 h-8 border-2 border-canadaRed border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const [hero, ...rest] = topStories;
  const sectionChunks = chunk(rest.slice(0, 20), 5);
  const latestFeed = rest.slice(20, 30);

  /* Split sections across two columns */
  const leftChunks = sectionChunks.slice(0, 2);
  const middleChunks = sectionChunks.slice(2);

  return (
    <AppShell>
      <BreakingTicker articles={topStories} />

      {/* Advertisement label */}
      <div className="w-full text-center py-4">
        <span className="text-[11px] text-gray-400 font-sans tracking-wide">Advertisement</span>
      </div>

      {/* ── 3-column layout ── */}
      <main
        id="main-content"
        className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_320px] gap-6 xl:gap-8 pb-8"
      >

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col lg:border-r border-gray-300 dark:border-[#2A2A2A] lg:pr-6">

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
          {hero && <HeroCard article={hero} />}

          {/* Divider */}
          <div className="h-px bg-gray-300 dark:bg-[#2A2A2A] w-full mb-6" />

          {/* Left column section blocks */}
          {leftChunks.map((group, idx) => {
            const label = groupLabel(group);
            const color = sectionColor(group.find(a => a.category)?.category);
            const layout = idx % 2 === 0 ? 'standard' : 'wide-left';
            return (
              <SectionBlock key={idx} title={label} color={color} articles={group} layout={layout} />
            );
          })}
        </div>

        {/* ── MIDDLE COLUMN ── */}
        <div className="flex flex-col lg:border-r border-gray-300 dark:border-[#2A2A2A] lg:pr-6">

          {/* Middle section blocks */}
          {middleChunks.map((group, idx) => {
            const label = groupLabel(group);
            const color = sectionColor(group.find(a => a.category)?.category);
            const layout = idx % 2 === 0 ? 'wide-left' : 'standard';
            return (
              <SectionBlock key={idx} title={label} color={color} articles={group} layout={layout} />
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

          {/* Newsletter sign-up promo */}
          <div className="bg-[#F7F7F7] dark:bg-[#1C1C1C] border border-gray-300 dark:border-[#2A2A2A] p-5 mt-6">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-canadaRed mb-1 font-sans">Stay Informed</p>
            <h3 className="font-serif font-black text-xl leading-tight text-[#1a1a1a] dark:text-white mb-2">
              Canada News Daily Briefing
            </h3>
            <p className="font-sans text-[13px] text-[#666] dark:text-[#999] leading-snug mb-3">
              The top Canadian stories, every morning.
            </p>
            <Link
              href="/auth/email"
              className="block w-full text-center bg-canadaRed text-white text-[12px] font-bold tracking-wider uppercase py-2.5 hover:bg-canadaRedDark transition-colors font-sans"
            >
              Sign Up Free
            </Link>
          </div>
        </div>

        {/* ── RIGHT COLUMN — sticky rail, hidden below lg ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-[176px] sm:top-[216px]">
            <LatestNewsRail />
          </div>
        </aside>
      </main>

      {loadingNews && (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-canadaRed border-t-transparent rounded-full animate-spin" aria-label="Loading" />
        </div>
      )}
    </AppShell>
  );
}

function WelcomeScreen() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(213,43,30,0.16),_transparent_34%),linear-gradient(180deg,_#f8f1eb_0%,_#f2ece4_38%,_#ffffff_100%)] text-[#161616]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-black/10 pb-5">
          <div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.32em] text-[#9d3a2e]">Canada 24/7</p>
            <h1 className="mt-2 font-serif text-2xl font-black tracking-tight sm:text-3xl">The classic front page, rebuilt for live news.</h1>
          </div>
          <Link
            href="/auth/email"
            className="inline-flex items-center gap-2 rounded-full bg-[#d52b1e] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#b82418]"
          >
            Log In
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <div className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.35fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.28em] text-[#9d3a2e]">Morning Edition</p>
            <h2 className="max-w-3xl font-serif text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">
              Welcome to a cleaner, sharper Canada news briefing.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#4e4a45] sm:text-lg">
              Sign in first, then choose the regions and topics you actually care about. Your alerts and home feed will be configured after authentication, not before it.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/email"
                className="inline-flex items-center justify-center gap-2 rounded-none border border-[#d52b1e] bg-[#d52b1e] px-6 py-4 font-sans text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#b82418]"
              >
                Start With Email
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/videos"
                className="inline-flex items-center justify-center rounded-none border border-black/15 bg-white/70 px-6 py-4 font-sans text-sm font-bold uppercase tracking-[0.18em] text-[#161616] backdrop-blur transition-colors hover:bg-white"
              >
                Watch Video Feed
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <WelcomeFeature icon={Newspaper} label="Curated Front Page" text="A more classic editorial layout instead of a generic app splash." />
              <WelcomeFeature icon={Bell} label="Alerts After Login" text="Preferences move to the right moment: after the user is authenticated." />
              <WelcomeFeature icon={Globe2} label="Region-first Setup" text="Select cities, provinces, and topics only once the account session exists." />
            </div>
          </div>

          <div className="border border-black/10 bg-[#fffdf9] p-5 shadow-[0_30px_80px_rgba(28,23,20,0.10)]">
            <div className="border-b border-black/10 pb-4">
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-[#9d3a2e]">Top Story</p>
              <h3 className="mt-3 font-serif text-3xl font-black leading-tight">
                A more engineered welcome flow for readers, not a settings wall.
              </h3>
            </div>

            <div className="grid gap-4 py-5">
              <div className="border-l-4 border-[#d52b1e] pl-4">
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d3a2e]">What changed</p>
                <p className="mt-2 text-sm leading-6 text-[#403c37]">
                  Visitors now land on a proper welcome screen. Preferences and region selection only happen after successful email authentication.
                </p>
              </div>
              <div className="rounded-none border border-black/10 bg-[#f4efe9] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-[#d52b1e]" />
                  <div>
                    <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[#161616]">Post-auth setup</p>
                    <p className="mt-2 text-sm leading-6 text-[#4e4a45]">
                      The app now asks for preferences only after a valid account session exists, so selections can be attached to the user flow instead of an anonymous visitor.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-black/10 pt-4">
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-[#9d3a2e]">Edition Note</p>
              <p className="mt-2 text-sm leading-6 text-[#403c37]">
                This is the new top-level entry screen. After login, the user is taken into region and alert setup before the personalized feed opens.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function WelcomeFeature({
  icon: Icon,
  label,
  text,
}: {
  icon: typeof Newspaper;
  label: string;
  text: string;
}) {
  return (
    <div className="border border-black/10 bg-white/75 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-[#d52b1e]" />
      <p className="mt-3 font-sans text-xs font-bold uppercase tracking-[0.18em] text-[#161616]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#4e4a45]">{text}</p>
    </div>
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
      {article.imgUrl && (
        <div className="flex-shrink-0 w-16 h-11 overflow-hidden bg-gray-100 dark:bg-[#2A2A2A] hidden sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.imgUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
    </Link>
  );
}
