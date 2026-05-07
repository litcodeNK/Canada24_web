'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { clsx } from 'clsx';

const ALERT_CATEGORIES = [
  'Breaking News', 'Top Stories', 'Morning Brief', 'Recommended For You',
  'Business', 'Health', 'Entertainment', 'Technology', 'Sports',
  'Immigration', 'Aviation', 'Indigenous', 'Politics', 'Events',
  'Auto News', 'Blacks in Canada', 'Education in Canada', 'Opportunities', 'World',
];

export default function AlertSetupPage() {
  const { alerts, toggleAlert, completeOnboarding } = useApp();
  const router = useRouter();

  const handleFinish = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] flex flex-col">
      <div className="bg-[#D52B1E] px-4 pt-12 pb-6">
        <p className="bebas text-white/70 text-sm tracking-widest mb-1">STEP 2 OF 2</p>
        <h1 className="bebas text-white text-3xl tracking-widest leading-tight">ALERT PREFERENCES</h1>
        <p className="text-white/80 text-sm mt-1">Choose your notification categories</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          {ALERT_CATEGORIES.map(category => {
            const enabled = alerts[category] ?? false;
            return (
              <div
                key={category}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]"
              >
                <span className="bebas tracking-wider text-sm text-[#1A1A1A] dark:text-[#F5F5F5]">
                  {category.toUpperCase()}
                </span>
                <button
                  onClick={() => toggleAlert(category)}
                  className={clsx(
                    'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
                    enabled ? 'bg-[#D52B1E]' : 'bg-gray-200 dark:bg-[#333]',
                  )}
                >
                  <span
                    className={clsx(
                      'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                      enabled ? 'translate-x-5' : 'translate-x-0.5',
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white dark:bg-[#0D0D0D] border-t border-gray-100 dark:border-[#2A2A2A] px-4 py-4 flex gap-3">
        <button
          onClick={() => router.back()}
          className="px-4 py-3 text-gray-400 bebas tracking-wider text-sm hover:text-gray-600 transition-colors"
        >
          ← BACK
        </button>
        <button
          onClick={handleFinish}
          className="flex-1 py-3.5 bg-[#D52B1E] text-white bebas tracking-widest text-base rounded-xl hover:bg-[#B02010] transition-colors"
        >
          GET STARTED
        </button>
      </div>
    </div>
  );
}
