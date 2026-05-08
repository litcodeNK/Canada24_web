'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

const FREE_FEATURES = [
  'Breaking news alerts',
  'All sections access',
  'Save articles',
  'Comment & engage',
  'Local news by region',
];

const PREMIUM_FEATURES = [
  'Everything in Free',
  'Ad-free experience',
  'Exclusive investigative reports',
  'Early access to newsletters',
  'Priority comment highlighting',
  'Offline reading',
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0 mt-0.5"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function SubscribePage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Page header */}
        <div className="text-center mb-10">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#1a1a1a] dark:text-white mb-3">
            Choose Your Plan
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Stay informed with Canada&apos;s most trusted news source. Upgrade for an ad-free,
            exclusive experience.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">

          {/* ── FREE plan ── */}
          <div className="border border-gray-200 dark:border-[#2A2A2A] rounded-none p-6 flex flex-col bg-white dark:bg-[#1A1A1A]">
            <div className="mb-4">
              <span className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2A2A2A] px-2.5 py-1 rounded-sm">
                FREE
              </span>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-[#1a1a1a] dark:text-white">$0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">/ month</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map(feature => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <CheckIcon color="#9CA3AF" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {user ? (
              <div className="flex items-center gap-2 border border-green-500 text-green-600 dark:text-green-400 py-2.5 px-4 text-sm font-semibold justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Current Plan
              </div>
            ) : (
              <Link
                href="/auth/email"
                className="block text-center border border-gray-300 dark:border-[#2A2A2A] text-[#1a1a1a] dark:text-white py-2.5 px-4 text-sm font-semibold hover:border-[#D52B1E] hover:text-[#D52B1E] transition-colors"
              >
                Sign In Free
              </Link>
            )}
          </div>

          {/* ── PREMIUM plan ── */}
          <div
            className="border-2 rounded-none p-6 flex flex-col relative bg-[#FFF8F8] dark:bg-[#1C1010]"
            style={{ borderColor: '#D52B1E' }}
          >

            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-sm"
                style={{ color: '#D52B1E', backgroundColor: '#FDECEA' }}
              >
                PREMIUM
              </span>
              <span
                className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-sm text-white"
                style={{ backgroundColor: '#D52B1E' }}
              >
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-[#1a1a1a] dark:text-white">$4.99</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">/ month</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PREMIUM_FEATURES.map(feature => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <CheckIcon color="#D52B1E" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full border-2 py-2.5 px-4 text-sm font-bold tracking-wide opacity-60 cursor-not-allowed"
              style={{ borderColor: '#D52B1E', color: '#D52B1E', backgroundColor: 'transparent' }}
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Questions? Contact{' '}
          <a
            href="mailto:support@canada247.news"
            className="text-[#D52B1E] hover:underline"
          >
            support@canada247.news
          </a>
        </p>
      </div>
    </AppShell>
  );
}
