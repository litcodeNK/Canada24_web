'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { apiRequest, extractList } from '@/services/api';
import { clsx } from 'clsx';
import { Star } from 'lucide-react';

type PreferenceSource = 'top' | 'category' | 'none';
type PreferenceItem = { key: string; desc: string; source: PreferenceSource };
type PreferenceGroup = { label: string; items: PreferenceItem[] };

const PREFERENCE_GROUPS: PreferenceGroup[] = [
  {
    label: 'Essential',
    items: [
      { key: 'Breaking News', desc: 'Urgent alerts as they happen', source: 'top' },
      { key: 'Top Stories', desc: "The day's most important stories", source: 'top' },
      { key: 'Morning Brief', desc: 'Daily digest every morning', source: 'none' },
    ],
  },
  {
    label: 'News & Politics',
    items: [
      { key: 'Politics', desc: 'Parliament, elections & policy', source: 'category' },
      { key: 'Business', desc: 'Economy, markets & companies', source: 'category' },
      { key: 'Health', desc: 'Wellness, medicine & public health', source: 'category' },
      { key: 'World', desc: 'International affairs & diplomacy', source: 'category' },
    ],
  },
  {
    label: 'Lifestyle',
    items: [
      { key: 'Entertainment', desc: 'Arts, culture & celebrity', source: 'category' },
      { key: 'Sports', desc: 'Hockey, CFL, NBA & more', source: 'category' },
      { key: 'Technology', desc: 'Tech, science & innovation', source: 'category' },
      { key: 'Auto News', desc: 'Automotive news & reviews', source: 'category' },
    ],
  },
  {
    label: 'Community',
    items: [
      { key: 'Immigration', desc: 'Immigration news & policy', source: 'category' },
      { key: 'Indigenous', desc: 'Indigenous peoples & reconciliation', source: 'category' },
      { key: 'Aviation', desc: 'Airlines & aviation news', source: 'category' },
      { key: 'Blacks in Canada', desc: 'Black Canadian community & culture', source: 'category' },
      { key: 'Education in Canada', desc: 'Schools, universities & learning', source: 'category' },
      { key: 'Opportunities', desc: 'Jobs, grants & community programs', source: 'category' },
      { key: 'Events', desc: 'Local events & happenings', source: 'category' },
      { key: 'Recommended For You', desc: 'Personalised just for you', source: 'none' },
    ],
  },
];

const CATEGORY_NAME_ALIASES: Record<string, string> = {
  'education in canada': 'Education in Canada',
};

function TopicThumb({ imgUrl, className }: { imgUrl?: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (imgUrl && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imgUrl} alt="" className={clsx('object-cover', className)} loading="lazy" onError={() => setFailed(true)} />;
  }
  return (
    <div className={clsx('flex items-center justify-center bg-gradient-to-br from-canadaRed/60 to-canadaRedDark', className)}>
      <span className="font-display text-white/40 text-sm">CN</span>
    </div>
  );
}

export default function AlertSetupPage() {
  const { alerts, toggleAlert, completeOnboarding, onboardingComplete, topStories } = useApp();
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();
  // Reached fresh from signup (onboarding not finished yet) vs. reopened later
  // from the sidebar to edit preferences — these need different exits.
  const isOnboardingFlow = !onboardingComplete;

  const [thumbnails, setThumbnails] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (!isAuthLoading && !user) router.replace('/auth/email');
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    let cancelled = false;
    const categoryNames = PREFERENCE_GROUPS.flatMap(g => g.items).filter(i => i.source === 'category').map(i => i.key);

    (async () => {
      try {
        const sections = await apiRequest<{ slug: string; label: string }[]>('/news/sections/');
        if (cancelled) return;

        await Promise.all(categoryNames.map(async name => {
          const alias = CATEGORY_NAME_ALIASES[name.toLowerCase()] ?? name;
          const match = sections.find(s => s.label.toLowerCase() === alias.toLowerCase());
          if (!match) return;
          try {
            const payload = await apiRequest<unknown>(`/news/sections/${match.slug}/`);
            const list = extractList(payload as never[]) as Array<{ img_url?: string }>;
            const imgUrl = list[0]?.img_url;
            if (!cancelled && imgUrl) {
              setThumbnails(prev => ({ ...prev, [name]: imgUrl }));
            }
          } catch {}
        }));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0D0D0D]">
        <div className="w-8 h-8 border-2 border-canadaRed border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedCount = Object.values(alerts).filter(Boolean).length;
  const topStoryImg = topStories[0]?.imgUrl;

  const handleFinish = () => {
    completeOnboarding();
    if (isOnboardingFlow) {
      router.replace('/');
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D] flex flex-col">

      {/* ── Header ── */}
      <div className="relative bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2A2A2A] px-4 py-4 flex flex-col items-center gap-3">
        {!isOnboardingFlow && (
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 text-gray-400 hover:text-canadaRed transition-colors p-1.5 -m-1.5"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
        )}
        <Image
          src="/canada247-logo.png"
          alt="Canada 247"
          width={686}
          height={583}
          className="h-12 w-auto object-contain"
          priority
        />
        <div className="text-center">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#1a1a1a] dark:text-white leading-tight">
            What do you want to follow?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-sans">
            Pick your topics — we'll personalise your feed and notifications.
          </p>
        </div>

        {/* Progress pill */}
        {selectedCount > 0 && (
          <div className="inline-flex items-center gap-1.5 bg-canadaRed/10 text-canadaRed text-xs font-bold px-3 py-1 rounded-full font-sans">
            <Star className="w-3 h-3 fill-canadaRed" />
            {selectedCount} topic{selectedCount !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      {/* ── Preference Groups (list layout) ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          {PREFERENCE_GROUPS.map(group => (
            <div key={group.label}>
              <h2 className="font-sans font-bold text-[11px] tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 mb-3">
                {group.label}
              </h2>
              <div className="flex flex-col gap-2.5">
                {group.items.map(({ key, desc, source }) => {
                  const enabled = alerts[key] ?? false;
                  const imgUrl = source === 'top' ? topStoryImg : source === 'category' ? thumbnails[key] : undefined;
                  return (
                    <button
                      key={key}
                      onClick={() => toggleAlert(key)}
                      className={clsx(
                        'flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-150 w-full',
                        enabled
                          ? 'bg-oxfordBlue dark:bg-oxfordBlueDark ring-2 ring-canadaRed'
                          : 'bg-gray-100 dark:bg-[#1C1C1C] hover:bg-gray-200 dark:hover:bg-[#242424]',
                      )}
                      aria-pressed={enabled}
                    >
                      <TopicThumb imgUrl={imgUrl} className="w-16 h-16 rounded-lg flex-shrink-0" />

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          'font-sans font-bold text-[14px] leading-snug',
                          enabled ? 'text-white' : 'text-[#1A1A1A] dark:text-[#F5F5F5]',
                        )}>
                          {key}
                        </p>
                        <p className={clsx(
                          'text-[12px] leading-tight mt-0.5',
                          enabled ? 'text-white/70' : 'text-gray-400 dark:text-gray-500',
                        )}>
                          {desc}
                        </p>
                      </div>

                      {/* Checkmark */}
                      <div className={clsx(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all mr-1',
                        enabled ? 'bg-canadaRed border-canadaRed' : 'border-gray-300 dark:border-[#444]',
                      )}>
                        {enabled && (
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom spacer for sticky button */}
        <div className="h-24" />
      </div>

      {/* ── Sticky CTA ── */}
      <div className="sticky bottom-0 bg-white dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-[#2A2A2A] px-4 py-4 safe-bottom">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          <button
            onClick={handleFinish}
            disabled={selectedCount === 0}
            className={clsx(
              'w-full py-4 font-sans font-bold text-[15px] tracking-wide rounded-xl transition-all',
              selectedCount > 0
                ? 'bg-canadaRed text-white hover:bg-canadaRedDark shadow-lg shadow-canadaRed/20'
                : 'bg-gray-200 dark:bg-[#2A2A2A] text-gray-400 cursor-not-allowed',
            )}
          >
            {selectedCount === 0
              ? 'Select at least one topic'
              : isOnboardingFlow
                ? `Get Started with ${selectedCount} topic${selectedCount !== 1 ? 's' : ''} →`
                : 'Save Preferences'}
          </button>
          {isOnboardingFlow && (
            <button
              onClick={handleFinish}
              className="text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1 font-sans"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
