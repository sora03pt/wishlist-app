"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  clearMockSession,
  getMockSession,
  isLocalMockMode,
} from "@/lib/mock/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SessionControls() {
  const pathname = usePathname();
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<
    typeof createSupabaseBrowserClient
  > | null>(null);
  const [email, setEmail] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (pathname === "/login" || pathname.startsWith("/auth/")) {
      return;
    }

    if (isLocalMockMode) {
      const session = getMockSession();

      if (!session) {
        router.replace("/login");
        router.refresh();
        return;
      }

      queueMicrotask(() => setEmail(session.email));
      return;
    }

    const supabase = createSupabaseBrowserClient();
    supabaseRef.current = supabase;
    let isActive = true;

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!isActive) {
        return;
      }

      if (error || !data.user) {
        router.replace("/login");
        router.refresh();
        return;
      }

      setEmail(data.user.email ?? "");
    });

    return () => {
      isActive = false;
    };
  }, [pathname, router]);

  if (pathname === "/login" || pathname.startsWith("/auth/") || !email) {
    return null;
  }

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    if (isLocalMockMode) {
      clearMockSession();
      router.replace("/login");
      router.refresh();
      return;
    }

    const supabase = supabaseRef.current;

    if (!supabase) {
      return;
    }

    setErrorMessage("");
    setIsSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setErrorMessage("ログアウトに失敗しました。もう一度お試しください。");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setErrorMessage("ログアウトに失敗しました。もう一度お試しください。");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="fixed right-3 top-3 z-50 flex items-center gap-2 sm:right-5 sm:top-5">
      {errorMessage ? (
        <p
          className="max-w-48 rounded-xl border border-destructive-border bg-destructive-surface px-3 py-2 text-xs font-medium text-destructive shadow-sm"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/90 p-1.5 shadow-sm backdrop-blur">
        <span className="hidden max-w-40 truncate px-2 text-xs font-medium text-foreground/70 sm:block">
          {email}
        </span>
        <Button
          aria-label="ログアウト"
          className="h-9 rounded-lg"
          disabled={isSigningOut}
          onClick={() => void handleSignOut()}
          size="sm"
          type="button"
          variant="outline"
        >
          {isSigningOut ? (
            <LoadingIndicator size={16} />
          ) : (
            <LogOut size={16} />
          )}
          <span className="hidden sm:inline">ログアウト</span>
        </Button>
      </div>
    </div>
  );
}
