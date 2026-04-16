import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme';
import { fetchTopStories } from '../services/newsService';
import { TOP_STORIES } from '../data/newsData';

export interface Article {
  id: string;
  headline: string;
  category?: string;
  time: string;
  imgUrl?: string;
  isLive?: boolean;
  duration?: string;
  isUpdated?: boolean;
}

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
  colors: typeof Colors.light;
}

const defaultAlerts: Record<string, boolean> = {
  'COVID-19 Updates': false,
  'Breaking News': true,
  'Top Stories': true,
  'Morning Brief': false,
  'Recommended For You': false,
  'Business': false,
  'Climate Change': false,
  'Entertainment': false,
  'Health': false,
  'Technology': false,
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

const AppContext = createContext<AppContextType | null>(null);
const STORAGE_KEY = '@canada247_state';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [topStories, setTopStories] = useState<Article[]>(TOP_STORIES);
  const [loadingNews, setLoadingNews] = useState(false);

  // Load persisted settings
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { setState(prev => ({ ...prev, ...JSON.parse(raw) })); } catch {}
      }
      setLoaded(true);
    });
  }, []);

  // Persist settings on change
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  // Fetch live news after onboarding is complete
  useEffect(() => {
    if (loaded && state.onboardingComplete) {
      refreshNews();
    }
  }, [loaded, state.onboardingComplete]);

  const refreshNews = async () => {
    setLoadingNews(true);
    try {
      const articles = await fetchTopStories();
      if (articles.length > 0) setTopStories(articles);
    } catch {}
    setLoadingNews(false);
  };

  const update = (patch: Partial<AppState>) => setState(s => ({ ...s, ...patch }));
  const colors = state.darkMode ? Colors.dark : Colors.light;

  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      ...state,
      topStories,
      loadingNews,
      refreshNews,
      colors,
      toggleDarkMode: () => update({ darkMode: !state.darkMode }),
      toggleCompactLayout: () => update({ compactLayout: !state.compactLayout }),
      toggleStorySwiping: () => update({ allowStorySwiping: !state.allowStorySwiping }),
      toggleDefaultTextSize: () => update({ useDefaultTextSize: !state.useDefaultTextSize }),
      setTextScale: (v) => update({ textScale: v }),
      toggleBackgroundAudio: () => update({ allowBackgroundAudio: !state.allowBackgroundAudio }),
      toggleRegion: (region) => {
        const next = state.selectedRegions.includes(region)
          ? state.selectedRegions.filter(r => r !== region)
          : [...state.selectedRegions, region];
        update({ selectedRegions: next });
      },
      toggleAlert: (key) => update({ alerts: { ...state.alerts, [key]: !state.alerts[key] } }),
      toggleSaveArticle: (article) => {
        const exists = state.savedArticles.find(a => a.id === article.id);
        update({
          savedArticles: exists
            ? state.savedArticles.filter(a => a.id !== article.id)
            : [...state.savedArticles, article],
        });
      },
      isArticleSaved: (id) => !!state.savedArticles.find(a => a.id === id),
      completeOnboarding: () => update({ onboardingComplete: true }),
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
