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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

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
  const [noticeMessage, setNoticeMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setErrorMessage("有効なメールアドレスを入力してください。");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("パスワードは8文字以上で入力してください。");
      return;
    }

    setErrorMessage("");
    setNoticeMessage("");
    setIsSubmitting(true);

    try {
      if (isLocalMockMode) {
        if (mode === "sign-up" && !registerMockEmail(normalizedEmail)) {
          setErrorMessage(alreadyRegisteredMessage);
          return;
        }

        setMockSession(normalizedEmail);
        router.replace("/");
        router.refresh();
        return;
      }

      const supabase = createSupabaseBrowserClient();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          setErrorMessage(getAuthErrorMessage(mode));
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
        setErrorMessage(
          isAlreadyRegisteredAuthError(error)
            ? alreadyRegisteredMessage
            : getAuthErrorMessage(mode),
        );
        return;
      }

      if (data.user?.identities?.length === 0) {
        setErrorMessage(alreadyRegisteredMessage);
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
      setErrorMessage("通信に失敗しました。時間をおいてもう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage("");
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
            <CardTitle className="mt-2 text-2xl text-foreground/80">
              {isSignIn ? "ログイン" : "新規登録"}
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
                className="rounded-lg"
                onClick={() => changeMode("sign-in")}
                type="button"
                variant={isSignIn ? "default" : "ghost"}
              >
                ログイン
              </Button>
              <Button
                className="rounded-lg"
                onClick={() => changeMode("sign-up")}
                type="button"
                variant={isSignIn ? "ghost" : "default"}
              >
                新規登録
              </Button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <FormField>
                <FormLabel htmlFor="auth-email">メールアドレス</FormLabel>
                <Input
                  autoComplete="email"
                  disabled={isSubmitting}
                  id="auth-email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="auth-password">パスワード</FormLabel>
                <Input
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  disabled={isSubmitting}
                  id="auth-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="8文字以上"
                  type="password"
                  value={password}
                />
              </FormField>

              {errorMessage ? (
                <p
                  className="rounded-xl border border-destructive-border bg-destructive-surface px-3 py-3 text-sm font-medium leading-6 text-destructive"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}

              {noticeMessage ? (
                <p className="rounded-xl border border-selected-border bg-selected-subtle px-3 py-3 text-sm font-medium leading-6 text-selected-foreground">
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
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
