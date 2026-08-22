import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = getSafeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?auth=failed", request.url));
}
