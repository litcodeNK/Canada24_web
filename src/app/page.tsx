'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { getDirectVideoUrl, getEmbeddedVideoUrl } from '@/lib/video';
import { AppShell } from '@/components/layout/AppShell';
import { LatestNewsRail } from '@/components/layout/LatestNewsRail';
import { HeroCard } from '@/components/news/HeroCard';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import { SectionBlock } from '@/components/news/SectionBlock';
import { useRouter } from 'next/navigation';
import { fetchVideoFeed } from '@/services/newsService';
import type { Article } from '@/context/AppContext';
import type { VideoItem } from '@/types/video';

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
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (!showWelcome && !isAuthLoading && user && !onboardingComplete) router.replace('/onboarding/regions');
  }, [showWelcome, isAuthLoading, user, onboardingComplete, router]);

  if (isAuthLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0D0D0D]">
      <div className="w-8 h-8 border-2 border-canadaRed border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (showWelcome) {
    return (
      <WelcomeScreen
        isAuthenticated={Boolean(user)}
        onContinue={() => setShowWelcome(false)}
      />
    );
  }

  if (user && !onboardingComplete) return (
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

function WelcomeScreen({
  isAuthenticated,
  onContinue,
}: {
  isAuthenticated: boolean;
  onContinue: () => void;
}) {
  const [backgroundVideo, setBackgroundVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    fetchVideoFeed()
      .then(feed => {
        setBackgroundVideo(feed.trending[0] ?? feed.live[0] ?? null);
      })
      .catch(() => setBackgroundVideo(null));
  }, []);

  const directVideoUrl = backgroundVideo ? getDirectVideoUrl(backgroundVideo) : null;
  const embedUrl = backgroundVideo ? getBackgroundVideoUrl(backgroundVideo) : null;

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#060606] text-white">
      <div className="absolute inset-0">
        {directVideoUrl ? (
          <video
            src={directVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            poster={backgroundVideo?.imgUrl}
            className="h-full w-full object-cover opacity-55"
          />
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            title={backgroundVideo?.title ?? 'Canada 24/7 background video'}
            className="h-full w-full scale-[1.2] opacity-60 pointer-events-none"
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        ) : backgroundVideo?.imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backgroundVideo.imgUrl} alt="" className="h-full w-full object-cover opacity-55" />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,0.2)_0%,rgba(5,5,5,0.5)_38%,rgba(5,5,5,0.82)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(213,43,30,0.18),transparent_42%)]" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-7 pb-10 pt-12 text-center">
        <div className="flex-1">
          <div className="mx-auto h-[72px] w-[180px] rounded-full overflow-hidden">
            <Image
              src="/canada247-logo.jpg"
              alt="Canada 24/7"
              width={180}
              height={72}
              priority
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-16">
            <h1 className="font-sans text-[42px] font-black leading-[1.02] tracking-[-0.04em] text-white">
              Stay close to
              <br />
              the stories
              <br />
              shaping Canada
            </h1>
            <p className="mx-auto mt-6 max-w-[310px] text-lg leading-7 text-white/82">
              Welcome to a sharper daily briefing built for readers who want clarity, urgency, and a stronger sense of what matters next.
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

function getBackgroundVideoUrl(item: VideoItem): string | null {
  const embedUrl = getEmbeddedVideoUrl(item);
  if (!embedUrl) return null;

  try {
    const parsed = new URL(embedUrl);

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean).pop();
      parsed.searchParams.set('autoplay', '1');
      parsed.searchParams.set('mute', '1');
      parsed.searchParams.set('controls', '0');
      parsed.searchParams.set('loop', '1');
      parsed.searchParams.set('playsinline', '1');
      if (videoId) parsed.searchParams.set('playlist', videoId);
      return parsed.toString();
    }

    if (parsed.hostname.includes('tiktok.com')) {
      parsed.searchParams.set('autoplay', '1');
      parsed.searchParams.set('description', '0');
      parsed.searchParams.set('controls', '0');
      parsed.searchParams.set('music_info', '0');
      return parsed.toString();
    }

    return parsed.toString();
  } catch {
    return embedUrl;
  }
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
