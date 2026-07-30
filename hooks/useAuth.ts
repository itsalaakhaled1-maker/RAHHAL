// hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: payment } = await supabase
          .from('user_payments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .single();
        
        setHasPaid(!!payment);
      }
      
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setHasPaid(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─────────────────────────────────────────
  // تسجيل الدخول بـ Google
  // ─────────────────────────────────────────
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });
    if (error) {
      console.error('Sign in error:', error);
    }
  };

  // ─────────────────────────────────────────
  // تسجيل الخروج
  // ─────────────────────────────────────────
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      return;
    }
    setUser(null);
    setHasPaid(false);
    router.refresh();
  };

  // ─────────────────────────────────────────
  // تحديث الاسم
  // ─────────────────────────────────────────
  const updateName = async (name: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    if (error) {
      console.error('Update name error:', error);
      return;
    }
    setUser((prev: any) => ({
      ...prev,
      user_metadata: { ...prev?.user_metadata, full_name: name },
    }));
  };

  return { user, hasPaid, loading, signInWithGoogle, signOut, updateName };
}