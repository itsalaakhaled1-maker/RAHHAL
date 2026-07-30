// components/auth/AuthModal.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-[#FDF7E9] rounded-2xl p-8 shadow-2xl border border-[#C9944D]/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#0C4938]/50 hover:text-[#0C4938] transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#0C4938] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#C9944D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0C4938] mb-2" style={{ fontFamily: 'IBM Plex Sans Arabic' }}>
            مرحباً بك في الرحّال
          </h2>
          <p className="text-[#0C4938]/70" style={{ fontFamily: 'Manrope' }}>
            سجّل دخولك للبدء في رحلتك
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#0C4938]/10 rounded-xl py-4 px-6 hover:border-[#C9944D] hover:shadow-lg transition-all duration-300 disabled:opacity-50"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-[#0C4938] font-semibold" style={{ fontFamily: 'Manrope' }}>
            {loading ? 'جاري التسجيل...' : 'سجّل دخول بـ Google'}
          </span>
        </button>

        <p className="text-center mt-6 text-sm text-[#0C4938]/50" style={{ fontFamily: 'Manrope' }}>
          بتسجيل الدخول، أنت توافق على 
          <a href="/terms" className="text-[#C9944D] hover:underline mx-1">شروط الاستخدام</a>
          و
          <a href="/privacy" className="text-[#C9944D] hover:underline">سياسة الخصوصية</a>
        </p>
      </div>
    </div>
  );
}
