'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Play } from 'lucide-react';
import type { VideoItem } from '@/types/video';
import { getDirectVideoUrl, parseYouTubeId } from '@/lib/video';
import { SECTION_NAV } from '@/lib/nav';

function CardImage({ src, color, label }: { src?: string; color: string; label: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    );
  }
  return (
    <div
      className="w-full aspect-[16/10] flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
      aria-hidden="true"
    >
      <span className="font-display text-white/40 text-3xl tracking-widest">{label.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

/** Muted, looping, non-interactive preview of one video, so the Video card
 * shows motion instead of a still. Direct files play in a <video>; YouTube
 * links play in a chrome-less embed. The whole card stays a link, so the
 * player itself ignores pointer events. Falls back to the poster/thumbnail
 * when there is nothing playable or the visitor prefers reduced motion. */
function VideoPreview({ video, poster, color }: { video?: VideoItem; poster?: string; color: string }) {
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const directUrl = video ? getDirectVideoUrl(video) : null;
  const youtubeId = video?.sourceUrl ? parseYouTubeId(video.sourceUrl) : null;
  const playable = !reduceMotion && (directUrl || youtubeId);

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden bg-black">
      {playable && directUrl ? (
        <video
          src={directUrl}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : playable && youtubeId ? (
        <iframe
          title="Video preview"
          loading="lazy"
          tabIndex={-1}
          aria-hidden="true"
          allow="autoplay; encrypted-media"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&modestbranding=1&rel=0&disablekb=1`}
          className="absolute top-1/2 left-1/2 w-[177.78%] h-[177.78%] -translate-x-1/2 -translate-y-1/2 pointer-events-none border-0"
        />
      ) : (
        <CardImage src={poster} color={color} label="Video" />
      )}
      <span className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 bg-black/60 text-white text-[11px] font-bold tracking-wider px-2.5 py-1">
        <Play className="w-3 h-3 fill-current" />
        WATCH
      </span>
    </div>
  );
}

/** Landing-page category cards: one card per nav category, in nav order, each
 * linking straight to that section. `thumbnails` is keyed by nav label. */
export function SectionCards({
  thumbnails,
  previewVideo,
}: {
  thumbnails: Record<string, string | undefined>;
  /** A video to play inside the Video card. */
  previewVideo?: VideoItem;
}) {
  return (
    <section aria-labelledby="explore-categories-heading" className="max-w-[1400px] mx-auto px-4 pt-6 pb-2">
      <div className="mb-5">
        <div className="w-12 h-1 bg-canadaRed mb-3" />
        <h2 id="explore-categories-heading" className="font-sans font-bold text-lg tracking-wide text-[#1a1a1a] dark:text-white">
          EXPLORE CATEGORIES
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTION_NAV.map(item => {
          const color = item.color ?? '#D52B1E';
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col bg-white dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#2A2A2A] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:shadow-xl outline-none"
            >
              <div className="overflow-hidden">
                {item.href === '/videos' ? (
                  <VideoPreview video={previewVideo} poster={thumbnails[item.label]} color={color} />
                ) : (
                  <CardImage src={thumbnails[item.label]} color={color} label={item.label} />
                )}
              </div>
              <div className="flex flex-col flex-1 p-6">
                <h3 className="font-sans font-bold text-[22px] leading-tight text-[#0b1a3a] dark:text-white">
                  {item.label}
                </h3>
                <span className="block w-10 h-[3px] mt-3 mb-3" style={{ backgroundColor: color }} />
                <p className="text-[15px] leading-relaxed text-[#333] dark:text-[#BBB] mb-6">{item.description}</p>
                <span className="mt-auto inline-flex items-center justify-between gap-6 self-start bg-[#0b1a3a] group-hover:bg-canadaRed text-white text-[14px] font-semibold px-5 py-3 transition-colors">
                  View stories
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
