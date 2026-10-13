import { NextRequest } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerSupabaseClient } from "./server";

// Who is calling this API route? Returns the id of the signed-in user, or null.
//
// The caller proves it one of two ways: the website's Supabase session cookie,
// or an `Authorization: Bearer <access token>` header (the mobile app). Either
// way Supabase Auth validates the token (getUser, not just decoded).
export async function getRequestUserId(req: NextRequest): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const bearer = /^Bearer\s+(\S+)$/i.exec(req.headers.get("authorization") ?? "")?.[1];
  if (bearer) {
    const client = createSupabaseClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.getUser(bearer);
    return error ? null : (data.user?.id ?? null);
  }

  // Cookie-authenticated requests are what a cross-site page could try to
  // forge from the user's browser; browsers label those, so refuse them.
  if (req.headers.get("sec-fetch-site") === "cross-site") return null;
  const client = await createServerSupabaseClient();
  const { data, error } = await client.auth.getUser();
  return error ? null : (data.user?.id ?? null);
}
