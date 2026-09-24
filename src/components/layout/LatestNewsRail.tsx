'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { MapleLeaf } from '@/components/news/MapleLeaf';
import { useApp } from '@/context/AppContext';
import type { Article } from '@/context/AppContext';
import { fetchVideoFeed } from '@/services/newsService';
import { buildWatchHref, getEmbeddedVideoUrl } from '@/lib/video';
import type { VideoItem } from '@/types/video';

export function LatestNewsRail({ articles }: { articles?: Article[] } = {}) {
  const { topStories } = useApp();
  // Homepage passes its own category-scoped list; falls back to the
  // unfiltered feed for safety if this is ever rendered without one.
  const latestItems = (articles ?? topStories).slice(0, 16);
  const [featuredVideo, setFeaturedVideo] = useState<VideoItem | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(true);

  useEffect(() => {
    fetchVideoFeed()
      .then(feed => {
        setFeaturedVideo(feed.live[0] ?? feed.trending[0] ?? null);
      })
      .catch(() => setFeaturedVideo(null))
      .finally(() => setLoadingVideo(false));
  }, []);

  const embeddedVideoUrl = featuredVideo ? getEmbeddedVideoUrl(featuredVideo) : null;
  const watchHref = featuredVideo ? buildWatchHref(featuredVideo) : '/videos';

  return (
    <aside className="w-full" aria-label="Latest news">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <MapleLeaf className="w-6 h-6 flex-shrink-0" />
        <span className="font-display font-black text-xl tracking-tight text-[#1a1a1a] dark:text-white">
          CANADA NEWS
        </span>
        <div className="w-2 h-2 rounded-full bg-canadaRed ml-auto pulse-dot flex-shrink-0" aria-label="Live indicator" />
      </div>

      <div className="bg-black aspect-video relative overflow-hidden rounded-xl" role="region" aria-label="Video player">
        {loadingVideo ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <LoaderCircle className="w-8 h-8 animate-spin" />
          </div>
        ) : embeddedVideoUrl ? (
          <iframe
            src={embeddedVideoUrl}
            title={featuredVideo?.title ?? 'Canada News video'}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <Link
            href="/videos"
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1b1b1b] to-black text-center px-6"
          >
            <div>
              <p className="text-white font-bold text-lg">No featured video yet</p>
              <p className="text-gray-400 text-sm mt-2">Open the video feed for the latest coverage</p>
            </div>
          </Link>
        )}
      </div>

      {/* Live status */}
      <div className="mt-3 mb-6">
        <p className="font-serif font-bold text-[17px] leading-snug text-[#1a1a1a] dark:text-white">
          <span className="text-red-600 mr-1">• {featuredVideo?.isLive ? 'Live /' : 'Video /'}</span>
          {featuredVideo?.title ?? 'Stay Tuned — Canada News Now'}
        </p>
        <Link href={watchHref} className="inline-block mt-2 text-sm font-semibold text-blue-500 hover:underline">
          Open player
        </Link>
      </div>

      {/* Blue accent divider */}
      <div className="w-12 h-1 bg-blue-500 mb-4" />

      <h2 className="font-sans font-bold text-lg tracking-wide mb-4 text-[#1a1a1a] dark:text-white">
        LATEST NEWS
      </h2>

      {/* News items list */}
      <div className="flex flex-col gap-3">
        {latestItems.length > 0 ? (
          latestItems.map((item: Article, i: number) => (
            <Link
              key={item.id}
              href={`/article/${item.id}`}
              className="block p-4 rounded-xl bg-oxfordBlue dark:bg-oxfordBlueDark hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                <time
                  className="text-xs text-white/70 font-mono tracking-wide uppercase"
                  dateTime={item.time}
                >
                  {item.time}
                </time>
              </div>
              <p className="font-serif font-bold text-[15px] leading-snug text-white">
                {item.headline}
              </p>
            </Link>
          ))
        ) : (
          /* Placeholder skeleton while loading */
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-oxfordBlue/20 dark:bg-oxfordBlueDark/30">
              <div className="skeleton h-3 w-16 mb-2 rounded" />
              <div className="skeleton h-4 w-full rounded mb-1" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ))
        )}
      </div>

      <button className="w-full py-3 border border-blue-500 text-blue-500 font-bold text-sm tracking-wide hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors mt-2 mb-6">
        SEE MORE
      </button>

    </aside>
  );
}
