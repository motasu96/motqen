"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cancelBooking as cancelBookingRow, listUpcomingBookings, UpcomingBooking } from "@/lib/supabase/bookings";

export function useUpcomingBookings() {
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setReady(true);
      return;
    }
    const mine = await listUpcomingBookings(supabase, user.id);
    setUpcoming(mine);
    setReady(true);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const cancel = useCallback(async (id: string) => {
    const ok = await cancelBookingRow(createClient(), id);
    if (ok) setUpcoming((prev) => prev.filter((b) => b.id !== id));
    return ok;
  }, []);

  return { upcoming, ready, cancel, reload };
}
