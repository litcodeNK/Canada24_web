'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

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
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-fade min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#151515] to-[#0D0D0D] flex items-center justify-center px-4 py-10">
      <div className="fly-in-card w-full max-w-lg">
        <div className="relative bg-white dark:bg-[#161616] rounded-3xl shadow-2xl px-10 py-14">
          <button
            onClick={() => router.back()}
            className="absolute top-5 left-5 text-gray-400 hover:text-canadaRed transition-colors p-1.5 -m-1.5"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          {/* Logo */}
          <div className="text-center mb-9">
            <Image
              src="/canada247-logo.png"
              alt="Canada 247"
              width={686}
              height={583}
              className="h-20 w-auto object-contain drop-shadow-md mx-auto mb-5"
            />
            <h1 className="font-serif font-black text-3xl text-[#1A1A1A] dark:text-white">Sign in</h1>
            <p className="text-gray-400 text-base mt-2">Enter your email to get a verification code</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 block mb-2">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                autoFocus
                autoComplete="email"
                className="w-full px-5 py-4 border border-gray-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#1C1C1C] text-[#1A1A1A] dark:text-white outline-none focus:border-[#D52B1E] focus:ring-2 focus:ring-[#D52B1E]/20 transition-all text-base placeholder:text-gray-400"
              />
              {error && <p className="text-[#D52B1E] text-sm mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-4 bg-[#D52B1E] text-white font-bold tracking-wide text-base rounded-xl hover:bg-[#B02010] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? 'SENDING...' : 'SEND CODE'}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-8 text-center">
            By signing in, you agree to receive a one-time verification code via email.
          </p>
        </div>
      </div>
    </div>
  );
}
