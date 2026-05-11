'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { useApp, type ServerAlertPreferences, type ServerRegion } from './AppContext';
import { mapBackendArticle, mapBackendUserPost } from '../services/newsService';
import {
  clearStoredSession,
  readStoredSession,
  requestWithStoredSession,
  writeStoredSession,
} from '../services/sessionService';

export type UserPostStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  joinedAt: string;
  avatar?: string;
  bio?: string;
}

export interface UserPost {
  id: string;
  headline: string;
  body: string;
  category?: string;
  time: string;
  imgUrl?: string;
  isLive?: boolean;
  isUserPost: true;
  status: UserPostStatus;
  authorEmail: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

type BackendAuthUser = {
  id: number; email: string; display_name: string; avatar: string; bio: string; joined_at: string;
};

type BackendUserPost = {
  id: number; headline: string; body: string; category: string; img_url: string;
  status: UserPostStatus; created_at: string; updated_at: string; time: string;
  author_name: string; author_email: string;
};

type BackendArticle = {
  id: number; external_id: string; headline: string; body: string; category: string;
  img_url: string; source_url: string; author: string; published_at: string; time: string;
  is_live: boolean; is_updated: boolean; source: string; feed_key: string; region_slugs: string[];
  likes_count: number; dislikes_count: number; comments_count: number; reposts_count: number;
  saves_count: number; user_reaction: 'like' | 'dislike' | null; is_saved: boolean; is_reposted: boolean;
};

type VerifyOtpResponse = { access: string; refresh: string; is_new_user: boolean; user: BackendAuthUser };
type SendOtpResponse = { detail: string; dev_code?: string };
type BootstrapResponse = {
  user: BackendAuthUser; regions: ServerRegion[]; region_slugs: string[];
  alerts: ServerAlertPreferences; saved_articles: BackendArticle[]; my_posts: BackendUserPost[];
};

type StoredSession = { accessToken: string; refreshToken: string; user: AuthUser };
type CreatePostInput = { headline: string; body: string; category: string; imgUrl?: string };

interface AuthContextType {
  user: AuthUser | null;
  isAuthLoading: boolean;
  userPosts: UserPost[];
  sendOTP: (email: string) => Promise<{ devCode?: string }>;
  verifyOTP: (email: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  addPost: (post: CreatePostInput) => Promise<UserPost>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapBackendUser(u: BackendAuthUser): AuthUser {
  return { id: String(u.id), email: u.email, displayName: u.display_name, joinedAt: u.joined_at, avatar: u.avatar || undefined, bio: u.bio || undefined };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { hydrateServerState, clearServerState } = useApp();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const persistSession = (nextSession: StoredSession | null) => {
    setSession(nextSession);
    if (nextSession) writeStoredSession(nextSession);
    else clearStoredSession();
  };

  const syncBootstrap = async (currentSession: StoredSession) => {
    const { data, session: nextSession } = await requestWithStoredSession<BootstrapResponse, StoredSession>(
      currentSession, '/auth/bootstrap/',
    );
    const resolved: StoredSession = { ...nextSession, user: mapBackendUser(data.user) };
    persistSession(resolved);
    hydrateServerState({
      regionNames: data.regions.map(r => r.name),
      alerts: data.alerts,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      savedArticles: data.saved_articles.map(a => mapBackendArticle(a as any)),
    });
    setUserPosts(data.my_posts.map(mapBackendUserPost));
  };

  useEffect(() => {
    (async () => {
      try {
        const stored = readStoredSession<StoredSession>();
        if (!stored) { setIsAuthLoading(false); return; }
        setSession(stored);
        await syncBootstrap(stored);
      } catch {
        persistSession(null);
        clearServerState();
        setUserPosts([]);
      } finally {
        setIsAuthLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendOTP = async (email: string): Promise<{ devCode?: string }> => {
    const payload = await apiRequest<SendOtpResponse>('/auth/send-otp/', {
      method: 'POST', body: JSON.stringify({ email }), timeoutMs: 20_000,
    });
    return { devCode: payload.dev_code };
  };

  const verifyOTP = async (email: string, code: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const payload = await apiRequest<VerifyOtpResponse>('/auth/verify-otp/', {
        method: 'POST', body: JSON.stringify({ email, code: code.trim() }), timeoutMs: 20_000,
      });
      const nextSession: StoredSession = {
        accessToken: payload.access, refreshToken: payload.refresh, user: mapBackendUser(payload.user),
      };
      await syncBootstrap(nextSession);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to verify code.',
      };
    }
  };

  const signOut = async () => {
    const cur = readStoredSession<StoredSession>() ?? session;
    if (cur) {
      try {
        await requestWithStoredSession<unknown, StoredSession>(cur, '/auth/logout/', {
          method: 'POST', body: JSON.stringify({ refresh: cur.refreshToken }),
        });
      } catch {}
    }
    persistSession(null);
    clearServerState();
    setUserPosts([]);
  };

  const addPost = async (post: CreatePostInput): Promise<UserPost> => {
    const cur = readStoredSession<StoredSession>() ?? session;
    if (!cur) throw new Error('Authentication required');
    const { data } = await requestWithStoredSession<BackendUserPost, StoredSession>(cur, '/news/posts/', {
      method: 'POST',
      body: JSON.stringify({
        headline: post.headline.trim(), body: post.body.trim(),
        category: post.category.toUpperCase().replace(/[^A-Z0-9]+/g, '_'),
        img_url: post.imgUrl?.trim() || '',
      }),
    });
    const created = mapBackendUserPost(data);
    setUserPosts(cur2 => [created, ...cur2.filter(p => p.id !== created.id)]);
    return created;
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, isAuthLoading, userPosts, sendOTP, verifyOTP, signOut, addPost }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
}
