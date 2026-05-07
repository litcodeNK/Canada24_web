'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest, extractList } from '../services/api';
import { readStoredSession, requestWithStoredSession } from '../services/sessionService';
import type { Article } from './AppContext';
import type { AuthUser } from './AuthContext';

const REACTIONS_KEY = '@canada247_reactions';
const COMMENTS_KEY = '@canada247_comments';
const REPOSTS_KEY = '@canada247_reposts';

export interface Comment {
  id: string;
  articleId: string;
  authorEmail: string;
  authorName: string;
  text: string;
  createdAt: string;
}

type Reaction = 'like' | 'dislike' | null;

type BackendComment = {
  id: number; article: number; text: string; created_at: string; author_name: string; author_email: string;
};

type ReactionSummary = { likes: number; dislikes: number; comments: number; reposts: number; user_reaction: Reaction };
type RepostSummary = { reposted: boolean; reposts: number };

interface InteractionsState {
  reactions: Record<string, Reaction>;
  comments: Record<string, Comment[]>;
  reposts: Record<string, boolean>;
  likeCounts: Record<string, number>;
  dislikeCounts: Record<string, number>;
  commentCounts: Record<string, number>;
  repostCounts: Record<string, number>;
}

interface InteractionsContextType {
  hydrateArticleInteractions: (article: Article) => Promise<void>;
  getReaction: (articleId: string) => Reaction | undefined;
  getComments: (articleId: string) => Comment[];
  getCommentCount: (articleId: string) => number | undefined;
  isReposted: (articleId: string) => boolean | undefined;
  getLikeCount: (articleId: string) => number | undefined;
  getDislikeCount: (articleId: string) => number | undefined;
  getRepostCount: (articleId: string) => number | undefined;
  toggleLike: (articleId: string) => void;
  toggleDislike: (articleId: string) => void;
  addComment: (articleId: string, text: string, user: AuthUser) => void;
  toggleRepost: (articleId: string, currentReposted?: boolean) => void;
}

const InteractionsContext = createContext<InteractionsContextType | null>(null);

function isBackendId(id: string) { return /^\d+$/.test(id); }

function mapBackendComment(c: BackendComment): Comment {
  return { id: String(c.id), articleId: String(c.article), authorEmail: c.author_email, authorName: c.author_name, text: c.text, createdAt: c.created_at };
}

export function InteractionsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InteractionsState>({
    reactions: {}, comments: {}, reposts: {},
    likeCounts: {}, dislikeCounts: {}, commentCounts: {}, repostCounts: {},
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const r = localStorage.getItem(REACTIONS_KEY);
      const c = localStorage.getItem(COMMENTS_KEY);
      const rp = localStorage.getItem(REPOSTS_KEY);
      setState(cur => ({
        ...cur,
        reactions: r ? JSON.parse(r) : {},
        comments: c ? JSON.parse(c) : {},
        reposts: rp ? JSON.parse(rp) : {},
      }));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(REACTIONS_KEY, JSON.stringify(state.reactions));
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(state.comments));
    localStorage.setItem(REPOSTS_KEY, JSON.stringify(state.reposts));
  }, [state.reactions, state.comments, state.reposts, loaded]);

  const hydrateArticleInteractions = async (article: Article) => {
    setState(cur => ({
      ...cur,
      reactions: { ...cur.reactions, [article.id]: cur.reactions[article.id] ?? article.userReaction ?? null },
      reposts: { ...cur.reposts, [article.id]: cur.reposts[article.id] ?? Boolean(article.isReposted) },
      likeCounts: { ...cur.likeCounts, [article.id]: cur.likeCounts[article.id] ?? article.likesCount ?? 0 },
      dislikeCounts: { ...cur.dislikeCounts, [article.id]: cur.dislikeCounts[article.id] ?? article.dislikesCount ?? 0 },
      commentCounts: { ...cur.commentCounts, [article.id]: cur.commentCounts[article.id] ?? article.commentsCount ?? 0 },
      repostCounts: { ...cur.repostCounts, [article.id]: cur.repostCounts[article.id] ?? article.repostsCount ?? 0 },
    }));
    if (!isBackendId(article.id)) return;
    try {
      const session = readStoredSession();
      const summaryP = session
        ? requestWithStoredSession<ReactionSummary>(session, `/interactions/articles/${article.id}/reactions/`).then(r => r.data)
        : apiRequest<ReactionSummary>(`/interactions/articles/${article.id}/reactions/`);
      const commentsP = apiRequest<BackendComment[] | { results: BackendComment[] }>(`/interactions/articles/${article.id}/comments/`);
      const [summary, commentsPayload] = await Promise.all([summaryP, commentsP]);
      const comments = extractList(commentsPayload);
      setState(cur => ({
        ...cur,
        reactions: { ...cur.reactions, [article.id]: summary.user_reaction },
        likeCounts: { ...cur.likeCounts, [article.id]: summary.likes },
        dislikeCounts: { ...cur.dislikeCounts, [article.id]: summary.dislikes },
        comments: { ...cur.comments, [article.id]: comments.map(mapBackendComment) },
        commentCounts: { ...cur.commentCounts, [article.id]: summary.comments ?? comments.length },
        repostCounts: { ...cur.repostCounts, [article.id]: summary.reposts },
      }));
    } catch {}
  };

  const getReaction = (id: string) => state.reactions[id];
  const getComments = (id: string) => state.comments[id] ?? [];
  const getCommentCount = (id: string) => state.commentCounts[id];
  const isReposted = (id: string) => state.reposts[id];
  const getLikeCount = (id: string) => state.likeCounts[id];
  const getDislikeCount = (id: string) => state.dislikeCounts[id];
  const getRepostCount = (id: string) => state.repostCounts[id];

  const toggleReactionLocally = (articleId: string, type: 'like' | 'dislike') => {
    setState(cur => {
      const prev = cur.reactions[articleId] ?? null;
      const next = prev === type ? null : type;
      const likes = cur.likeCounts[articleId] ?? 0;
      const dislikes = cur.dislikeCounts[articleId] ?? 0;
      return {
        ...cur,
        reactions: { ...cur.reactions, [articleId]: next },
        likeCounts: { ...cur.likeCounts, [articleId]: prev === 'like' && next !== 'like' ? Math.max(0, likes - 1) : prev !== 'like' && next === 'like' ? likes + 1 : likes },
        dislikeCounts: { ...cur.dislikeCounts, [articleId]: prev === 'dislike' && next !== 'dislike' ? Math.max(0, dislikes - 1) : prev !== 'dislike' && next === 'dislike' ? dislikes + 1 : dislikes },
      };
    });
  };

  const toggleLike = (articleId: string) => {
    toggleReactionLocally(articleId, 'like');
    if (!isBackendId(articleId)) return;
    void (async () => {
      const session = readStoredSession();
      if (!session) return;
      try {
        const { data } = await requestWithStoredSession<ReactionSummary>(session, `/interactions/articles/${articleId}/react/`, { method: 'POST', body: JSON.stringify({ reaction_type: 'like' }) });
        setState(cur => ({ ...cur, reactions: { ...cur.reactions, [articleId]: data.user_reaction }, likeCounts: { ...cur.likeCounts, [articleId]: data.likes }, dislikeCounts: { ...cur.dislikeCounts, [articleId]: data.dislikes } }));
      } catch {}
    })();
  };

  const toggleDislike = (articleId: string) => {
    toggleReactionLocally(articleId, 'dislike');
    if (!isBackendId(articleId)) return;
    void (async () => {
      const session = readStoredSession();
      if (!session) return;
      try {
        const { data } = await requestWithStoredSession<ReactionSummary>(session, `/interactions/articles/${articleId}/react/`, { method: 'POST', body: JSON.stringify({ reaction_type: 'dislike' }) });
        setState(cur => ({ ...cur, reactions: { ...cur.reactions, [articleId]: data.user_reaction }, likeCounts: { ...cur.likeCounts, [articleId]: data.likes }, dislikeCounts: { ...cur.dislikeCounts, [articleId]: data.dislikes } }));
      } catch {}
    })();
  };

  const addComment = (articleId: string, text: string, user: AuthUser) => {
    const local: Comment = { id: `c_${Date.now()}`, articleId, authorEmail: user.email, authorName: user.displayName, text: text.trim(), createdAt: new Date().toISOString() };
    setState(cur => ({
      ...cur,
      comments: { ...cur.comments, [articleId]: [local, ...(cur.comments[articleId] ?? [])] },
      commentCounts: { ...cur.commentCounts, [articleId]: (cur.commentCounts[articleId] ?? 0) + 1 },
    }));
    if (!isBackendId(articleId)) return;
    void (async () => {
      const session = readStoredSession();
      if (!session) return;
      try {
        const { data } = await requestWithStoredSession<BackendComment>(session, `/interactions/articles/${articleId}/comments/`, { method: 'POST', body: JSON.stringify({ text: text.trim() }) });
        const mapped = mapBackendComment(data);
        setState(cur => ({ ...cur, comments: { ...cur.comments, [articleId]: [mapped, ...(cur.comments[articleId] ?? []).filter(c => c.id !== local.id)] } }));
      } catch {}
    })();
  };

  const toggleRepost = (articleId: string, currentReposted = false) => {
    setState(cur => ({
      ...cur,
      reposts: { ...cur.reposts, [articleId]: !(cur.reposts[articleId] ?? currentReposted) },
      repostCounts: { ...cur.repostCounts, [articleId]: Math.max(0, (cur.repostCounts[articleId] ?? 0) + ((cur.reposts[articleId] ?? currentReposted) ? -1 : 1)) },
    }));
    if (!isBackendId(articleId)) return;
    void (async () => {
      const session = readStoredSession();
      if (!session) return;
      try {
        const { data } = await requestWithStoredSession<RepostSummary>(session, `/interactions/articles/${articleId}/repost/`, { method: 'POST' });
        setState(cur => ({ ...cur, reposts: { ...cur.reposts, [articleId]: data.reposted }, repostCounts: { ...cur.repostCounts, [articleId]: data.reposts } }));
      } catch {}
    })();
  };

  return (
    <InteractionsContext.Provider value={{ hydrateArticleInteractions, getReaction, getComments, getCommentCount, isReposted, getLikeCount, getDislikeCount, getRepostCount, toggleLike, toggleDislike, addComment, toggleRepost }}>
      {children}
    </InteractionsContext.Provider>
  );
}

export function useInteractions() {
  const ctx = useContext(InteractionsContext);
  if (!ctx) throw new Error('useInteractions must be within InteractionsProvider');
  return ctx;
}
