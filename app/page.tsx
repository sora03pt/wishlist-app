"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Check, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";

type Todo = {
  id: number | string;
  title: string;
  completed: boolean;
  created_at: string;
};

async function requestTodos() {
  const response = await fetch("/api/todos", {
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? "TODOの取得に失敗しました。");
  }

  return Array.isArray(result) ? (result as Todo[]) : [];
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<Todo["id"] | null>(null);
  const [updatingId, setUpdatingId] = useState<Todo["id"] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      setTodos(await requestTodos());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "TODOの取得に失敗しました。",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialTodos() {
      try {
        const nextTodos = await requestTodos();

        if (isActive) {
          setTodos(nextTodos);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "TODOの取得に失敗しました。",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialTodos();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextTitle = title.trim();

    if (!nextTitle) {
      setErrorMessage("titleを入力してください。");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/todos", {
        body: JSON.stringify({ title: nextTitle }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "TODOの登録に失敗しました。");
      }

      setTitle("");
      await fetchTodos();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "TODOの登録に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(todoId: Todo["id"]) {
    setDeletingId(todoId);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/todos?id=${encodeURIComponent(String(todoId))}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "TODOの削除に失敗しました。");
      }

      await fetchTodos();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "TODOの削除に失敗しました。",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleComplete(todoId: Todo["id"]) {
    setUpdatingId(todoId);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/todos/${encodeURIComponent(String(todoId))}`,
        {
          body: JSON.stringify({ completed: true }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "TODOの更新に失敗しました。");
      }

      await fetchTodos();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "TODOの更新に失敗しました。",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-zinc-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8">
        <header className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Todos
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                TODO管理
              </h1>
              <p className="mt-2 text-sm font-medium leading-6 text-zinc-600 sm:text-base">
                気になるものをまとめて管理
              </p>
            </div>
            <div className="w-fit rounded-md bg-zinc-50 px-3 py-2 text-sm font-bold text-zinc-700">
              {todos.length}件
            </div>
          </div>
        </header>

        <form
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          onSubmit={handleSubmit}
        >
          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">タイトル</span>
            <input
              className="mt-2 h-12 w-full rounded-md border border-zinc-300 bg-white px-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              disabled={isSubmitting}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例: 新しいタスク"
              value={title}
            />
          </label>

          <button
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-base font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={19} />
            ) : (
              <Plus size={19} />
            )}
            {isSubmitting ? "登録中" : "追加する"}
          </button>
        </form>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">TODO一覧</h2>
            <button
              aria-label="TODOを再取得"
              className="inline-flex size-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
              disabled={
                isLoading ||
                isSubmitting ||
                deletingId !== null ||
                updatingId !== null
              }
              onClick={() => void fetchTodos()}
              title="再取得"
              type="button"
            >
              <RefreshCw
                className={isLoading ? "animate-spin" : undefined}
                size={18}
              />
            </button>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-medium leading-6 text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-sm font-bold text-zinc-500">
                <Loader2 className="animate-spin" size={18} />
                読み込み中
              </div>
            ) : todos.length > 0 ? (
              todos.map((todo) => (
                <TodoCard
                  deletingId={deletingId}
                  key={todo.id}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  todo={todo}
                  updatingId={updatingId}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center text-sm font-medium text-zinc-500">
                TODOがまだありません。
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function TodoCard({
  deletingId,
  onComplete,
  onDelete,
  todo,
  updatingId,
}: {
  deletingId: Todo["id"] | null;
  onComplete: (todoId: Todo["id"]) => void;
  onDelete: (todoId: Todo["id"]) => void;
  todo: Todo;
  updatingId: Todo["id"] | null;
}) {
  const isDeleting = deletingId === todo.id;
  const isUpdating = updatingId === todo.id;
  const isBusy = deletingId !== null || updatingId !== null;

  return (
    <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span
            className={`inline-flex h-7 items-center rounded-md px-2 text-xs font-bold ${
              todo.completed
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {todo.completed ? "完了" : "未完了"}
          </span>
          <h3 className="mt-2 break-words text-base font-bold leading-7 text-zinc-950">
            {todo.title}
          </h3>
          <p className="mt-2 text-xs font-medium text-zinc-500">
            {formatCreatedAt(todo.created_at)}
          </p>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:shrink-0 sm:items-center">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-white px-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:hover:bg-white"
            disabled={todo.completed || isBusy}
            onClick={() => onComplete(todo.id)}
            type="button"
          >
            {isUpdating ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Check size={17} />
            )}
            {todo.completed ? "完了済み" : "完了にする"}
          </button>
          <button
            aria-label={`${todo.title}を削除`}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-rose-200 text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-transparent"
            disabled={isBusy}
            onClick={() => onDelete(todo.id)}
            title="削除"
            type="button"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Trash2 size={17} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
