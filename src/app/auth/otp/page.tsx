'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';

function OTPForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const router = useRouter();
  const { verifyOTP } = useAuth();

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
      router.replace('/');
    } else {
      setError(result.error ?? 'Invalid or expired code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] flex flex-col">
      <div className="bg-[#D52B1E] h-14 flex items-center px-4 gap-3">
        <button onClick={() => router.back()} className="text-white p-2 -ml-2 hover:bg-white/10 rounded-md transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <span className="bebas tracking-widest text-white text-lg flex-1 text-center">VERIFY CODE</span>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#D52B1E]/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-[#D52B1E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <h2 className="bebas text-xl tracking-widest dark:text-white">CHECK YOUR EMAIL</h2>
          <p className="text-gray-400 text-sm mt-1">Enter the 6-digit code sent to</p>
          <p className="text-[#D52B1E] text-sm font-semibold mt-0.5">{email}</p>
        </div>

        <div className="flex gap-2 mb-4" onPaste={handlePaste}>
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
              className="w-11 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all bg-white dark:bg-[#1C1C1C] dark:text-white border-gray-200 dark:border-[#333] focus:border-[#D52B1E] focus:ring-2 focus:ring-[#D52B1E]/20"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && <p className="text-[#D52B1E] text-sm mb-4 text-center">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          className="w-full max-w-xs py-3.5 bg-[#D52B1E] text-white bebas tracking-widest text-base rounded-xl hover:bg-[#B02010] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {loading ? 'VERIFYING...' : 'VERIFY'}
        </button>

        <button onClick={() => router.back()} className="mt-4 text-sm text-gray-400 hover:text-[#D52B1E] transition-colors">
          Use a different email
        </button>
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
