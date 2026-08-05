// hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchCredits = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Credits fetch error:', error);
      setCredits(0);
      return 0;
    }
    
    const userCredits = data?.credits || 0;
    setCredits(userCredits);
    return userCredits;
  }, [supabase]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await fetchCredits(user.id);
      }
      
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setCredits(0);
    });

    return () => subscription.unsubscribe();
  }, [fetchCredits]);

  const deductCredits = useCallback(async (amount: number = 10) => {
    if (!user?.id) return false;
    
    const { data: current } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .maybeSingle();
    
    const currentCredits = current?.credits || 0;
    
    if (currentCredits < amount) {
      return false;
    }
    
    const { error } = await supabase
      .from('user_credits')
      .upsert({
        user_id: user.id,
        credits: currentCredits - amount,
        updated_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Deduct credits error:', error);
      return false;
    }
    
    setCredits(currentCredits - amount);
    return true;
  }, [user, supabase]);

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
    setCredits(0);
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

  return { user, credits, loading, signInWithGoogle, signOut, updateName, deductCredits };
}