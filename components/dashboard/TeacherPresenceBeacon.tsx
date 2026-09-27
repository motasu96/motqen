"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMyTeacherId } from "@/lib/supabase/teacherStudents";
import { useTeacherOnlinePresence } from "@/lib/supabase/presence";

// Rendered once, high up in the teacher dashboard layout, so it stays
// mounted (and the teacher stays marked "online") across navigation
// between dashboard pages instead of flickering on every page change.
export default function TeacherPresenceBeacon() {
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const tId = await getMyTeacherId(supabase, user.id);
      if (!cancelled) setTeacherId(tId);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useTeacherOnlinePresence(teacherId);

  return null;
}
