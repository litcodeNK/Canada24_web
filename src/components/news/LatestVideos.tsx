'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlayButton } from './PlayButton';
import { fetchVideoFeed } from '@/services/newsService';
import type { VideoItem } from '@/types/video';

/**
 * Homepage "Latest Videos" strip.
 *
 * Reuses the existing /news/videos/ endpoint rather than the TikTok Display
 * API integration: that path is dormant (no account connected, no curated
 * links, and only ~2% of stored videos came from it), while the same endpoint
 * already serves 1,100+ real videos.
 *
 * The mockup shows duration badges, but ExternalVideo has no duration field
 * and the API returns an empty string for every item — so no badge is drawn
 * rather than inventing a runtime. `showDuration` is honoured if the backend
 * ever starts populating it.
 */
export function LatestVideos({ limit = 4 }: { limit?: number }) {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchVideoFeed()
      .then(feed => {
        if (cancelled) return;
        // Live items lead when present, matching the "LIVE 24/7" framing.
        setVideos([...feed.live, ...feed.trending].slice(0, limit));
      })
      .catch(() => {
        if (!cancelled) setVideos([]);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (videos.length === 0) return null;

  return (
    <section className="w-full py-8 bg-gray-100 dark:bg-[#141414]" aria-label="Latest videos">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif font-black text-[22px] sm:text-[26px] text-[#1a1a1a] dark:text-[#F5F5F5] tracking-tight">
            Latest Videos
          </h2>
          <Link
            href="/videos"
            className="flex items-center gap-1.5 text-[12px] font-bold text-canadaRed hover:underline"
          >
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-canadaRed" aria-hidden="true" />
            LIVE 24/7
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map(video => (
            <Link
              key={video.id}
              href="/videos"
              className="group relative block rounded-lg overflow-hidden bg-black/10 dark:bg-[#1C1C1C]"
            >
              <div className="relative w-full aspect-video">
                {video.imgUrl && (
                  <Image
                    src={video.imgUrl}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                    loading="lazy"
                    unoptimized
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                  <PlayButton className="w-12" />
                </div>

                {video.isLive && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 bg-canadaRed text-white px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded">
                    <span className="pulse-dot w-1 h-1 rounded-full bg-white" aria-hidden="true" />
                    {video.liveText || 'LIVE'}
                  </span>
                )}

                {video.showDuration && video.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums">
                    {video.duration}
                  </span>
                )}

                <h3 className="absolute bottom-0 left-0 right-0 p-2.5 text-white text-[12px] font-semibold leading-snug line-clamp-2">
                  {video.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
