'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import {
  Zap, Star, Sun, Landmark, Briefcase, Heart, Film,
  Cpu, Trophy, Globe, MapPin, Plane, Users, Car,
  BookOpen, Lightbulb, Bell, Leaf, Newspaper,
} from 'lucide-react';

const PREFERENCE_GROUPS = [
  {
    label: 'Essential',
    items: [
      { key: 'Breaking News',    icon: Zap,       desc: 'Urgent alerts as they happen' },
      { key: 'Top Stories',      icon: Star,      desc: "The day's most important stories" },
      { key: 'Morning Brief',    icon: Sun,       desc: 'Daily digest every morning' },
    ],
  },
  {
    label: 'News & Politics',
    items: [
      { key: 'Politics',         icon: Landmark,  desc: 'Parliament, elections & policy' },
      { key: 'Business',         icon: Briefcase, desc: 'Economy, markets & companies' },
      { key: 'Health',           icon: Heart,     desc: 'Wellness, medicine & public health' },
      { key: 'World',            icon: Globe,     desc: 'International affairs & diplomacy' },
    ],
  },
  {
    label: 'Lifestyle',
    items: [
      { key: 'Entertainment',    icon: Film,      desc: 'Arts, culture & celebrity' },
      { key: 'Sports',           icon: Trophy,    desc: 'Hockey, CFL, NBA & more' },
      { key: 'Technology',       icon: Cpu,       desc: 'Tech, science & innovation' },
      { key: 'Auto News',        icon: Car,       desc: 'Automotive news & reviews' },
    ],
  },
  {
    label: 'Community',
    items: [
      { key: 'Immigration',      icon: MapPin,    desc: 'Immigration news & policy' },
      { key: 'Indigenous',       icon: Leaf,      desc: 'Indigenous peoples & reconciliation' },
      { key: 'Aviation',         icon: Plane,     desc: 'Airlines & aviation news' },
      { key: 'Blacks in Canada', icon: Users,     desc: 'Black Canadian community & culture' },
      { key: 'Education in Canada', icon: BookOpen, desc: 'Schools, universities & learning' },
      { key: 'Opportunities',    icon: Lightbulb, desc: 'Jobs, grants & community programs' },
      { key: 'Events',           icon: Bell,      desc: 'Local events & happenings' },
      { key: 'Recommended For You', icon: Newspaper, desc: 'Personalised just for you' },
    ],
  },
];

export default function AlertSetupPage() {
  const { alerts, toggleAlert, completeOnboarding } = useApp();
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !user) router.replace('/auth/email');
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0D0D0D]">
        <div className="w-8 h-8 border-2 border-canadaRed border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedCount = Object.values(alerts).filter(Boolean).length;

  const handleFinish = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D] flex flex-col">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2A2A2A] px-4 py-4 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 dark:border-[#333] bg-white flex items-center justify-center">
          <Image
            src="/canada247-logo.jpg"
            alt="Canada 247"
            width={56}
            height={56}
            className="w-full h-full object-contain p-1"
            priority
          />
        </div>
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

      {/* ── Preference Groups ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          {PREFERENCE_GROUPS.map(group => (
            <div key={group.label}>
              <h2 className="font-sans font-bold text-[11px] tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 mb-3">
                {group.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {group.items.map(({ key, icon: Icon, desc }) => {
                  const enabled = alerts[key] ?? false;
                  return (
                    <button
                      key={key}
                      onClick={() => toggleAlert(key)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 group',
                        enabled
                          ? 'border-canadaRed bg-canadaRed/5 dark:bg-canadaRed/10'
                          : 'border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] hover:border-gray-300 dark:hover:border-[#444]',
                      )}
                      aria-pressed={enabled}
                    >
                      {/* Icon container */}
                      <div className={clsx(
                        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                        enabled ? 'bg-canadaRed text-white' : 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500 dark:text-gray-400',
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          'font-sans font-bold text-[13px] leading-snug',
                          enabled ? 'text-canadaRed' : 'text-[#1A1A1A] dark:text-[#F5F5F5]',
                        )}>
                          {key}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5 truncate">
                          {desc}
                        </p>
                      </div>

                      {/* Checkmark */}
                      <div className={clsx(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
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
            {selectedCount > 0
              ? `Get Started with ${selectedCount} topic${selectedCount !== 1 ? 's' : ''} →`
              : 'Select at least one topic'}
          </button>
          <button
            onClick={handleFinish}
            className="text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1 font-sans"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
