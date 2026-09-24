import type { Article, RelatedCoverageItem, RelatedCoverageStatus } from '../context/AppContext';
import type { UserPost, UserPostStatus } from '../context/AuthContext';
import type { VideoFeed, VideoItem } from '../types/video';
import { apiRequest, extractList } from './api';

type BackendArticle = {
  id: number;
  external_id: string;
  headline: string;
  body: string;
  category: string;
  img_url: string;
  source_url: string;
  author: string;
  published_at: string;
  time: string;
  read_time_minutes?: number;
  is_live: boolean;
  is_updated: boolean;
  source: string;
  feed_key: string;
  region_slugs: string[];
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  reposts_count: number;
  saves_count: number;
  user_reaction: 'like' | 'dislike' | null;
  is_saved: boolean;
  is_reposted: boolean;
  related_coverage?: BackendRelatedCoverageItem[];
  related_coverage_status?: RelatedCoverageStatus;
};

type BackendRelatedCoverageItem = {
  title: string;
  url: string;
  snippet: string;
  source_hostname: string;
  source_favicon: string;
  age: string;
};

type BackendUserPost = {
  id: number;
  headline: string;
  body: string;
  category: string;
  img_url: string;
  status: UserPostStatus;
  created_at: string;
  updated_at: string;
  time: string;
  author_name: string;
  author_email: string;
};

type BackendSection = {
  slug: string;
  label: string;
  code: string;
  rss_url: string;
};

type BackendVideoItem = {
  id: string;
  title: string;
  description?: string;
  duration: string;
  show_duration: boolean;
  date: string;
  img_url: string;
  is_live: boolean;
  live_text: string;
  source_url?: string;
  video_url?: string;
};

type BackendVideoFeed = {
  trending: BackendVideoItem[];
  live: BackendVideoItem[];
};

/* Maps clean URL slugs onto the backend's section *labels* (fetchCategoryArticles
   matches on label, not slug), so nav URLs don't have to contain spaces the way
   /sections/auto%20news did. */
const SECTION_NAME_ALIASES: Record<string, string> = {
  education: 'Education in Canada',
  auto: 'Auto News',
  'auto-news': 'Auto News',
  'jobs-money': 'Opportunities',
  jobs: 'Opportunities',
  'blacks-in-canada': 'Blacks in Canada',
};

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/* How a section slug is shown in the UI. Separate from SECTION_NAME_ALIASES
   above, which exists for API lookup — the two differ on purpose: /sections/
   jobs-money queries the backend's "Opportunities" section but is presented
   to readers as "Jobs & Money". */
const SECTION_DISPLAY_LABELS: Record<string, string> = {
  'jobs-money': 'Jobs & Money',
  jobs: 'Jobs & Money',
  opportunities: 'Jobs & Money',
  auto: 'Auto',
  'auto-news': 'Auto News',
  education: 'Education in Canada',
  'blacks-in-canada': 'Blacks in Canada',
};

export function sectionDisplayLabel(slug: string): string {
  return SECTION_DISPLAY_LABELS[slug.trim().toLowerCase()] ?? slug;
}

export function slugifyValue(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function mapBackendArticle(article: BackendArticle): Article {
  return {
    id: String(article.id),
    headline: article.headline,
    category: article.category || undefined,
    time: article.time,
    imgUrl: article.img_url || undefined,
    isLive: article.is_live,
    isUpdated: article.is_updated,
    body: article.body || undefined,
    author: article.author || undefined,
    sourceUrl: article.source_url || undefined,
    publishedAt: article.published_at,
    readTimeMinutes: article.read_time_minutes,
    feedKey: article.feed_key || undefined,
    regionSlugs: article.region_slugs,
    likesCount: article.likes_count,
    dislikesCount: article.dislikes_count,
    commentsCount: article.comments_count,
    repostsCount: article.reposts_count,
    savesCount: article.saves_count,
    userReaction: article.user_reaction,
    isSaved: article.is_saved,
    isReposted: article.is_reposted,
    relatedCoverage: mapRelatedCoverage(article.related_coverage),
    relatedCoverageStatus: article.related_coverage_status,
  };
}

function mapRelatedCoverage(items?: BackendRelatedCoverageItem[]): RelatedCoverageItem[] {
  if (!Array.isArray(items)) return [];
  return items
    // Brave occasionally returns an entry with no usable link; skip those
    // rather than rendering a dead card.
    .filter(item => item?.title && item?.url)
    .map(item => ({
      title: item.title,
      url: item.url,
      snippet: item.snippet ?? '',
      sourceHostname: item.source_hostname ?? '',
      sourceFavicon: item.source_favicon ?? '',
      age: item.age ?? '',
    }));
}

export function mapBackendUserPost(post: BackendUserPost): UserPost {
  return {
    id: `user-post-${post.id}`,
    headline: post.headline,
    body: post.body,
    category: post.category || titleCase('general'),
    time: post.time,
    imgUrl: post.img_url || undefined,
    isLive: false,
    isUserPost: true,
    status: post.status,
    authorEmail: post.author_email,
    authorName: post.author_name,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  };
}

function mapBackendVideoItem(item: BackendVideoItem): VideoItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description || undefined,
    duration: item.duration || undefined,
    showDuration: item.show_duration,
    date: item.date,
    imgUrl: item.img_url || undefined,
    isLive: item.is_live,
    liveText: item.live_text || undefined,
    sourceUrl: item.source_url || undefined,
    videoUrl: item.video_url || undefined,
  };
}

async function fetchArticleList(path: string): Promise<Article[]> {
  const payload = await apiRequest<BackendArticle[] | { results: BackendArticle[] }>(path);
  return extractList(payload).map(mapBackendArticle);
}

/** Fetches a single article by id — the source of truth for the detail page.
 * Unlike the list fetchers above, this does NOT swallow errors: a 404 (bad/
 * deleted id) or network failure must reach the caller so it can distinguish
 * "not found" from "still loading" instead of hanging on cached/no data. */
export async function fetchArticleDetail(id: string): Promise<Article> {
  const payload = await apiRequest<BackendArticle>(`/news/articles/${id}/`);
  return mapBackendArticle(payload);
}

/** The single most recent story an editor flagged as breaking in Django admin,
 *  or null when nothing is flagged (in which case the ticker hides itself).
 *  Returns null rather than throwing — a ticker outage must not break the page. */
export async function fetchBreakingNews(): Promise<Article | null> {
  try {
    const payload = await apiRequest<BackendArticle | null>('/news/breaking/');
    return payload ? mapBackendArticle(payload) : null;
  } catch {
    return null;
  }
}

export async function fetchTopStories(): Promise<Article[]> {
  try {
    return await fetchArticleList('/news/top-stories/');
  } catch {
    return [];
  }
}

export async function fetchCommunityStories(): Promise<Article[]> {
  try {
    return await fetchArticleList('/news/community/');
  } catch {
    return [];
  }
}

export async function fetchCategoryArticles(section: string): Promise<Article[]> {
  try {
    const sections = await apiRequest<BackendSection[]>('/news/sections/');
    const requested = SECTION_NAME_ALIASES[section.toLowerCase()] ?? section;
    const match = sections.find(item => item.label.toLowerCase() === requested.toLowerCase());
    if (!match) return [];

    return await fetchArticleList(`/news/sections/${match.slug}/`);
  } catch {
    return [];
  }
}

export async function fetchLocalNews(regionName?: string): Promise<Article[]> {
  const query = regionName ? `?regions=${encodeURIComponent(slugifyValue(regionName))}` : '';

  try {
    return await fetchArticleList(`/news/local/${query}`);
  } catch {
    return [];
  }
}

export async function searchArticles(query: string): Promise<Article[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    return await fetchArticleList(`/news/search/?q=${encodeURIComponent(trimmed)}`);
  } catch {
    return [];
  }
}

export async function fetchVideoFeed(): Promise<VideoFeed> {
  const payload = await apiRequest<BackendVideoFeed>('/news/videos/');
  return {
    trending: payload.trending.map(mapBackendVideoItem),
    live: payload.live.map(mapBackendVideoItem),
  };
}
