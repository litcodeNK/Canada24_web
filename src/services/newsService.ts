import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Article } from '../context/AppContext';
import { SECTION_FALLBACK_ARTICLES, TOP_STORIES } from '../data/newsData';

const CACHE_PREFIX = 'news_cache_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const SECTION_FEED_MAP: Record<string, string> = {
  Business:      'https://www.cbc.ca/cmlink/rss-business',
  Health:        'https://www.cbc.ca/cmlink/rss-health',
  World:         'https://www.cbc.ca/cmlink/rss-world',
  Politics:      'https://www.cbc.ca/cmlink/rss-politics',
  Technology:    'https://www.cbc.ca/cmlink/rss-technology',
  Sports:        'https://www.cbc.ca/cmlink/rss-sports',
  Arts:          'https://www.cbc.ca/cmlink/rss-arts',
  Science:       'https://www.cbc.ca/cmlink/rss-science',
  Indigenous:    'https://www.cbc.ca/cmlink/rss-indigenous',
  Environment:   'https://www.cbc.ca/cmlink/rss-environment',
  Opinion:       'https://www.cbc.ca/cmlink/rss-opinion',
  Entertainment: 'https://www.cbc.ca/cmlink/rss-entertainment',
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600',
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600',
];

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8212;/g, '\u2014')
    .trim();
}

function getTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function getAttr(xml: string, tag: string, attr: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}

function formatRelativeTime(pubDate: string): string {
  if (!pubDate) return 'Recently';
  try {
    const date = new Date(pubDate);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } catch {
    return 'Recently';
  }
}

function parseRSSItems(xml: string, category: string): Article[] {
  const rawItems = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  return rawItems.slice(0, 12).map((item, i): Article | null => {
    const headline = decodeHtml(getTag(item, 'title'));
    if (!headline) return null;

    const imgUrl =
      getAttr(item, 'media:thumbnail', 'url') ||
      getAttr(item, 'media:content', 'url') ||
      getAttr(item, 'enclosure', 'url') ||
      (item.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i)?.[0]) ||
      FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];

    return {
      id: `rss_${category}_${i}_${Date.now()}`,
      headline,
      category: category.toUpperCase(),
      time: formatRelativeTime(getTag(item, 'pubDate')),
      imgUrl,
      isLive: false,
    };
  }).filter((a): a is Article => a !== null);
}

async function fetchFeed(url: string, category: string, cacheKey: string): Promise<Article[]> {
  // Check cache first
  try {
    const cached = await AsyncStorage.getItem(CACHE_PREFIX + cacheKey);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) return data;
    }
  } catch {}

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const articles = parseRSSItems(xml, category);
    if (articles.length > 0) {
      await AsyncStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify({ data: articles, ts: Date.now() }));
      return articles;
    }
  } catch {}

  // Return stale cache if available
  try {
    const cached = await AsyncStorage.getItem(CACHE_PREFIX + cacheKey);
    if (cached) return JSON.parse(cached).data;
  } catch {}

  return [];
}

export async function fetchTopStories(): Promise<Article[]> {
  const live = await fetchFeed('https://www.cbc.ca/cmlink/rss-topstories', 'Canada', 'topstories');
  return live.length > 0 ? live : TOP_STORIES;
}

export async function fetchCategoryArticles(section: string): Promise<Article[]> {
  const url = SECTION_FEED_MAP[section];
  const fallback = SECTION_FALLBACK_ARTICLES[section] ?? [];
  if (!url) return fallback;
  const live = await fetchFeed(url, section, section.toLowerCase());
  return live.length > 0 ? live : fallback;
}

export async function searchArticles(query: string): Promise<Article[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Fetch top stories + canada feed, filter by query
  const [top, canada] = await Promise.allSettled([
    fetchFeed('https://www.cbc.ca/cmlink/rss-topstories', 'Canada', 'topstories'),
    fetchFeed('https://www.cbc.ca/cmlink/rss-canada', 'Canada', 'canada'),
  ]);

  const all: Article[] = [
    ...(top.status === 'fulfilled' ? top.value : []),
    ...(canada.status === 'fulfilled' ? canada.value : []),
  ];

  const seen = new Set<string>();
  return all.filter(a => {
    if (seen.has(a.headline)) return false;
    seen.add(a.headline);
    return a.headline.toLowerCase().includes(q) ||
           (a.category ?? '').toLowerCase().includes(q);
  });
}
