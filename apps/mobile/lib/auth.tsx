import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Role = "student" | "teacher" | "admin";

// `loading` stays true until both the session AND (when signed in) the
// account's role are known, so route guards never flash the wrong
// interface or bounce a teacher through the student screens.
type AuthState = { session: Session | null; role: Role | null; loading: boolean };

const AuthContext = createContext<AuthState>({ session: null, role: null, loading: true });

function asRole(value: unknown): Role | null {
  return value === "student" || value === "teacher" || value === "admin" ? value : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setRole(null);
      setRoleLoading(false);
      return;
    }
    let cancelled = false;
    setRoleLoading(true);
    (async () => {
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (cancelled) return;
      setRole(asRole(data?.role));
      setRoleLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <AuthContext.Provider value={{ session, role, loading: sessionLoading || roleLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function homeRouteFor(role: Role | null) {
  if (role === "teacher") return "/(teacher)" as const;
  if (role === "admin") return "/(admin)" as const;
  return "/(tabs)" as const;
}
