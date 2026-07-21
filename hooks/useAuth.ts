"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const supabase = createClient();
    
    // استخدم NEXT_PUBLIC_SITE_URL لو موجود، وإلا استخدم window.location.origin
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signInWithGoogle, signOut };
}