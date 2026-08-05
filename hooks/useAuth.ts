// hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const checkPaymentStatus = useCallback(async (userId: string) => {
    const { data: payment, error } = await supabase
      .from('user_payments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .maybeSingle();
    
    if (error) {
      console.error('Payment check error:', error);
      setHasPaid(false);
      return false;
    }
    
    setHasPaid(!!payment);
    return !!payment;
  }, [supabase]);

  // ✅ دالة لإعادة التحقق من الدفع (تُستخدم بعد العودة من Mamopay)
  const refreshPaymentStatus = useCallback(async () => {
    if (!user?.id) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        return await checkPaymentStatus(currentUser.id);
      }
      return false;
    }
    return await checkPaymentStatus(user.id);
  }, [user, supabase, checkPaymentStatus]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await checkPaymentStatus(user.id);
      }
      
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setHasPaid(false);
    });

    return () => subscription.unsubscribe();
  }, [checkPaymentStatus]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });
    if (error) console.error('Sign in error:', error);
  };

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

  return { user, hasPaid, loading, signInWithGoogle, signOut, updateName, checkPaymentStatus, refreshPaymentStatus };
}