'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';

const SECTION_GROUPS = [
  {
    label: 'NEWS',
    sections: [
      { name: 'Politics', color: '#1565C0', abbr: 'POL' },
      { name: 'World', color: '#00695C', abbr: 'WLD' },
      { name: 'Indigenous', color: '#4A148C', abbr: 'IND' },
    ],
  },
  {
    label: 'LIFE & SOCIETY',
    sections: [
      { name: 'Business', color: '#E65100', abbr: 'BUS' },
      { name: 'Health', color: '#1B5E20', abbr: 'HLT' },
      { name: 'Education', color: '#0277BD', abbr: 'EDU' },
      { name: 'Events', color: '#6A1B9A', abbr: 'EVT' },
    ],
  },
  {
    label: 'TECH, AUTO & AVIATION',
    sections: [
      { name: 'Technology', color: '#01579B', abbr: 'TCH' },
      { name: 'Auto News', color: '#37474F', abbr: 'AUT' },
      { name: 'Aviation', color: '#1565C0', abbr: 'AVN' },
    ],
  },
  {
    label: 'IMMIGRATION & OPPORTUNITIES',
    sections: [
      { name: 'Immigration', color: '#BF360C', abbr: 'IMM' },
      { name: 'Opportunities', color: '#2E7D32', abbr: 'OPP' },
    ],
  },
  {
    label: 'CULTURE & COMMUNITY',
    sections: [
      { name: 'Sports', color: '#D52B1E', abbr: 'SPT' },
      { name: 'Entertainment', color: '#880E4F', abbr: 'ENT' },
      { name: 'Blacks in Canada', color: '#4A148C', abbr: 'BIC' },
    ],
  },
];

export default function SectionsPage() {
  return (
    <AppShell>
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-6 pb-10">

        {/* Page header */}
        <div className="section-header mb-6">
          <div className="section-header-line" />
          <h1 className="bebas tracking-widest text-[18px] dark:text-white">EXPLORE SECTIONS</h1>
        </div>

        <div className="space-y-8">
          {SECTION_GROUPS.map(group => (
            <div key={group.label}>
              {/* Group label */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-[10px] font-bold tracking-[0.12em] text-[#999] uppercase">
                  {group.label}
                </h2>
                <div className="flex-1 h-px bg-[#E8E8E8] dark:bg-[#2A2A2A]" />
              </div>

              {/* Section cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.sections.map(section => (
                  <Link
                    key={section.name}
                    href={`/sections/${encodeURIComponent(section.name.toLowerCase())}`}
                    className="group flex items-center gap-3 p-3.5 bg-white dark:bg-[#1C1C1C] border border-[#E8E8E8] dark:border-[#2A2A2A] hover:border-[#D52B1E] transition-colors card-hover"
                  >
                    {/* Color swatch / abbr block */}
                    <div
                      className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: section.color }}
                    >
                      <span className="bebas text-white text-xs tracking-wider">{section.abbr}</span>
                    </div>

                    <div className="min-w-0">
                      <span className="block text-[13px] font-bold text-[#1a1a1a] dark:text-[#F5F5F5] group-hover:text-[#D52B1E] transition-colors leading-tight">
                        {section.name}
                      </span>
                      <span className="block text-[10px] text-[#999] mt-0.5">View stories</span>
                    </div>

                    {/* Arrow */}
                    <svg
                      className="ml-auto flex-shrink-0 text-[#E8E8E8] dark:text-[#444] group-hover:text-[#D52B1E] transition-colors"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polyline points="9,18 15,12 9,6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
