import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import type { Article } from './AppContext';

const AUTH_KEY = '@canada247_auth';
const POSTS_KEY = '@canada247_posts';
const OTP_KEY = '@canada247_otp';
const OTP_TTL = 10 * 60 * 1000; // 10 minutes

export interface AuthUser {
  email: string;
  displayName: string;
  joinedAt: string;
}

export interface UserPost extends Article {
  authorEmail: string;
  authorName: string;
  body: string;
  createdAt: string;
  isUserPost: true;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthLoading: boolean;
  userPosts: UserPost[];
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  addPost: (post: UserPost) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function deriveDisplayName(email: string): string {
  const local = email.split('@')[0];
  return local
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [authRaw, postsRaw] = await Promise.all([
          AsyncStorage.getItem(AUTH_KEY),
          AsyncStorage.getItem(POSTS_KEY),
        ]);
        if (authRaw) setUser(JSON.parse(authRaw));
        if (postsRaw) setUserPosts(JSON.parse(postsRaw));
      } catch {}
      setIsAuthLoading(false);
    })();
  }, []);

  const sendOTP = async (email: string): Promise<void> => {
    const otp = generateOTP();
    const payload = { email, otp, expiresAt: Date.now() + OTP_TTL };
    await AsyncStorage.setItem(OTP_KEY, JSON.stringify(payload));

    // ─── Development: show OTP in alert ───────────────────────────────
    // In production: replace this block with your email provider
    // e.g. EmailJS, Firebase, Supabase, or your own API endpoint
    Alert.alert(
      'Verification Code Sent',
      `A 6-digit code has been sent to ${email}.\n\n` +
      `[DEV MODE] Your code is: ${otp}`,
      [{ text: 'OK' }]
    );
    // ──────────────────────────────────────────────────────────────────
  };

  const verifyOTP = async (email: string, code: string): Promise<boolean> => {
    try {
      const raw = await AsyncStorage.getItem(OTP_KEY);
      if (!raw) return false;
      const { email: storedEmail, otp, expiresAt } = JSON.parse(raw);
      if (storedEmail !== email) return false;
      if (Date.now() > expiresAt) return false;
      if (otp !== code.trim()) return false;

      await AsyncStorage.removeItem(OTP_KEY);
      const newUser: AuthUser = {
        email,
        displayName: deriveDisplayName(email),
        joinedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch {
      return false;
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  const addPost = async (post: UserPost) => {
    const updated = [post, ...userPosts];
    setUserPosts(updated);
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthLoading,
      userPosts,
      sendOTP,
      verifyOTP,
      signOut,
      addPost,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
}
