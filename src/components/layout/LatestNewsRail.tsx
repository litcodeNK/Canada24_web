'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { MapleLeaf } from '@/components/news/MapleLeaf';
import { useApp } from '@/context/AppContext';
import type { Article } from '@/context/AppContext';
import { fetchVideoFeed } from '@/services/newsService';
import { buildWatchHref, getEmbeddedVideoUrl } from '@/lib/video';
import type { VideoItem } from '@/types/video';

const SPONSORED = [
  {
    category: 'CANADA',
    title: 'Top Canadian travel destinations for summer 2025',
    img: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&q=80&w=150&h=150',
  },
  {
    category: 'HEALTH',
    title: 'How to stay healthy during Canadian winters',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150',
  },
  {
    category: 'BUSINESS',
    title: 'The best investment strategies for Canadians in 2025',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=150&h=150',
  },
  {
    category: 'LIVING',
    title: 'Housing market outlook: what buyers need to know',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=150&h=150',
  },
];

export function LatestNewsRail() {
  const { topStories } = useApp();
  const latestItems = topStories.slice(0, 16);
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
          CANADA NEWS LIVE
        </span>
        <div className="w-2 h-2 rounded-full bg-canadaRed ml-auto pulse-dot flex-shrink-0" aria-label="Live indicator" />
      </div>

      <div className="bg-black aspect-video relative overflow-hidden" role="region" aria-label="Live video player">
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
      <div className="flex flex-col">
        {latestItems.length > 0 ? (
          latestItems.map((item: Article, i: number) => (
            <div
              key={item.id}
              className="py-4 border-t border-dashed border-gray-300 dark:border-[#333] first:border-t-0"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <time
                  className="text-xs text-gray-500 font-mono tracking-wide uppercase"
                  dateTime={item.time}
                >
                  {item.time}
                </time>
              </div>
              <Link
                href={`/article/${item.id}`}
                className="font-serif font-bold text-[15px] leading-snug hover:text-blue-500 transition-colors hover-underline text-[#1a1a1a] dark:text-[#F5F5F5]"
              >
                {item.headline}
              </Link>
            </div>
          ))
        ) : (
          /* Placeholder skeleton while loading */
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="py-4 border-t border-dashed border-gray-300 first:border-t-0">
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

      {/* Select badge */}
      <div className="inline-flex items-center gap-1 border border-blue-500 rounded-full px-3 py-0.5 mb-4">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
        <span className="text-blue-500 font-bold text-xs tracking-wider">select</span>
      </div>

      {/* Sponsored items */}
      {/* TODO: Wire to backend — GET /api/sponsored — returns sponsored content items */}
      <div className="flex flex-col">
        {SPONSORED.map((item, i) => (
          <div
            key={i}
            className="py-4 border-t border-dashed border-gray-300 dark:border-[#333] flex gap-4 group cursor-pointer"
          >
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
                width={80}
                height={80}
              />
            </div>
            <div>
              <span className="text-[10px] text-blue-500 font-bold tracking-wider uppercase block mb-1">
                {item.category}
              </span>
              <p className="font-serif font-bold text-[15px] leading-snug group-hover:underline decoration-1 underline-offset-2 text-[#1a1a1a] dark:text-[#F5F5F5]">
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-3 border border-blue-500 text-blue-500 font-bold text-sm tracking-wide hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors mt-2">
        SEE ALL
      </button>
    </aside>
  );
}
