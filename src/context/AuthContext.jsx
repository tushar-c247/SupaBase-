"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/utils/supabase/client";

const AuthContext = createContext({
  user: null,
  loading: true,
  isDemo: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  startDemo: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const savedDemo = localStorage.getItem("supabase_demo_user");
      if (savedDemo) {
        try {
          return JSON.parse(savedDemo);
        } catch {
          localStorage.removeItem("supabase_demo_user");
        }
      }
    }
    return null;
  });

  const [isDemo, setIsDemo] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("supabase_demo_user");
    }
    return false;
  });

  const [loading, setLoading] = useState(() => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("supabase_demo_user")
    ) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (isDemo) return;

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const signIn = useCallback(async (email, password) => {
    const supabase = createClient();
    if (!supabase) {
      throw new Error(
        "Supabase credentials not configured in .env.local. Use Demo Mode or configure credentials.",
      );
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setIsDemo(false);
    localStorage.removeItem("supabase_demo_user");
    return data;
  }, []);

  const signUp = useCallback(async (email, password) => {
    const supabase = createClient();
    if (!supabase) {
      throw new Error(
        "Supabase credentials not configured in .env.local. Use Demo Mode or configure credentials.",
      );
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    setIsDemo(false);
    localStorage.removeItem("supabase_demo_user");
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("supabase_demo_user");
    setUser(null);
    setIsDemo(false);
  }, []);

  const startDemo = useCallback(() => {
    const demoUser = {
      id: "demo-user-uuid-1234",
      email: "demo.developer@example.com",
      user_metadata: { name: "Demo User" },
    };
    setUser(demoUser);
    setIsDemo(true);
    localStorage.setItem("supabase_demo_user", JSON.stringify(demoUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemo,
        signIn,
        signUp,
        signOut,
        startDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
