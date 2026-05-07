'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { ArticleCard } from '@/components/news/ArticleCard';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export default function SavedPage() {
  const { savedArticles } = useApp();
  const { user } = useAuth();

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
          <svg className="w-14 h-14 text-gray-300 dark:text-gray-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <h2 className="bebas tracking-widest text-xl dark:text-white mb-2">SAVED ARTICLES</h2>
          <p className="text-gray-400 text-sm mb-6">Sign in to save articles and access them across devices.</p>
          <Link
            href="/auth/email"
            className="bebas tracking-widest text-sm bg-[#D52B1E] text-white px-6 py-2.5 rounded-lg hover:bg-[#B02010] transition-colors"
          >
            SIGN IN
          </Link>
        </div>
      </AppShell>
    );
  }

  if (savedArticles.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
          <svg className="w-14 h-14 text-gray-300 dark:text-gray-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <h2 className="bebas tracking-widest text-xl dark:text-white mb-2">NO SAVED ARTICLES</h2>
          <p className="text-gray-400 text-sm mb-6">Tap the bookmark icon on any article to save it here.</p>
          <Link
            href="/"
            className="bebas tracking-widest text-sm border border-[#D52B1E] text-[#D52B1E] px-6 py-2.5 rounded-lg hover:bg-[#D52B1E] hover:text-white transition-colors"
          >
            BROWSE NEWS
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <div className="w-1 h-4 bg-[#D52B1E] rounded" />
        <h1 className="bebas tracking-widest text-base dark:text-white">SAVED ARTICLES</h1>
        <span className="text-xs text-gray-400 ml-1">({savedArticles.length})</span>
      </div>
      <div>
        {savedArticles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </AppShell>
  );
}
