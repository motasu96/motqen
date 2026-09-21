"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { getMyStudentProfile } from "@/lib/supabase/students";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";

// Real student name + program title for the DashboardShell header, used
// across every student dashboard page. Falls back to the demo placeholder
// when Supabase isn't configured or the profile hasn't loaded yet.
export function useStudentProfile() {
  const locale = useLocale();
  const tc = useTranslations("Dashboard.common");
  const [fullName, setFullName] = useState<string | null>(null);
  const [programSlug, setProgramSlug] = useState<string | null>(null);

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
      setFullName(name);
      setProgramSlug(student?.program_slug ?? null);
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
