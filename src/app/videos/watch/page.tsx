import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { getEmbeddedVideoUrl } from '@/lib/video';
import type { VideoItem } from '@/types/video';

export const dynamic = 'force-dynamic';

type WatchVideoPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function readParam(
  searchParams: WatchVideoPageProps['searchParams'],
  key: string,
): string | undefined {
  const value = searchParams?.[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function WatchVideoPage({ searchParams }: WatchVideoPageProps) {
  const item: VideoItem = {
    id: 'watch',
    title: readParam(searchParams, 'title') ?? 'Canada News Video',
    description: readParam(searchParams, 'description'),
    duration: undefined,
    showDuration: false,
    date: readParam(searchParams, 'date') ?? '',
    imgUrl: readParam(searchParams, 'img'),
    isLive: readParam(searchParams, 'live') === '1',
    liveText: readParam(searchParams, 'liveText'),
    sourceUrl: readParam(searchParams, 'source'),
    videoUrl: readParam(searchParams, 'video'),
  };

  const embedUrl = getEmbeddedVideoUrl(item);

  return (
    <AppShell>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Link href="/videos" className="text-sm font-semibold text-blue-500 hover:underline">
          Back to video feed
        </Link>

        <div className="mt-4 bg-black rounded-lg overflow-hidden aspect-video">
          {embedUrl ? (
            item.videoUrl ? (
              <video
                src={embedUrl}
                controls
                playsInline
                className="w-full h-full"
                poster={item.imgUrl}
              />
            ) : (
              <iframe
                src={embedUrl}
                title={item.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              Video unavailable.
            </div>
          )}
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.18em] text-canadaRed font-bold">
            {item.isLive ? 'Live Coverage' : 'Video'}
          </p>
          <h1 className="mt-2 font-serif font-black text-3xl leading-tight text-[#1a1a1a] dark:text-white">
            {item.title}
          </h1>
          {item.date ? (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
          ) : null}
          {item.description ? (
            <p className="mt-4 text-[15px] leading-7 text-[#333] dark:text-[#d0d0d0] whitespace-pre-line">
              {item.description}
            </p>
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}
