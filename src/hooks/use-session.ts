"use client";

import React, { useState, useEffect, useMemo, useCallback, createContext, useContext, ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Session {
  user: {
    id: string;
    email: string;
  } | null;
}

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

const defaultContextValue: SessionContextType = {
  session: null,
  isLoading: true,
  refreshSession: async () => {},
};

const SessionContext = createContext<SessionContextType>(defaultContextValue);

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && (url.startsWith("http://") || url.startsWith("https://")));
}

// Inner provider using React.createElement (file is .ts, no JSX allowed).
const SessionProviderInner = ({ value, children }: { value: SessionContextType; children: ReactNode }) =>
  React.createElement(SessionContext.Provider, { value }, children);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => {
    if (!isSupabaseConfigured()) return null;
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const fetchSession = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await supabase.auth.getSession();
      const s = data.session;
      setSession(s ? { user: { id: s.user.id, email: s.user.email ?? "" } } : null);
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSession();
    if (!supabase) return;
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? { user: { id: s.user.id, email: s.user.email ?? "" } } : null);
      setIsLoading(false);
    });
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [supabase, fetchSession]);

  const value = { session, isLoading, refreshSession: fetchSession };

  return React.createElement(SessionProviderInner, { value, children } as never);
}

export function useSession() {
  return useContext(SessionContext);
}
