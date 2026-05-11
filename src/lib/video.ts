import type { VideoItem } from '@/types/video';

function parseYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace(/^\/+/, '') || null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v');
    }
    return null;
  } catch {
    return null;
  }
}

export function getEmbeddedVideoUrl(item: VideoItem): string | null {
  if (item.videoUrl) return item.videoUrl;
  if (!item.sourceUrl) return null;

  const youtubeId = parseYouTubeId(item.sourceUrl);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`;
  }

  return item.sourceUrl;
}

export function buildWatchHref(item: VideoItem): string {
  const params = new URLSearchParams();
  params.set('title', item.title);
  params.set('date', item.date);
  if (item.description) params.set('description', item.description);
  if (item.imgUrl) params.set('img', item.imgUrl);
  if (item.sourceUrl) params.set('source', item.sourceUrl);
  if (item.videoUrl) params.set('video', item.videoUrl);
  if (item.liveText) params.set('liveText', item.liveText);
  if (item.isLive) params.set('live', '1');
  return `/videos/watch?${params.toString()}`;
}
