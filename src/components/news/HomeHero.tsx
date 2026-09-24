'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import type { Article } from '@/context/AppContext';

function formatPublished(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Lead story panel: full-bleed image with the headline, standfirst and
 *  byline metadata overlaid, per the homepage mockup. */
export function HomeHero({ article }: { article?: Article }) {
  if (!article) return null;

  const published = formatPublished(article.publishedAt);
  /* read_time_minutes is computed server-side from the body; 0 means the
     article has no body text to estimate from, so the label is omitted
     rather than showing a made-up duration. */
  const readTime = article.readTimeMinutes && article.readTimeMinutes > 0
    ? `${article.readTimeMinutes} min read`
    : '';

  return (
    <article className="relative w-full overflow-hidden rounded-xl bg-[#0D0D0D] min-h-[380px] sm:min-h-[460px] flex">
      {article.imgUrl && (
        <Image
          src={article.imgUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 900px"
          priority
          unoptimized
        />
      )}

      {/* Legibility scrim — the headline sits over arbitrary photography */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10" />

      <div className="relative mt-auto w-full p-5 sm:p-8">
        {article.isLive && (
          <span className="inline-flex items-center gap-1.5 bg-canadaRed text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
            Live
          </span>
        )}

        <h1 className="font-serif font-black text-white text-[26px] sm:text-[40px] leading-[1.12] tracking-tight mb-3 max-w-[760px]">
          <Link href={`/article/${article.id}`} className="hover:underline underline-offset-4 decoration-2">
            {article.headline}
          </Link>
        </h1>

        {article.body && (
          <p className="text-white/85 text-[14px] sm:text-[16px] leading-relaxed mb-4 max-w-[640px] line-clamp-2">
            {article.body}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-2 text-white/75 text-[12px] sm:text-[13px] font-medium">
            {published && <span>Published {published}</span>}
            {published && readTime && <span className="text-white/40">•</span>}
            {readTime && (
              <span className="flex items-center gap-1.5">
                {readTime}
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            )}
          </span>

          <Link
            href={`/article/${article.id}`}
            className="ml-auto inline-flex items-center gap-2 bg-canadaRed hover:bg-canadaRedDark text-white text-[13px] sm:text-[14px] font-bold px-5 py-2.5 rounded-md transition-colors"
          >
            Read Full Story
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
