'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/brand/Logo';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

const SHOW_DELAY_MS = 20000;
const SHOW_SCROLL_RATIO = 0.4;
const DISMISS_SUPPRESS_DAYS = 7;
const SHOWN_THIS_SESSION_KEY = 'signin_prompt_shown';
const DISMISSED_AT_KEY = 'signin_prompt_dismissed_at';
const SKIP_PATH_PREFIXES = ['/auth', '/onboarding', '/privacy', '/terms'];

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_AT_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    return (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24) < DISMISS_SUPPRESS_DAYS;
  } catch {
    return false;
  }
}

function shownThisSession(): boolean {
  try {
    return sessionStorage.getItem(SHOWN_THIS_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markShownThisSession(): void {
  try {
    sessionStorage.setItem(SHOWN_THIS_SESSION_KEY, '1');
  } catch {
    // sessionStorage unavailable — fall back to the dismissal suppression only
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable — the prompt will just show again next visit
  }
}

/** Soft sign-in wall for signed-out readers, in the style of NYT / Medium /
 * Substack: it never interrupts on arrival, only after the reader has shown
 * intent (about 20s on the site, or scrolled ~40% down a page). It is
 * dismissable via X, backdrop click or Escape, and a dismissal suppresses it
 * for a week, and it shows at most once per browser session. Shown as a centred card on desktop and a bottom sheet on
 * mobile. Skipped on auth/onboarding/legal pages. */
export function SignInPrompt() {
  const { user, isAuthLoading } = useAuth();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const skip = !!user || isAuthLoading || SKIP_PATH_PREFIXES.some(p => pathname?.startsWith(p));

  useEffect(() => {
    if (skip || wasRecentlyDismissed() || shownThisSession()) return;

    const show = () => {
      markShownThisSession();
      setVisible(true);
    };
    const timer = setTimeout(show, SHOW_DELAY_MS);
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= SHOW_SCROLL_RATIO) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [skip]);

  const dismiss = useCallback(() => {
    markDismissed();
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, dismiss]);

  if (!visible || skip) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px]"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-prompt-title"
        onClick={e => e.stopPropagation()}
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#E8E8E8] dark:border-[#2A2A2A] shadow-2xl px-6 pt-8 pb-6 text-center"
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 text-[#999] hover:text-[#1a1a1a] dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <Logo className="h-12 mx-auto mb-4" />
        <h2 id="signin-prompt-title" className="font-serif font-black text-2xl leading-tight text-[#1a1a1a] dark:text-white mb-2">
          Sign in to get the most out of Canada247
        </h2>
        <p className="text-sm text-[#666] dark:text-[#AAA] leading-relaxed mb-6">
          Save stories, follow your regions and get alerts that matter to you. It&rsquo;s free and takes a minute.
        </p>
        <AnimatedButton href="/auth/email" onClick={markDismissed} block>
          Sign in or create account
        </AnimatedButton>
        <button
          onClick={dismiss}
          className="mt-3 text-xs font-medium text-[#666] dark:text-[#AAA] hover:text-[#1a1a1a] dark:hover:text-white transition-colors px-2 py-1.5"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
