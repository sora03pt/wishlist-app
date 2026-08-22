import { createBrowserClient } from "@supabase/ssr";

function getSupabasePublicConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabaseの公開設定が不足しています。");
  }

  return { supabasePublishableKey, supabaseUrl };
}

export function createSupabaseBrowserClient() {
  const { supabasePublishableKey, supabaseUrl } = getSupabasePublicConfig();

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
