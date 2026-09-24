'use client';

import { useEffect, useState } from 'react';
import { fetchImmigrationStats, type ImmigrationStats } from '@/services/newsService';
import { CANADA_PROVINCES, CANADA_VIEWBOX } from '@/lib/canadaMap';

/** Shade provinces by share so the map reads at a glance, rather than every
 *  province being the same flat colour with only the label carrying meaning. */
function fillFor(share: number | undefined, max: number): string {
  if (share === undefined) return 'rgba(148,163,184,0.20)';
  const t = max > 0 ? share / max : 0;
  // 0.10 -> 0.85 opacity of the brand red
  return `rgba(213,43,30,${(0.10 + t * 0.75).toFixed(3)})`;
}

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

  // Nothing ingested yet, or the fetch failed -> hide instead of showing blanks.
  if (!stats || stats.provinces.length === 0) return null;

  const byName = new Map(stats.provinces.map(p => [p.province, p]));
  const max = Math.max(...stats.provinces.map(p => p.share));

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

      <div className="p-3">
        <svg
          viewBox={CANADA_VIEWBOX}
          className="w-full h-auto"
          role="img"
          aria-label={`Map of Canada shaded by share of permanent resident admissions in ${stats.year}`}
        >
          <title>Permanent resident admissions by province, {stats.year}</title>

          {CANADA_PROVINCES.map(prov => {
            const stat = byName.get(prov.name);
            return (
              <path
                key={prov.code}
                d={prov.d}
                fill={fillFor(stat?.share, max)}
                stroke="#ffffff"
                strokeWidth={1.6}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              >
                {stat && (
                  <title>
                    {prov.name}: {stat.total.toLocaleString('en-CA')} ({stat.share}%)
                  </title>
                )}
              </path>
            );
          })}

          {/* Labels drawn after all shapes so they never sit under a neighbour */}
          {CANADA_PROVINCES.map(prov => {
            const stat = byName.get(prov.name);
            if (!stat) return null;
            return (
              <g key={`${prov.code}-label`} pointerEvents="none">
                {/* PE/NS are too small to hold text, so their label sits
                    outside with a hairline connector back to the province. */}
                {prov.outside && prov.anchorX !== undefined && prov.anchorY !== undefined && (
                  <line
                    x1={prov.anchorX}
                    y1={prov.anchorY}
                    x2={prov.cx - 16}
                    y2={prov.cy}
                    className="stroke-[#bbb] dark:stroke-[#555]"
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                <text
                  x={prov.cx}
                  y={prov.cy}
                  textAnchor="middle"
                  className="fill-[#1a1a1a] dark:fill-white"
                  style={{ fontSize: 26, fontWeight: 800 }}
                >
                  {prov.code}
                </text>
                <text
                  x={prov.cx}
                  y={prov.cy + 24}
                  textAnchor="middle"
                  className="fill-[#3a3a3a] dark:fill-[#DDD]"
                  style={{ fontSize: 22, fontWeight: 600 }}
                >
                  {stat.share}%
                </text>
              </g>
            );
          })}
        </svg>
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
