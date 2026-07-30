// hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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

  return { user, hasPaid, loading };
}
