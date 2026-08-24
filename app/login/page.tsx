"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  isLocalMockMode,
  registerMockEmail,
  setMockSession,
} from "@/lib/mock/auth";

type AuthMode = "sign-in" | "sign-up";
type AuthErrorTarget = "email" | "form" | "password" | null;

const alreadyRegisteredMessage =
  "このメールアドレスはすでに登録されています。ログインしてください。";

function isAlreadyRegisteredAuthError(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "user_already_exists" ||
    error.message === "User already registered"
  );
}

function getAuthErrorMessage(mode: AuthMode) {
  return mode === "sign-in"
    ? "メールアドレスまたはパスワードが正しくありません。"
    : "登録に失敗しました。入力内容を確認してもう一度お試しください。";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTarget, setErrorTarget] = useState<AuthErrorTarget>(null);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function showError(message: string, target: Exclude<AuthErrorTarget, null>) {
    setErrorMessage(message);
    setErrorTarget(target);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      showError("有効なメールアドレスを入力してください。", "email");
      return;
    }

    if (password.length < 8) {
      showError("パスワードは8文字以上で入力してください。", "password");
      return;
    }

    setErrorMessage("");
    setErrorTarget(null);
    setNoticeMessage("");
    setIsSubmitting(true);

    try {
      if (isLocalMockMode) {
        if (mode === "sign-up" && !registerMockEmail(normalizedEmail)) {
          showError(alreadyRegisteredMessage, "email");
          return;
        }

        setMockSession(normalizedEmail);
        router.replace("/");
        router.refresh();
        return;
      }

      const { createSupabaseBrowserClient } = await import(
        "@/lib/supabase/client"
      );
      const supabase = createSupabaseBrowserClient();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          showError(getAuthErrorMessage(mode), "form");
          return;
        }

        router.replace("/");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        showError(
          isAlreadyRegisteredAuthError(error)
            ? alreadyRegisteredMessage
            : getAuthErrorMessage(mode),
          isAlreadyRegisteredAuthError(error) ? "email" : "form",
        );
        return;
      }

      if (data.user?.identities?.length === 0) {
        showError(alreadyRegisteredMessage, "email");
        return;
      }

      if (data.session) {
        router.replace("/");
        router.refresh();
        return;
      }

      setNoticeMessage(
        "確認メールを送信しました。メール内のリンクを開いて登録を完了してください。",
      );
    } catch {
      showError(
        "通信に失敗しました。時間をおいてもう一度お試しください。",
        "form",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage("");
    setErrorTarget(null);
    setNoticeMessage("");
  }

  const isSignIn = mode === "sign-in";

  return (
    <main className="app-canvas min-h-screen px-4 py-6 text-foreground sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase text-accent-emphasis">
                Wishlist
              </p>
              {isLocalMockMode ? (
                <Badge variant="lavender">ローカルモック</Badge>
              ) : null}
            </div>
            <CardTitle asChild>
              <h1 className="mt-2 text-2xl text-foreground/80">
                {isSignIn ? "ログイン" : "新規登録"}
              </h1>
            </CardTitle>
            {isLocalMockMode ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                開発用の疑似認証です。入力内容はSupabaseへ送信されません。
              </p>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 rounded-xl border border-border bg-accent/60 p-1">
              <Button
                aria-pressed={isSignIn}
                className="rounded-lg"
                onClick={() => changeMode("sign-in")}
                type="button"
                variant={isSignIn ? "default" : "ghost"}
              >
                ログイン
              </Button>
              <Button
                aria-pressed={!isSignIn}
                className="rounded-lg"
                onClick={() => changeMode("sign-up")}
                type="button"
                variant={isSignIn ? "ghost" : "default"}
              >
                新規登録
              </Button>
            </div>

            <form
              aria-busy={isSubmitting}
              className="mt-6 space-y-4"
              noValidate
              onSubmit={handleSubmit}
            >
              <FormField>
                <FormLabel htmlFor="auth-email" required>
                  メールアドレス
                </FormLabel>
                <Input
                  aria-describedby={
                    errorTarget === "email" || errorTarget === "form"
                      ? "auth-error"
                      : undefined
                  }
                  aria-invalid={
                    errorTarget === "email" || errorTarget === "form"
                  }
                  autoComplete="email"
                  disabled={isSubmitting}
                  id="auth-email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errorTarget === "email" || errorTarget === "form") {
                      setErrorMessage("");
                      setErrorTarget(null);
                    }
                  }}
                  placeholder="you@example.com"
                  type="email"
                  required
                  value={email}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="auth-password" required>
                  パスワード
                </FormLabel>
                <Input
                  aria-describedby={
                    errorTarget === "password" || errorTarget === "form"
                      ? "auth-error"
                      : undefined
                  }
                  aria-invalid={
                    errorTarget === "password" || errorTarget === "form"
                  }
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  disabled={isSubmitting}
                  id="auth-password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (
                      errorTarget === "password" ||
                      errorTarget === "form"
                    ) {
                      setErrorMessage("");
                      setErrorTarget(null);
                    }
                  }}
                  placeholder="8文字以上"
                  type="password"
                  required
                  value={password}
                />
              </FormField>

              {errorMessage ? (
                <p
                  className="rounded-xl border border-destructive-border bg-destructive-surface px-3 py-3 text-sm font-medium leading-6 text-destructive"
                  id="auth-error"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}

              {noticeMessage ? (
                <p
                  className="rounded-xl border border-selected-border bg-selected-subtle px-3 py-3 text-sm font-medium leading-6 text-selected-foreground"
                  role="status"
                >
                  {noticeMessage}
                </p>
              ) : null}

              <Button
                className="h-12 w-full text-base"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <LoadingIndicator size={19} />
                ) : isSignIn ? (
                  <LogIn size={19} />
                ) : (
                  <UserPlus size={19} />
                )}
                {isSubmitting
                  ? "処理中"
                  : isSignIn
                    ? "ログイン"
                    : "新規登録する"}
              </Button>
              {isSubmitting ? (
                <p className="sr-only" role="status">
                  {isSignIn ? "ログイン処理中です。" : "新規登録処理中です。"}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
