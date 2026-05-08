'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { fetchCommunityStories, fetchTopStories, mapBackendArticle } from '../services/newsService';
import { TOP_STORIES } from '../data/newsData';
import { apiRequest } from '../services/api';
import { readStoredSession, requestWithStoredSession } from '../services/sessionService';
import { Colors } from '../theme';

export interface Article {
  id: string;
  headline: string;
  category?: string;
  time: string;
  imgUrl?: string;
  isLive?: boolean;
  duration?: string;
  isUpdated?: boolean;
  body?: string;
  author?: string;
  sourceUrl?: string;
  publishedAt?: string;
  feedKey?: string;
  regionSlugs?: string[];
  likesCount?: number;
  dislikesCount?: number;
  commentsCount?: number;
  repostsCount?: number;
  savesCount?: number;
  userReaction?: 'like' | 'dislike' | null;
  isSaved?: boolean;
  isReposted?: boolean;
}

export type ServerAlertPreferences = {
  breaking_news: boolean;
  top_stories: boolean;
  local_news: boolean;
  health: boolean;
  sports: boolean;
  business: boolean;
  entertainment: boolean;
  politics: boolean;
  science: boolean;
  environment: boolean;
};

export type ServerRegion = {
  id: number;
  slug: string;
  name: string;
  province: string;
  rss_url: string;
};

interface AppState {
  darkMode: boolean;
  compactLayout: boolean;
  allowStorySwiping: boolean;
  useDefaultTextSize: boolean;
  textScale: number;
  allowBackgroundAudio: boolean;
  selectedRegions: string[];
  alerts: Record<string, boolean>;
  savedArticles: Article[];
  onboardingComplete: boolean;
}

interface AppContextType extends AppState {
  topStories: Article[];
  communityStories: Article[];
  loadingNews: boolean;
  refreshNews: () => Promise<void>;
  toggleDarkMode: () => void;
  toggleCompactLayout: () => void;
  toggleStorySwiping: () => void;
  toggleDefaultTextSize: () => void;
  setTextScale: (v: number) => void;
  toggleBackgroundAudio: () => void;
  toggleRegion: (region: string) => void;
  toggleAlert: (key: string) => void;
  toggleSaveArticle: (article: Article) => void;
  isArticleSaved: (id: string) => boolean;
  completeOnboarding: () => void;
  hydrateServerState: (payload: {
    regionNames?: string[];
    alerts?: Partial<ServerAlertPreferences>;
    savedArticles?: Article[];
  }) => void;
  clearServerState: () => void;
  colors: typeof Colors.light;
}

const defaultAlerts: Record<string, boolean> = {
  'Breaking News': true,
  'Top Stories': true,
  'Morning Brief': false,
  'Recommended For You': false,
  'Business': false,
  'Health': false,
  'Entertainment': false,
  'Technology': false,
  'Sports': false,
  'Immigration': false,
  'Aviation': false,
  'Indigenous': false,
  'Politics': false,
  'Events': false,
  'Auto News': false,
  'Blacks in Canada': false,
  'Education in Canada': false,
  'Opportunities': false,
  'World': false,
};

const defaultState: AppState = {
  darkMode: false,
  compactLayout: false,
  allowStorySwiping: true,
  useDefaultTextSize: true,
  textScale: 0.4,
  allowBackgroundAudio: false,
  selectedRegions: [],
  alerts: defaultAlerts,
  savedArticles: [],
  onboardingComplete: false,
};

const ALERT_KEY_MAP: Partial<Record<string, keyof ServerAlertPreferences>> = {
  'Breaking News': 'breaking_news',
  'Top Stories': 'top_stories',
  Business: 'business',
  Entertainment: 'entertainment',
  Health: 'health',
  'Climate Change': 'environment',
};

const STORAGE_KEY = '@canada247_state';

function mergeServerAlerts(
  current: Record<string, boolean>,
  server: Partial<ServerAlertPreferences>,
): Record<string, boolean> {
  const next = { ...current };
  for (const [appKey, serverKey] of Object.entries(ALERT_KEY_MAP)) {
    if (serverKey && typeof server[serverKey] === 'boolean') {
      next[appKey] = server[serverKey] as boolean;
    }
  }
  return next;
}

function getNumericArticleId(articleId: string): string | null {
  return /^\d+$/.test(articleId) ? articleId : null;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [topStories, setTopStories] = useState<Article[]>(TOP_STORIES);
  const [communityStories, setCommunityStories] = useState<Article[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [regionCatalog, setRegionCatalog] = useState<ServerRegion[]>([]);
  const topStoriesRef = useRef<Article[]>(TOP_STORIES);

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); } catch {}
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  // Apply dark mode class
  useEffect(() => {
    if (!loaded) return;
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode, loaded]);

  useEffect(() => {
    if (loaded && state.onboardingComplete) refreshNews();
  }, [loaded, state.onboardingComplete]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const regions = await apiRequest<ServerRegion[]>('/regions/');
        setRegionCatalog(regions);
      } catch {}
    })();
  }, [loaded]);

  useEffect(() => {
    topStoriesRef.current = topStories;
  }, [topStories]);

  // WebSocket for real-time updates (only if WS URL is configured and not in dev without daphne)
  useEffect(() => {
    if (!loaded || !state.onboardingComplete) return;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) return; // skip if not explicitly configured
    const wsBase = wsUrl.replace(/\/+$/, '');
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`${wsBase}/ws/news/`);
      ws.onmessage = (e) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const article = mapBackendArticle(JSON.parse(e.data) as any);
          setTopStories(prev => {
            if (prev.some(item => item.id === article.id)) return prev;
            return [article, ...prev];
          });
        } catch {}
      };
    } catch {}
    return () => { try { ws?.close(); } catch {} };
  }, [loaded, state.onboardingComplete]);

  const refreshNews = async () => {
    setLoadingNews(true);
    try {
      const [articles, community] = await Promise.all([fetchTopStories(), fetchCommunityStories()]);
      if (articles.length > 0) setTopStories(articles);
      setCommunityStories(community);
    } catch {}
    setLoadingNews(false);
  };

  const update = (patch: Partial<AppState>) => setState(cur => ({ ...cur, ...patch }));
  const colors = state.darkMode ? Colors.dark : Colors.light;

  const hydrateServerState = (payload: {
    regionNames?: string[];
    alerts?: Partial<ServerAlertPreferences>;
    savedArticles?: Article[];
  }) => {
    setState(cur => ({
      ...cur,
      selectedRegions: payload.regionNames ?? cur.selectedRegions,
      alerts: payload.alerts ? mergeServerAlerts(cur.alerts, payload.alerts) : cur.alerts,
      savedArticles: payload.savedArticles ?? cur.savedArticles,
    }));
  };

  const clearServerState = () => setState(cur => ({ ...cur, savedArticles: [] }));

  const toggleRegion = (region: string) => {
    const next = state.selectedRegions.includes(region)
      ? state.selectedRegions.filter(r => r !== region)
      : [...state.selectedRegions, region];
    update({ selectedRegions: next });

    void (async () => {
      const session = readStoredSession();
      if (!session || regionCatalog.length === 0) return;
      const regionSlugs = regionCatalog.filter(r => next.includes(r.name)).map(r => r.slug);
      try {
        const { data } = await requestWithStoredSession<{ regions: ServerRegion[]; slugs: string[] }>(
          session, '/regions/me/', { method: 'PUT', body: JSON.stringify({ regions: regionSlugs }) },
        );
        update({ selectedRegions: data.regions.map(r => r.name) });
      } catch {}
    })();
  };

  const toggleAlert = (key: string) => {
    const nextAlerts = { ...state.alerts, [key]: !state.alerts[key] };
    update({ alerts: nextAlerts });

    const serverKey = ALERT_KEY_MAP[key];
    if (!serverKey) return;
    void (async () => {
      const session = readStoredSession();
      if (!session) return;
      try {
        const { data } = await requestWithStoredSession<ServerAlertPreferences>(
          session, '/notifications/alerts/', { method: 'PATCH', body: JSON.stringify({ [serverKey]: nextAlerts[key] }) },
        );
        update({ alerts: mergeServerAlerts(nextAlerts, data) });
      } catch {}
    })();
  };

  const toggleSaveArticle = (article: Article) => {
    const exists = state.savedArticles.some(a => a.id === article.id);
    const optimistic = exists
      ? state.savedArticles.filter(a => a.id !== article.id)
      : [article, ...state.savedArticles];
    update({ savedArticles: optimistic });

    const articleId = getNumericArticleId(article.id);
    if (!articleId) return;
    void (async () => {
      const session = readStoredSession();
      if (!session) return;
      try {
        const { data } = await requestWithStoredSession<{ saved: boolean }>(
          session, `/interactions/articles/${articleId}/save/`, { method: 'POST' },
        );
        update({
          savedArticles: data.saved
            ? [article, ...optimistic.filter(a => a.id !== article.id)]
            : optimistic.filter(a => a.id !== article.id),
        });
      } catch {
        update({ savedArticles: state.savedArticles });
      }
    })();
  };

  return (
    <AppContext.Provider value={{
      ...state,
      topStories,
      communityStories,
      loadingNews,
      refreshNews,
      colors,
      toggleDarkMode: () => update({ darkMode: !state.darkMode }),
      toggleCompactLayout: () => update({ compactLayout: !state.compactLayout }),
      toggleStorySwiping: () => update({ allowStorySwiping: !state.allowStorySwiping }),
      toggleDefaultTextSize: () => update({ useDefaultTextSize: !state.useDefaultTextSize }),
      setTextScale: v => update({ textScale: v }),
      toggleBackgroundAudio: () => update({ allowBackgroundAudio: !state.allowBackgroundAudio }),
      toggleRegion,
      toggleAlert,
      toggleSaveArticle,
      isArticleSaved: id => state.savedArticles.some(a => a.id === id),
      completeOnboarding: () => update({ onboardingComplete: true }),
      hydrateServerState,
      clearServerState,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be within AppProvider');
  return ctx;
}
