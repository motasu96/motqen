"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const CACHE_KEY = "motqen_teacher_profile_cache";

function readCache(): { fullName: string | null; title: string | null } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(fullName: string | null, title: string | null) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ fullName, title }));
  } catch {}
}

// Real teacher name + professional title for the DashboardShell header,
// used across every teacher dashboard page. Falls back to the demo
// placeholder when Supabase isn't configured or the profile hasn't loaded.
// Seeds from a per-tab sessionStorage cache so navigating between
// dashboard pages doesn't flash the placeholder name before it re-loads.
export function useTeacherProfile() {
  const tc = useTranslations("Dashboard.common");
  const cached = typeof window !== "undefined" ? readCache() : null;
  const [fullName, setFullName] = useState<string | null>(cached?.fullName ?? null);
  const [title, setTitle] = useState<string | null>(cached?.title ?? null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const [{ data: profile }, { data: teacher }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).single(),
        supabase.from("teachers").select("title").eq("profile_id", user.id).maybeSingle(),
      ]);
      if (cancelled) return;
      const name = (profile?.full_name as string | null) ?? null;
      const teacherTitle = (teacher?.title as string | null) ?? null;
      setFullName(name);
      setTitle(teacherTitle);
      writeCache(name, teacherTitle);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    name: fullName || tc("teacherName"),
    title: title || tc("teacherTitle"),
  };
}
