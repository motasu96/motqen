"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

// Real teacher name + professional title for the DashboardShell header,
// used across every teacher dashboard page. Falls back to the demo
// placeholder when Supabase isn't configured or the profile hasn't loaded.
export function useTeacherProfile() {
  const tc = useTranslations("Dashboard.common");
  const [fullName, setFullName] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

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
      setFullName((profile?.full_name as string | null) ?? null);
      setTitle((teacher?.title as string | null) ?? null);
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
