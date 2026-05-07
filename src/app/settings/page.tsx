'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

export default function SettingsPage() {
  const router = useRouter();
  const {
    darkMode, compactLayout, allowStorySwiping, useDefaultTextSize, textScale,
    allowBackgroundAudio, toggleDarkMode, toggleCompactLayout, toggleStorySwiping,
    toggleDefaultTextSize, setTextScale, toggleBackgroundAudio,
  } = useApp();
  const { user, signOut } = useAuth();

  const fontSize = Math.round(13 + textScale * 12);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D]">
      {/* Header */}
      <div className="bg-[#D52B1E] h-14 flex items-center px-4 gap-3 sticky top-0 z-50">
        <button onClick={() => router.back()} className="text-white p-2 -ml-2 hover:bg-white/10 rounded-md transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <span className="bebas tracking-widest text-white text-lg flex-1 text-center">SETTINGS</span>
        <div className="w-9" />
      </div>

      <div className="max-w-2xl mx-auto pb-8">
        {/* CUSTOMIZE THEME */}
        <Section title="CUSTOMIZE THEME">
          <ToggleRow label="Dark Mode" value={darkMode} onToggle={toggleDarkMode} />
          <ToggleRow label="Compact Layout" value={compactLayout} onToggle={toggleCompactLayout} />
          <ToggleRow label="Allow Story Swiping" value={allowStorySwiping} onToggle={toggleStorySwiping} />
          <ToggleRow label="Default Text Size" value={useDefaultTextSize} onToggle={toggleDefaultTextSize} />
          {!useDefaultTextSize && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-[#2A2A2A]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#1A1A1A] dark:text-[#F5F5F5]">Text Size</span>
                <span className="text-sm text-[#D52B1E] font-bold">{fontSize}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={textScale}
                onChange={e => setTextScale(Number(e.target.value))}
                className="w-full accent-[#D52B1E]"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-gray-400">Small</span>
                <span className="text-[11px] text-gray-400">Large</span>
              </div>
              <p className="mt-3 text-gray-500 dark:text-gray-400 leading-relaxed" style={{ fontSize }}>
                Preview text at {fontSize}px size.
              </p>
            </div>
          )}
        </Section>

        {/* MEDIA PLAYER */}
        <Section title="MEDIA PLAYER">
          <ToggleRow label="Allow Background Audio" value={allowBackgroundAudio} onToggle={toggleBackgroundAudio} />
        </Section>

        {/* ACCOUNT */}
        <Section title="ACCOUNT">
          {user ? (
            <>
              <div className="px-4 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D52B1E] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.displayName?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F5] truncate">{user.displayName || 'User'}</p>
                  <p className="text-sm text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-[#2A2A2A]">
                <button
                  onClick={async () => { await signOut(); router.push('/'); }}
                  className="w-full text-left px-4 py-3.5 text-[#D52B1E] bebas tracking-wider text-sm hover:bg-gray-100 dark:hover:bg-[#1C1C1C] transition-colors"
                >
                  SIGN OUT
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Sign in to sync your preferences and saved articles.</p>
              <a
                href="/auth/email"
                className="inline-block bebas tracking-widest text-sm bg-[#D52B1E] text-white px-5 py-2.5 rounded-lg hover:bg-[#B02010] transition-colors"
              >
                SIGN IN
              </a>
            </div>
          )}
        </Section>

        {/* GENERAL */}
        <Section title="GENERAL">
          <div className="px-4 py-3.5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Canada 247 – Canada In Real Time</span>
          </div>
          <div className="border-t border-gray-100 dark:border-[#2A2A2A] px-4 py-3.5">
            <span className="text-sm text-gray-400">Version 1.0.0</span>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 mx-4">
      <p className="bebas tracking-widest text-xs text-gray-400 dark:text-gray-500 mb-2 px-1">{title}</p>
      <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#2A2A2A]">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-[#2A2A2A] last:border-b-0">
      <span className="text-sm text-[#1A1A1A] dark:text-[#F5F5F5]">{label}</span>
      <button
        onClick={onToggle}
        className={clsx(
          'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
          value ? 'bg-[#D52B1E]' : 'bg-gray-200 dark:bg-[#333]',
        )}
      >
        <span className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', value ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}
