'use client';

import { useEffect, useState } from 'react';
import { fetchImmigrationStats, type ImmigrationStats } from '@/services/newsService';

/* Short codes for the compact labels; anything unmapped falls back to the
   full name so a new/renamed IRCC label still renders readably. */
const PROVINCE_CODES: Record<string, string> = {
  'Ontario': 'ON',
  'Quebec': 'QC',
  'British Columbia': 'BC',
  'Alberta': 'AB',
  'Manitoba': 'MB',
  'Saskatchewan': 'SK',
  'Nova Scotia': 'NS',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Prince Edward Island': 'PE',
  'Northwest Territories': 'NT',
  'Yukon': 'YT',
  'Nunavut': 'NU',
};

export function ImmigrationByProvince() {
  const [stats, setStats] = useState<ImmigrationStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchImmigrationStats().then(result => {
      if (!cancelled) setStats(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // No data yet (table empty or fetch failed) -> hide rather than show blanks.
  if (!stats || stats.provinces.length === 0) return null;

  const top = stats.provinces.slice(0, 8);
  const max = top[0]?.share || 1;

  return (
    <section
      className="rounded-xl border border-[#E8E8E8] dark:border-[#2A2A2A] overflow-hidden"
      aria-label="Immigration by province"
    >
      <div className="px-4 py-3 border-b border-[#E8E8E8] dark:border-[#2A2A2A] flex items-baseline justify-between gap-2">
        <h2 className="font-bold text-[14px] text-[#1a1a1a] dark:text-[#F5F5F5] tracking-tight">
          Immigration by Province
        </h2>
        <span className="text-[11px] text-[#999] flex-shrink-0">{stats.year}</span>
      </div>

      <div className="p-4 space-y-2.5">
        {top.map(p => (
          <div key={p.province} className="flex items-center gap-2.5">
            <span className="w-7 flex-shrink-0 text-[11px] font-bold text-[#666] dark:text-[#AAA]">
              {PROVINCE_CODES[p.province] ?? p.province.slice(0, 2).toUpperCase()}
            </span>

            <div className="flex-1 h-4 bg-gray-100 dark:bg-[#222] rounded-sm overflow-hidden">
              <div
                className="h-full bg-canadaRed/85 rounded-sm"
                style={{ width: `${Math.max((p.share / max) * 100, 2)}%` }}
              />
            </div>

            <span className="w-11 flex-shrink-0 text-right text-[11px] font-semibold text-[#1a1a1a] dark:text-[#F5F5F5] tabular-nums">
              {p.share}%
            </span>
            <span className="w-14 flex-shrink-0 text-right text-[11px] text-[#999] tabular-nums hidden sm:inline">
              {p.total.toLocaleString('en-CA')}
            </span>
          </div>
        ))}
      </div>

      {stats.top_source_countries.length > 0 && (
        <div className="px-4 py-3 border-t border-[#E8E8E8] dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#161616]">
          <p className="text-[11px] text-[#666] dark:text-[#AAA]">
            <span className="font-bold text-[#1a1a1a] dark:text-[#F5F5F5]">Top Source Countries: </span>
            {stats.top_source_countries.map(c => c.country.split(',')[0]).join(' • ')}
          </p>
        </div>
      )}

      {stats.source && (
        <div className="px-4 pb-3 bg-gray-50 dark:bg-[#161616]">
          <p className="text-[10px] text-[#999] leading-snug">{stats.source}. {stats.note}</p>
        </div>
      )}
    </section>
  );
}
