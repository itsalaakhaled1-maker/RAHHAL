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
    const redirectUrl = typeof window !== "undefined" 
      ? `${window.location.origin}/auth/callback`
      : "https://rahhal-taupe.vercel.app/auth/callback";

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

  const updateName = async (name: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name }
    });
    
    if (!error && user) {
      setUser({
        ...user,
        user_metadata: { ...user.user_metadata, full_name: name }
      });
    }
    
    return !error;
  };

  return { user, loading, signInWithGoogle, signOut, updateName };
}