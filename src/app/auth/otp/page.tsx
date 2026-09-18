'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Suspense } from 'react';

function OTPForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const router = useRouter();
  const { verifyOTP } = useAuth();
  const { onboardingComplete } = useApp();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join('');

  const handleChange = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    setError('');
    if (clean && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      inputs.current[5]?.focus();
    }
  };

  useEffect(() => {
    if (code.length === 6) handleVerify();
  }, [code]);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    const result = await verifyOTP(email, code);
    if (result.ok) {
      router.replace(onboardingComplete ? '/' : '/onboarding/regions');
    } else {
      setError(result.error ?? 'Invalid or expired code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
    setLoading(false);
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

          <div className="text-center mb-9">
            <div className="w-16 h-16 rounded-full bg-canadaRed/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-canadaRed" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h1 className="font-serif font-black text-3xl text-[#1A1A1A] dark:text-white">Check your email</h1>
            <p className="text-gray-400 text-base mt-2">Enter the 6-digit code sent to</p>
            <p className="text-canadaRed text-base font-semibold mt-0.5">{email}</p>
          </div>

          <div className="flex justify-center gap-2.5 sm:gap-3 mb-5" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all bg-white dark:bg-[#1C1C1C] dark:text-white border-gray-200 dark:border-[#333] focus:border-canadaRed focus:ring-2 focus:ring-canadaRed/20"
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && <p className="text-canadaRed text-sm mb-5 text-center">{error}</p>}

          <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full py-4 bg-canadaRed text-white font-bold tracking-wide text-base rounded-xl hover:bg-canadaRedDark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'VERIFYING...' : 'VERIFY'}
          </button>

          <button onClick={() => router.back()} className="w-full mt-5 text-sm text-gray-400 hover:text-canadaRed transition-colors text-center">
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthOTPPage() {
  return (
    <Suspense>
      <OTPForm />
    </Suspense>
  );
}
