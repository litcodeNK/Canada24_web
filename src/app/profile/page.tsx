'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { apiRequest } from '@/services/api';
import { readStoredSession } from '@/services/sessionService';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthLoading, signOut } = useAuth();
  const { savedArticles } = useApp();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
      setBio(user.bio ?? '');
    }
  }, [user]);

  // Redirect to auth if not logged in (after auth check completes)
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/auth/email');
    }
  }, [isAuthLoading, user, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setFeedback(null);
    try {
      const session = readStoredSession<{ accessToken: string; refreshToken: string }>();
      if (!session) throw new Error('No session found');
      await apiRequest('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify({ display_name: displayName.trim(), bio: bio.trim() }),
        token: session.accessToken,
      });
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile.';
      setFeedback({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  // Show spinner while auth is loading or while redirecting (user is null after load)
  if (isAuthLoading || (!isAuthLoading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0D0D0D]">
        <div className="w-10 h-10 border-4 border-[#D52B1E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // TS narrowing: user is guaranteed non-null past the guard above
  const safeUser = user!;

  const memberYear = safeUser.joinedAt
    ? new Date(safeUser.joinedAt).getFullYear()
    : new Date().getFullYear();

  const initials = (safeUser.displayName?.[0] ?? safeUser.email[0]).toUpperCase();

  return (
    <AppShell>
      <div className="max-w-[640px] mx-auto px-4 py-8">

        {/* ── Avatar + Name header ── */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 select-none"
            style={{ backgroundColor: '#D52B1E' }}
          >
            {initials}
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white leading-tight">
            {safeUser.displayName || 'Anonymous'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{safeUser.email}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Member since {memberYear}
          </p>
        </div>

        {/* ── Subscription badge ── */}
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1C1C1C] mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-[#2A2A2A] px-2 py-0.5 rounded-sm">
              FREE PLAN
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">Basic access</span>
          </div>
          <Link
            href="/subscribe"
            className="text-sm font-semibold text-[#D52B1E] hover:underline whitespace-nowrap"
          >
            Upgrade to Premium →
          </Link>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1C1C1C] text-center">
            <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
              {savedArticles.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
              Saved Articles
            </p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1C1C1C] text-center">
            <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">0</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
              Comments
            </p>
          </div>
        </div>

        {/* ── Edit Profile form ── */}
        <div className="border border-gray-200 dark:border-[#2A2A2A] p-6 mb-8">
          <h2 className="font-serif font-bold text-lg text-[#1a1a1a] dark:text-white mb-5">
            Edit Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full px-3 py-2 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-[#2A2A2A] text-sm text-[#1a1a1a] dark:text-white outline-none focus:border-[#D52B1E] placeholder:text-gray-400 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell us a little about yourself…"
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-[#2A2A2A] text-sm text-[#1a1a1a] dark:text-white outline-none focus:border-[#D52B1E] placeholder:text-gray-400 transition-colors resize-none"
              />
            </div>

            {feedback && (
              <p
                className={`text-sm font-medium ${
                  feedback.type === 'success'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-[#D52B1E]'
                }`}
              >
                {feedback.message}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 bg-[#D52B1E] text-white text-sm font-bold tracking-wide hover:bg-[#B02010] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* ── Sign out ── */}
        <button
          onClick={handleSignOut}
          className="w-full py-2.5 border border-gray-300 dark:border-[#2A2A2A] text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-[#D52B1E] hover:text-[#D52B1E] transition-colors"
        >
          Sign Out
        </button>
      </div>
    </AppShell>
  );
}
