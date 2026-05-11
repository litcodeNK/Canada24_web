'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { fetchVideoFeed } from '@/services/newsService';
import type { VideoFeed, VideoItem } from '@/types/video';
import { buildWatchHref } from '@/lib/video';

export default function VideoFeedPage() {
  const [feed, setFeed] = useState<VideoFeed>({ trending: [], live: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideoFeed()
      .then(setFeed)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <div className="w-1 h-4 bg-[#D52B1E] rounded" />
        <h1 className="bebas tracking-widest text-base dark:text-white">VIDEO FEED</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#D52B1E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {feed.trending.length > 0 && (
            <section className="mb-6">
              <div className="px-4 py-2">
                <h2 className="bebas tracking-widest text-sm text-gray-500 dark:text-gray-400">TRENDING VIDEO</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
                {feed.trending.map(item => <VideoCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

          {feed.live.length > 0 && (
            <section>
              <div className="px-4 py-2">
                <h2 className="bebas tracking-widest text-sm text-gray-500 dark:text-gray-400">LIVE COVERAGE</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
                {feed.live.map(item => <VideoCard key={item.id} item={item} live />)}
              </div>
            </section>
          )}

          {feed.trending.length === 0 && feed.live.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-8">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5,3 19,12 5,21 5,3"/></svg>
              <p className="bebas tracking-widest text-gray-400 text-lg">NO VIDEOS</p>
              <p className="text-gray-400 text-sm mt-1">Video content coming soon</p>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

function VideoCard({ item, live = false }: { item: VideoItem; live?: boolean }) {
  const href = buildWatchHref(item);

  return (
    <Link
      href={href}
      className="flex-shrink-0 w-52 group"
    >
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-[#2A2A2A]">
        {item.imgUrl ? (
          <Image src={item.imgUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="208px" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#D52B1E]/20 to-black/40 flex items-center justify-center">
            <svg className="w-10 h-10 text-white/40" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21 5,3"/></svg>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21 5,3"/></svg>
          </div>
        </div>
        {live && item.isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#D52B1E] text-white text-[9px] bebas px-2 py-0.5 rounded tracking-widest">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white" />
            LIVE
          </div>
        )}
        {item.showDuration && item.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
            {item.duration}
          </div>
        )}
      </div>
      <p className="mt-1.5 text-sm font-semibold dark:text-white line-clamp-2 leading-tight">{item.title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
    </Link>
  );
}
