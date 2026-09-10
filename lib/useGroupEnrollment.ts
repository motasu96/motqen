"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "motqen_group_enrollments";

export function useGroupEnrollment() {
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setEnrolledIds(raw ? JSON.parse(raw) : []);
    } catch {
      setEnrolledIds([]);
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setEnrolledIds(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const join = useCallback(
    (id: string) => {
      if (enrolledIds.includes(id)) return;
      persist([...enrolledIds, id]);
    },
    [enrolledIds, persist]
  );

  const leave = useCallback(
    (id: string) => {
      persist(enrolledIds.filter((x) => x !== id));
    },
    [enrolledIds, persist]
  );

  const isEnrolled = useCallback((id: string) => enrolledIds.includes(id), [enrolledIds]);

  return { enrolledIds, ready, join, leave, isEnrolled };
}
