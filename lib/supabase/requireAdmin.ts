import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerSupabaseClient } from "./server";

// Gate for API routes that run with the Supabase service-role key (which
// bypasses Row Level Security): call it first, before reading the body or
// creating the admin client, and return its response when it is non-null.
//
//   const denied = await requireAdmin(req);
//   if (denied) return denied;
//
// The caller proves who they are one of two ways:
//  - the website's Supabase session cookie (the admin dashboard), or
//  - an `Authorization: Bearer <access token>` header (the mobile app).
// Either way the token is validated by Supabase Auth (getUser, not just
// decoded), and the role is read from the caller's OWN profiles row through
// the caller's own credentials — so Row Level Security, not anything the
// client sends, decides whether they are an admin.
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 501 });
  }

  const authorization = req.headers.get("authorization") ?? "";
  const bearer = /^Bearer\s+(\S+)$/i.exec(authorization)?.[1];

  let client;
  let userResult;
  if (bearer) {
    client = createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${bearer}` } },
    });
    userResult = await client.auth.getUser(bearer);
  } else {
    // Cookie-authenticated requests are what a cross-site page could try to
    // forge from the admin's browser; browsers label those, so refuse them.
    if (req.headers.get("sec-fetch-site") === "cross-site") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    client = await createServerSupabaseClient();
    userResult = await client.auth.getUser();
  }

  const user = userResult.data.user;
  if (userResult.error || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profileError || profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  return null;
}
