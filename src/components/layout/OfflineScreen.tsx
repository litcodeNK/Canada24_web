'use client';

import { WifiOff, X } from 'lucide-react';
import { MapleLeaf } from '@/components/news/MapleLeaf';

export function OfflineScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-[#0D0D0D] px-6 text-center">
      <MapleLeaf className="pointer-events-none absolute -top-10 -right-16 w-64 h-64 opacity-[0.06]" />
      <MapleLeaf className="pointer-events-none absolute -bottom-16 -left-20 w-72 h-72 opacity-[0.06] rotate-12" />

      <div className="relative flex flex-col items-center max-w-sm">
        <div className="relative mb-8">
          <WifiOff className="w-24 h-24 text-[#8FB8E8]" strokeWidth={1.75} />
          <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-canadaRed">
            <X className="w-5 h-5 text-white" strokeWidth={3} />
          </span>
        </div>

        <h1 className="font-sans font-black text-3xl leading-tight tracking-tight">
          <span className="block text-[#1a1a1a] dark:text-white">NO NETWORK</span>
          <span className="block text-canadaRed">CONNECTION</span>
        </h1>

        <p className="mt-5 text-[15px] leading-relaxed text-[#666] dark:text-[#999]">
          You&rsquo;re currently offline.
          <br />
          Please check your internet connection and try again.
        </p>
      </div>
    </div>
  );
}
