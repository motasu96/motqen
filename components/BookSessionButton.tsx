"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BookSessionButton({ teacherSlug, label }: { teacherSlug: string; label: string }) {
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!cancelled && profile?.role === "student") setIsStudent(true);
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isStudent) {
    return (
      <a href="#book" className="btn-primary w-full">
        {label}
      </a>
    );
  }

  return (
    <Link href={`/signup?teacher=${teacherSlug}`} className="btn-primary w-full">
      {label}
    </Link>
  );
}
