'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { sendOTP } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    setError('');
    try {
      const { devCode } = await sendOTP(email);
      if (devCode) {
        alert(`[DEV] Your OTP code: ${devCode}`);
      }
      router.push(`/auth/otp?email=${encodeURIComponent(email)}`);
    } catch {
      setError('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] flex flex-col">
      {/* Header */}
      <div className="bg-[#D52B1E] h-14 flex items-center px-4 gap-3">
        <button onClick={() => router.back()} className="text-white p-2 -ml-2 hover:bg-white/10 rounded-md transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <span className="bebas tracking-widest text-white text-lg flex-1 text-center">SIGN IN</span>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#D52B1E] flex items-center justify-center mx-auto mb-3">
            <span className="bebas text-white text-2xl">C</span>
          </div>
          <h1 className="bebas text-2xl tracking-widest dark:text-white">CANADA 247</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your email to get a verification code</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <label className="bebas text-xs tracking-widest text-gray-500 dark:text-gray-400 block mb-1.5">EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
              autoFocus
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#1C1C1C] text-[#1A1A1A] dark:text-white outline-none focus:border-[#D52B1E] focus:ring-2 focus:ring-[#D52B1E]/20 transition-all text-sm placeholder:text-gray-400"
            />
            {error && <p className="text-[#D52B1E] text-xs mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3.5 bg-[#D52B1E] text-white bebas tracking-widest text-base rounded-xl hover:bg-[#B02010] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'SENDING...' : 'SEND CODE'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6 text-center max-w-xs">
          By signing in, you agree to receive a one-time verification code via email.
        </p>
      </div>
    </div>
  );
}
