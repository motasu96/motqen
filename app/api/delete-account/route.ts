import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRequestUserId } from "@/lib/supabase/requestUser";

// A student deleting their own account (required by the app stores for any
// app that lets people create one). Everything the student owns — profile,
// student record, bookings, lessons, homework, certificates, enrollments —
// is removed by the `on delete cascade` foreign keys when the auth user goes.
//
// Teacher and admin accounts are not deletable here: they hold records other
// people depend on (lessons, certificates, groups), so the administration
// handles those by hand.
export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 501 });
  }

  const userId = await getRequestUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (profileError) {
    return NextResponse.json({ error: "Could not verify the account" }, { status: 502 });
  }
  if (profile && profile.role !== "student") {
    return NextResponse.json({ error: "Only student accounts can be deleted here" }, { status: 403 });
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: "Could not delete the account" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
