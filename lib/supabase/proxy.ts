import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

function getSupabasePublicConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return { supabasePublishableKey, supabaseUrl };
}

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfig();
  let response = NextResponse.next({ request });

  if (!config) {
    return { response, userId: null };
  }

  const supabase = createServerClient(
    config.supabaseUrl,
    config.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, options, value }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims.sub === "string" ? data.claims.sub : null;

  return { response, userId };
}
