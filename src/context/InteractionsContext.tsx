import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Article } from './AppContext';
import type { AuthUser } from './AuthContext';

const REACTIONS_KEY = '@canada247_reactions';
const COMMENTS_KEY  = '@canada247_comments';
const REPOSTS_KEY   = '@canada247_reposts';

export interface Comment {
  id: string;
  articleId: string;
  authorEmail: string;
  authorName: string;
  text: string;
  createdAt: string;
}

type Reaction = 'like' | 'dislike' | null;

interface InteractionsState {
  reactions: Record<string, Reaction>;      // articleId → user's reaction
  comments:  Record<string, Comment[]>;     // articleId → comments list
  reposts:   Record<string, boolean>;       // articleId → reposted by user
}

interface InteractionsContextType {
  getReaction:     (articleId: string) => Reaction;
  getComments:     (articleId: string) => Comment[];
  isReposted:      (articleId: string) => boolean;
  getLikeCount:    (articleId: string) => number;
  getDislikeCount: (articleId: string) => number;
  toggleLike:      (articleId: string) => void;
  toggleDislike:   (articleId: string) => void;
  addComment:      (articleId: string, text: string, user: AuthUser) => void;
  toggleRepost:    (articleId: string) => void;
}

const InteractionsContext = createContext<InteractionsContextType | null>(null);

// Seed a stable "community" base count from article ID so numbers look realistic
function seedCount(articleId: string, salt: string): number {
  let h = 0;
  const s = articleId + salt;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return (Math.abs(h) % 180) + 8;
}

export function InteractionsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InteractionsState>({
    reactions: {},
    comments: {},
    reposts: {},
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [r, c, p] = await Promise.all([
          AsyncStorage.getItem(REACTIONS_KEY),
          AsyncStorage.getItem(COMMENTS_KEY),
          AsyncStorage.getItem(REPOSTS_KEY),
        ]);
        setState({
          reactions: r ? JSON.parse(r) : {},
          comments:  c ? JSON.parse(c) : {},
          reposts:   p ? JSON.parse(p) : {},
        });
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(REACTIONS_KEY, JSON.stringify(state.reactions));
    AsyncStorage.setItem(COMMENTS_KEY,  JSON.stringify(state.comments));
    AsyncStorage.setItem(REPOSTS_KEY,   JSON.stringify(state.reposts));
  }, [state, loaded]);

  const getReaction     = (id: string): Reaction => state.reactions[id] ?? null;
  const getComments     = (id: string): Comment[] => state.comments[id] ?? [];
  const isReposted      = (id: string): boolean => !!state.reposts[id];

  const getLikeCount = (id: string): number => {
    const base = seedCount(id, 'likes');
    const r = getReaction(id);
    return r === 'like' ? base + 1 : base;
  };
  const getDislikeCount = (id: string): number => {
    const base = seedCount(id, 'dislikes') % 30 + 2;
    const r = getReaction(id);
    return r === 'dislike' ? base + 1 : base;
  };

  const toggleLike = (id: string) => {
    setState(s => ({
      ...s,
      reactions: { ...s.reactions, [id]: s.reactions[id] === 'like' ? null : 'like' },
    }));
  };

  const toggleDislike = (id: string) => {
    setState(s => ({
      ...s,
      reactions: { ...s.reactions, [id]: s.reactions[id] === 'dislike' ? null : 'dislike' },
    }));
  };

  const addComment = (articleId: string, text: string, user: AuthUser) => {
    const comment: Comment = {
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      articleId,
      authorEmail: user.email,
      authorName: user.displayName,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setState(s => ({
      ...s,
      comments: {
        ...s.comments,
        [articleId]: [comment, ...(s.comments[articleId] ?? [])],
      },
    }));
  };

  const toggleRepost = (id: string) => {
    setState(s => ({
      ...s,
      reposts: { ...s.reposts, [id]: !s.reposts[id] },
    }));
  };

  return (
    <InteractionsContext.Provider value={{
      getReaction, getComments, isReposted,
      getLikeCount, getDislikeCount,
      toggleLike, toggleDislike, addComment, toggleRepost,
    }}>
      {children}
    </InteractionsContext.Provider>
  );
}

export function useInteractions() {
  const ctx = useContext(InteractionsContext);
  if (!ctx) throw new Error('useInteractions must be within InteractionsProvider');
  return ctx;
}
