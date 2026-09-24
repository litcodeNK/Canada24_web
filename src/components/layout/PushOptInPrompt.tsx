'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useWebPush } from '@/hooks/useWebPush';

const SHOW_DELAY_MS = 5000;
const DISMISS_SUPPRESS_DAYS = 7;
const DISMISSED_AT_KEY = 'push_prompt_dismissed_at';

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_AT_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return daysSince < DISMISS_SUPPRESS_DAYS;
  } catch {
    return false;
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable — the prompt will just show again next visit
  }
}

/** A few seconds after page load (not immediately, so the page renders
 * first), offers push notifications to a visitor who hasn't already made a
 * browser-level decision either way. Respects Notification.permission as the
 * source of truth — a visitor who already granted or denied it never sees
 * this again, and a "not now" dismissal suppresses it for a week rather than
 * re-showing on every page. */
export function PushOptInPrompt() {
  const { supported, enabled, loading, toggle } = useWebPush();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!supported) return;
    if (enabled) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'default') return;
    if (wasRecentlyDismissed()) return;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [supported, enabled]);

  if (!visible) return null;

  const handleEnable = async () => {
    await toggle();
    // Whether it succeeded or the user declined the native prompt,
    // Notification.permission now reflects a real decision — nothing left to do here.
    setVisible(false);
  };

  const handleDismiss = () => {
    markDismissed();
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 rounded-2xl border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#1a1a1a] shadow-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-canadaRed/10 flex items-center justify-center">
          <Bell className="w-4.5 h-4.5 text-canadaRed" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans font-bold text-sm text-[#1a1a1a] dark:text-white mb-0.5">
            Get breaking news alerts
          </p>
          <p className="text-xs text-[#666] dark:text-[#AAA] leading-snug mb-3">
            Turn on notifications to hear about major stories the moment they happen.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="text-xs font-bold text-white bg-canadaRed rounded-full px-4 py-1.5 hover:bg-canadaRed/90 transition-colors disabled:opacity-60"
            >
              {loading ? 'Enabling…' : 'Enable'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs font-medium text-[#666] dark:text-[#AAA] hover:text-[#1a1a1a] dark:hover:text-white transition-colors px-2 py-1.5"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 text-[#999] hover:text-[#1a1a1a] dark:hover:text-white p-1 -mt-1 -mr-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
