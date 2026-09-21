import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Refreshes the Supabase auth session and writes any renewed cookies onto
// the given response (built by next-intl's middleware) so both middlewares
// share a single response/cookie jar.
export async function refreshSupabaseSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Required: triggers a token refresh if the session is stale, and writes
  // the refreshed cookies via setAll above.
  await supabase.auth.getUser();

  return response;
}
