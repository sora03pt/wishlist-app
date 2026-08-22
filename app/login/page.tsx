"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff1f7,transparent_34%),linear-gradient(135deg,#fffafb_0%,#fbf7ff_48%,#ffffff_100%)] px-4 py-6 text-zinc-950 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
                Wishlist
              </p>
              {isLocalMockMode ? (
                <Badge variant="lavender">ローカルモック</Badge>
              ) : null}
            </div>
            <CardTitle className="mt-2 text-2xl text-zinc-700">
              {isSignIn ? "ログイン" : "新規登録"}
            </CardTitle>
            {isLocalMockMode ? (
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                開発用の疑似認証です。入力内容はSupabaseへ送信されません。
              </p>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 rounded-xl border border-pink-100 bg-pink-50/60 p-1">
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
              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">
                  メールアドレス
                </span>
                <input
                  autoComplete="email"
                  className="mt-2 h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                  disabled={isSubmitting}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">
                  パスワード
                </span>
                <input
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  className="mt-2 h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                  disabled={isSubmitting}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="8文字以上"
                  type="password"
                  value={password}
                />
              </label>

              {errorMessage ? (
                <p
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-medium leading-6 text-rose-700"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}

              {noticeMessage ? (
                <p className="rounded-xl border border-lavender-200 bg-lavender-50 px-3 py-3 text-sm font-medium leading-6 text-lavender-700">
                  {noticeMessage}
                </p>
              ) : null}

              <Button
                className="h-12 w-full rounded-2xl bg-zinc-950 text-base hover:bg-zinc-800"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={19} />
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
