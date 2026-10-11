'use client';

import { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { fetchImmigrationStats, type ImmigrationStats } from '@/services/newsService';
import { CANADA_PROVINCES, CANADA_VIEWBOX, type ProvinceShape } from '@/lib/canadaMap';

/**
 * Choropleth of permanent-resident admissions by destination province.
 *
 * Shading is a 5-step sequential scale on fixed breakpoints (not min/max
 * relative), so the legend means the same thing year to year. Colours live in
 * CSS custom properties on the root so light and dark themes each get a ramp
 * tuned for their background — in dark mode higher = brighter, in light mode
 * higher = deeper.
 */

type Bin = { min: number; label: string };

const BINS: Bin[] = [
  { min: 0, label: 'Under 1%' },
  { min: 1, label: '1–5%' },
  { min: 5, label: '5–10%' },
  { min: 10, label: '10–20%' },
  { min: 20, label: '20%+' },
];

function binFor(share: number | undefined): number | null {
  if (share === undefined) return null;
  let idx = 0;
  BINS.forEach((b, i) => {
    if (share >= b.min) idx = i;
  });
  return idx;
}

// Per-bin fill + label colour, per theme. Declared as Tailwind arbitrary
// properties so `dark:` flips them without any JS theme detection.
const THEME_VARS = [
  '[--f0:#F7E4E1] [--t0:#5C1B15]',
  '[--f1:#F0B8AE] [--t1:#5C1B15]',
  '[--f2:#E2786A] [--t2:#FFFFFF]',
  '[--f3:#D52B1E] [--t3:#FFFFFF]',
  '[--f4:#8C1A11] [--t4:#FFFFFF]',
  '[--fn:#E9ECEF] [--tn:#6B7280] [--stroke:#FFFFFF] [--halo:#1a1a1a]',
  'dark:[--f0:#2E2528] dark:[--t0:#E4D6D6]',
  'dark:[--f1:#5C2A29] dark:[--t1:#FFFFFF]',
  'dark:[--f2:#963229] dark:[--t2:#FFFFFF]',
  'dark:[--f3:#D52B1E] dark:[--t3:#FFFFFF]',
  'dark:[--f4:#FF6B58] dark:[--t4:#2A0B07]',
  'dark:[--fn:#1F2630] dark:[--tn:#8A93A0] dark:[--stroke:#0B0F14] dark:[--halo:#F5F5F5]',
].join(' ');

/** NB sits too close to NS/PE/NL for in-shape text, so it gets a callout in
 *  open space south of the Maritimes, like PE and NS already do. */
const CALLOUT_OVERRIDES: Record<string, { x: number; y: number; ax: number; ay: number }> = {
  NB: { x: 782, y: 806, ax: 826, ay: 716 },
};

const compact = new Intl.NumberFormat('en-CA', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('en-CA');

function fmtShare(n: number): string {
  // Tiny-but-real values (e.g. Nunavut) shouldn't read as zero.
  if (n > 0 && n < 0.1) return '<0.1';
  return n.toFixed(1);
}

export function ImmigrationByProvince() {
  const [stats, setStats] = useState<ImmigrationStats | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchImmigrationStats().then(result => {
      if (!cancelled) setStats(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const model = useMemo(() => {
    if (!stats) return null;
    const national = stats.national_total ?? stats.provinces.reduce((sum, p) => sum + p.total, 0);
    // The API rounds shares to 1dp, so a real-but-tiny province reads 0.0.
    const provinces = stats.provinces.map(p =>
      p.share === 0 && p.total > 0 && national > 0 ? { ...p, share: (p.total / national) * 100 } : p,
    );
    const byName = new Map(provinces.map(p => [p.province, p]));
    const ranked = [...provinces].sort((a, b) => b.total - a.total);
    const rankOf = new Map(ranked.map((p, i) => [p.province, i + 1]));
    const max = ranked[0]?.total ?? 0;
    const nationalTotal = national;
    return { byName, ranked, rankOf, max, nationalTotal };
  }, [stats]);

  // Nothing ingested yet, or the fetch failed -> hide instead of showing blanks.
  if (!stats || !model || stats.provinces.length === 0) return null;

  const { byName, ranked, rankOf, max, nationalTotal } = model;
  const nameToCode = new Map(CANADA_PROVINCES.map(p => [p.name, p.code]));
  const active = hovered ?? pinned;
  const activeShape = active ? CANADA_PROVINCES.find(p => p.code === active) : undefined;
  const activeStat = activeShape ? byName.get(activeShape.name) : undefined;

  // Draw the active province last so its outline isn't clipped by neighbours.
  const drawOrder = [...CANADA_PROVINCES].sort((a, b) => Number(a.code === active) - Number(b.code === active));

  const hit = (prov: ProvinceShape) => ({
    onMouseEnter: () => setHovered(prov.code),
    onMouseLeave: () => setHovered(null),
    onFocus: () => setHovered(prov.code),
    onBlur: () => setHovered(null),
    onClick: () => setPinned(p => (p === prov.code ? null : prov.code)),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setPinned(p => (p === prov.code ? null : prov.code));
      }
    },
  });

  return (
    <section
      className={clsx(
        'rounded-xl border border-[#E8E8E8] dark:border-[#2A2A2A] overflow-hidden bg-white dark:bg-[#0F1318]',
        THEME_VARS,
      )}
      aria-label="Immigration by province"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold text-[15px] text-[#1a1a1a] dark:text-[#F5F5F5] tracking-tight">
            Immigration by Province
          </h2>
          <p className="text-[11.5px] text-[#777] dark:text-[#9AA3AF] mt-0.5">
            Permanent resident admissions by destination
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="inline-block text-[11px] font-bold tracking-wider text-canadaRed border border-canadaRed/40 rounded px-1.5 py-0.5">
            {stats.year}
          </span>
        </div>
      </div>

      {/* Detail strip — fixed height so hovering never makes the page jump */}
      <div
        className="mx-4 mb-2 rounded-lg border border-[#ECECEC] dark:border-[#232A33] bg-[#F7F8FA] dark:bg-[#151A21] px-3.5 min-h-[64px] flex items-center"
        aria-live="polite"
      >
        {activeShape && activeStat ? (
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase">
                #{rankOf.get(activeShape.name)} of {ranked.length}
              </p>
              <p className="text-[15px] font-bold text-[#1a1a1a] dark:text-white truncate">{activeShape.name}</p>
            </div>
            <div className="text-right flex-shrink-0 tabular-nums">
              <p className="text-[18px] font-extrabold leading-none text-canadaRed">{fmtShare(activeStat.share)}%</p>
              <p className="text-[11px] text-[#777] dark:text-[#9AA3AF] mt-1">
                {full.format(activeStat.total)} admissions
              </p>
            </div>
          </div>
        ) : activeShape ? (
          <div className="flex items-center justify-between gap-4 w-full">
            <p className="text-[15px] font-bold text-[#1a1a1a] dark:text-white">{activeShape.name}</p>
            <p className="text-[12px] text-[#777] dark:text-[#9AA3AF]">No data reported</p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 w-full">
            <div>
              <p className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase">Canada total</p>
              <p className="text-[18px] font-extrabold leading-tight text-[#1a1a1a] dark:text-white tabular-nums">
                {full.format(nationalTotal)}
              </p>
            </div>
            <p className="text-[11.5px] text-[#777] dark:text-[#9AA3AF] text-right max-w-[220px] leading-snug">
              Hover or tap a province for its share of admissions.
            </p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="px-3">
        <svg
          viewBox={CANADA_VIEWBOX}
          className="w-full h-auto select-none"
          role="group"
          aria-label={`Map of Canada shaded by share of permanent resident admissions in ${stats.year}`}
        >
          {drawOrder.map(prov => {
            const stat = byName.get(prov.name);
            const bin = binFor(stat?.share);
            const isActive = prov.code === active;
            const dimmed = active !== null && !isActive;
            return (
              <path
                key={prov.code}
                d={prov.d}
                tabIndex={0}
                role="button"
                aria-label={
                  stat
                    ? `${prov.name}: ${fmtShare(stat.share)}% of admissions, ${full.format(stat.total)} people`
                    : `${prov.name}: no data`
                }
                aria-pressed={pinned === prov.code}
                style={{
                  fill: bin === null ? 'var(--fn)' : `var(--f${bin})`,
                  stroke: isActive ? 'var(--halo)' : 'var(--stroke)',
                  strokeWidth: isActive ? 2.4 : 1.2,
                  opacity: dimmed ? 0.55 : 1,
                  transition: 'opacity 150ms, stroke-width 150ms',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                {...hit(prov)}
              />
            );
          })}

          {/* Labels are drawn after all shapes so no neighbour paints over them */}
          {CANADA_PROVINCES.map(prov => {
            const stat = byName.get(prov.name);
            if (!stat) return null;
            const bin = binFor(stat.share) ?? 0;
            const callout =
              CALLOUT_OVERRIDES[prov.code] ??
              (prov.outside && prov.anchorX !== undefined && prov.anchorY !== undefined
                ? { x: prov.cx, y: prov.cy, ax: prov.anchorX, ay: prov.anchorY }
                : null);

            if (callout) {
              return (
                <g key={`${prov.code}-label`} pointerEvents="none">
                  <line
                    x1={callout.ax}
                    y1={callout.ay}
                    x2={callout.x - 46}
                    y2={callout.y - 7}
                    className="stroke-[#9AA3AF]"
                    strokeWidth={1.2}
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle cx={callout.ax} cy={callout.ay} r={3.5} className="fill-[#9AA3AF]" />
                  <text
                    x={callout.x - 40}
                    y={callout.y}
                    textAnchor="start"
                    className="fill-[#1a1a1a] dark:fill-white"
                    style={{ fontSize: 21, fontWeight: 800 }}
                  >
                    {prov.code}{' '}
                    <tspan style={{ fontWeight: 600 }} className="fill-[#555] dark:fill-[#C5CBD3]">
                      {fmtShare(stat.share)}%
                    </tspan>
                  </text>
                </g>
              );
            }

            const small = stat.share < 1;
            return (
              <g key={`${prov.code}-label`} pointerEvents="none" style={{ fill: `var(--t${bin})` }}>
                <text
                  x={prov.cx}
                  y={prov.cy}
                  textAnchor="middle"
                  style={{ fontSize: small ? 22 : 26, fontWeight: 800, fill: 'inherit' }}
                >
                  {prov.code}
                </text>
                <text
                  x={prov.cx}
                  y={prov.cy + (small ? 21 : 25)}
                  textAnchor="middle"
                  style={{ fontSize: small ? 19 : 22, fontWeight: 600, fill: 'inherit', opacity: 0.92 }}
                >
                  {fmtShare(stat.share)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="px-4 pt-1 pb-4">
        <p className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase mb-2">
          Share of national admissions
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {BINS.map((b, i) => (
            <li key={b.label} className="flex items-center gap-1.5 text-[11px] text-[#555] dark:text-[#B8C0CA]">
              <span
                className="inline-block w-4 h-3 rounded-sm border border-black/10 dark:border-white/10"
                style={{ background: `var(--f${i})` }}
                aria-hidden="true"
              />
              {b.label}
            </li>
          ))}
          <li className="flex items-center gap-1.5 text-[11px] text-[#555] dark:text-[#B8C0CA]">
            <span
              className="inline-block w-4 h-3 rounded-sm border border-black/10 dark:border-white/10"
              style={{ background: 'var(--fn)' }}
              aria-hidden="true"
            />
            No data
          </li>
        </ul>
      </div>

      {/* Ranking */}
      <div className="px-4 py-4 border-t border-[#E8E8E8] dark:border-[#232A33]">
        <p className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase mb-3">Ranked by admissions</p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
          {ranked.map((p, i) => {
            const code = nameToCode.get(p.province);
            const isActive = code !== undefined && code === active;
            const bin = binFor(p.share) ?? 0;
            return (
              <li key={p.province}>
                <button
                  type="button"
                  onMouseEnter={() => code && setHovered(code)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => code && setHovered(code)}
                  onBlur={() => setHovered(null)}
                  onClick={() => code && setPinned(c => (c === code ? null : code))}
                  className={clsx(
                    'w-full flex items-center gap-2.5 rounded-md px-1.5 py-1 text-left transition-colors',
                    isActive ? 'bg-[#F1F3F6] dark:bg-[#1A2029]' : 'hover:bg-[#F7F8FA] dark:hover:bg-[#151A21]',
                  )}
                >
                  <span className="w-4 text-[10.5px] text-[#999] tabular-nums text-right">{i + 1}</span>
                  <span className="w-[104px] sm:w-[132px] flex-shrink-0 text-[12.5px] font-semibold text-[#1a1a1a] dark:text-[#F0F2F5] truncate">
                    {p.province}
                  </span>
                  <span className="flex-1 min-w-[48px] h-2 rounded-full bg-[#EEF0F3] dark:bg-[#1E242C] overflow-hidden">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(2, (p.total / max) * 100)}%`,
                        background: `var(--f${Math.max(bin, 2)})`,
                      }}
                    />
                  </span>
                  <span className="w-[44px] text-right text-[12px] font-bold text-[#1a1a1a] dark:text-white tabular-nums">
                    {fmtShare(p.share)}%
                  </span>
                  <span className="hidden lg:block w-[44px] text-right text-[11px] text-[#888] tabular-nums">
                    {compact.format(p.total)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {stats.top_source_countries.length > 0 && (
        <div className="px-4 py-3 border-t border-[#E8E8E8] dark:border-[#232A33] bg-[#F7F8FA] dark:bg-[#12161C]">
          <p className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase mb-2">Top source countries</p>
          <ul className="flex flex-wrap gap-2">
            {stats.top_source_countries.map((c, i) => (
              <li
                key={c.country}
                className="text-[11.5px] font-semibold text-[#333] dark:text-[#DDE2E8] bg-white dark:bg-[#1A2029] border border-[#E4E7EB] dark:border-[#2A323C] px-2.5 py-1"
              >
                <span className="text-canadaRed mr-1">{i + 1}</span>
                {c.country.split(',')[0]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats.source && (
        <div className="px-4 py-3 bg-[#F7F8FA] dark:bg-[#12161C]">
          <p className="text-[10px] text-[#999] leading-snug">
            {stats.source}. {stats.note}
          </p>
        </div>
      )}
    </section>
  );
}
