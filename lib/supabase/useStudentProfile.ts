"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { getMyStudentProfile } from "@/lib/supabase/students";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";

const CACHE_KEY = "motqen_student_profile_cache";

function readCache(): { fullName: string | null; programSlug: string | null } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(fullName: string | null, programSlug: string | null) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ fullName, programSlug }));
  } catch {}
}

// Real student name + program title for the DashboardShell header, used
// across every student dashboard page. Falls back to the demo placeholder
// when Supabase isn't configured or the profile hasn't loaded yet. Seeds
// from a per-tab sessionStorage cache so navigating between dashboard
// pages doesn't flash the placeholder name before the real one re-loads.
export function useStudentProfile() {
  const locale = useLocale();
  const tc = useTranslations("Dashboard.common");
  const cached = typeof window !== "undefined" ? readCache() : null;
  const [fullName, setFullName] = useState<string | null>(cached?.fullName ?? null);
  const [programSlug, setProgramSlug] = useState<string | null>(cached?.programSlug ?? null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { fullName: name, student } = await getMyStudentProfile(supabase, user.id);
      if (cancelled) return;
      const slug = student?.program_slug ?? null;
      setFullName(name);
      setProgramSlug(slug);
      writeCache(name, slug);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const program = programSlug ? programs.find((p) => p.slug === programSlug) : undefined;

  return {
    name: fullName || tc("studentName"),
    title: program ? localize(program, locale).title : tc("studentTitle"),
  };
}
