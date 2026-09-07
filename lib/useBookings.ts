"use client";

import { useCallback, useEffect, useState } from "react";

export type Booking = {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
  time: string; // e.g. "5:30 م"
  teacher: string;
  status: "upcoming" | "completed" | "cancelled";
};

const STORAGE_KEY = "motqen_sessions";

function defaultBookings(): Booking[] {
  const today = new Date();
  const next = new Date(today);
  next.setDate(today.getDate() + 2);
  return [
    {
      id: "seed-1",
      date: next.toISOString().slice(0, 10),
      time: "5:30 م",
      teacher: "أ. عبدالله السلمي",
      status: "upcoming",
    },
  ];
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setBookings(JSON.parse(raw));
      } else {
        const seeded = defaultBookings();
        setBookings(seeded);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      }
    } catch {
      setBookings(defaultBookings());
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: Booking[]) => {
    setBookings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const addBooking = useCallback(
    (date: string, time: string, teacher: string) => {
      const booking: Booking = {
        id: `${date}-${time}-${Date.now()}`,
        date,
        time,
        teacher,
        status: "upcoming",
      };
      persist([...bookings, booking]);
      return booking;
    },
    [bookings, persist]
  );

  const cancelBooking = useCallback(
    (id: string) => {
      persist(bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b)));
    },
    [bookings, persist]
  );

  const isSlotTaken = useCallback(
    (date: string, time: string) => bookings.some((b) => b.date === date && b.time === time && b.status === "upcoming"),
    [bookings]
  );

  const upcoming = bookings
    .filter((b) => b.status === "upcoming")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return { bookings, ready, addBooking, cancelBooking, isSlotTaken, upcoming };
}
