import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth";
import { supabase } from "./supabase";
import { getMyTeacherId } from "./staff/teacherStudents";

type TeacherState = { teacherId: string | null; name: string; ready: boolean };

const TeacherContext = createContext<TeacherState>({ teacherId: null, name: "", ready: false });

// Resolves the signed-in teacher's row id (teachers.id, not the auth id) and
// display name once for the whole teacher interface.
export function TeacherProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [state, setState] = useState<TeacherState>({ teacherId: null, name: "", ready: false });

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const [teacherId, { data: profile }] = await Promise.all([
        getMyTeacherId(supabase, userId),
        supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
      ]);
      if (cancelled) return;
      setState({ teacherId, name: (profile?.full_name as string | null) || "معلم متقن", ready: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return <TeacherContext.Provider value={state}>{children}</TeacherContext.Provider>;
}

export function useTeacher() {
  return useContext(TeacherContext);
}
