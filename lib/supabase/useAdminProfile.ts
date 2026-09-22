"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const CACHE_KEY = "motqen_admin_profile_cache";

function readCache(): { fullName: string | null } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(fullName: string | null) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ fullName }));
  } catch {}
}

// Real admin name for the DashboardShell header, used across every admin
// dashboard page, with an editable name (stored on profiles.full_name).
// Falls back to the demo placeholder when Supabase isn't configured or the
// profile hasn't loaded yet, and seeds from a per-tab sessionStorage cache
// so navigating between admin pages doesn't flash the placeholder name.
export function useAdminProfile() {
  const tc = useTranslations("Dashboard.common");
  const cached = typeof window !== "undefined" ? readCache() : null;
  const [fullName, setFullName] = useState<string | null>(cached?.fullName ?? null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (cancelled) return;
      const name = (profile?.full_name as string | null) ?? null;
      setFullName(name);
      writeCache(name);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateName(newName: string): Promise<boolean> {
    const trimmed = newName.trim();
    if (!trimmed) return false;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase.from("profiles").update({ full_name: trimmed }).eq("id", user.id);
    if (error) return false;
    setFullName(trimmed);
    writeCache(trimmed);
    return true;
  }

  return {
    name: fullName || tc("adminName"),
    title: tc("adminTitle"),
    updateName,
  };
}
