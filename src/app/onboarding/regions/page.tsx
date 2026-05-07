'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { clsx } from 'clsx';

const ALL_REGIONS = [
  'British Columbia', 'Calgary', 'Edmonton', 'Hamilton',
  'Kitchener-Waterloo', 'London', 'Manitoba', 'Montreal',
  'Newfoundland & Labrador', 'New Brunswick', 'Northern Canada',
  'Nova Scotia', 'Ottawa', 'PEI', 'Quebec', 'Saskatchewan',
  'Toronto', 'Windsor',
];

export default function RegionSelectionPage() {
  const { selectedRegions, toggleRegion, completeOnboarding } = useApp();
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/alerts');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] flex flex-col">
      {/* Red header bar */}
      <div className="bg-[#D52B1E] px-4 pt-12 pb-6">
        <p className="bebas text-white/70 text-sm tracking-widest mb-1">STEP 1 OF 2</p>
        <h1 className="bebas text-white text-3xl tracking-widest leading-tight">SELECT YOUR REGIONS</h1>
        <p className="text-white/80 text-sm mt-1">Choose the regions you want to follow</p>
      </div>

      {/* Region list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          {ALL_REGIONS.map(region => {
            const selected = selectedRegions.includes(region);
            return (
              <button
                key={region}
                onClick={() => toggleRegion(region)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left',
                  selected
                    ? 'border-[#D52B1E] bg-[#D52B1E]/5 dark:bg-[#D52B1E]/10'
                    : 'border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] hover:border-gray-300',
                )}
              >
                <div className={clsx(
                  'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  selected ? 'bg-[#D52B1E] border-[#D52B1E]' : 'border-gray-300 dark:border-[#444]',
                )}>
                  {selected && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={clsx('bebas tracking-wider text-sm', selected ? 'text-[#D52B1E]' : 'text-[#1A1A1A] dark:text-[#F5F5F5]')}>
                  {region.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-white dark:bg-[#0D0D0D] border-t border-gray-100 dark:border-[#2A2A2A] px-4 py-4 flex gap-3">
        <button
          onClick={() => { completeOnboarding(); router.replace('/'); }}
          className="px-4 py-3 text-gray-400 bebas tracking-wider text-sm hover:text-gray-600 transition-colors"
        >
          SKIP
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3.5 bg-[#D52B1E] text-white bebas tracking-widest text-base rounded-xl hover:bg-[#B02010] transition-colors"
        >
          NEXT STEP →
        </button>
      </div>
    </div>
  );
}
