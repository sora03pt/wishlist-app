import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabasePublicConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabaseの公開設定が不足しています。");
  }

  return { supabasePublishableKey, supabaseUrl };
}

export async function createSupabaseServerClient() {
  if (process.env.NODE_ENV === "development") {
    throw new Error("ローカルモックではSupabase APIを使用できません。");
  }

  const cookieStore = await cookies();
  const { supabasePublishableKey, supabaseUrl } = getSupabasePublicConfig();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Proxyでセッションを更新するため、Server Componentからの書き込みは不要です。
        }
      },
    },
  });
}

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { error, supabase, user };
}
