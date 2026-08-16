"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

type WishlistItem = {
  id: number | string;
  title: string;
  price: number | null;
  url: string | null;
  memo: string | null;
  category: string | null;
  completed: boolean;
  created_at: string;
};

type WishlistForm = {
  title: string;
  price: string;
  url: string;
  category: string;
  memo: string;
};

type GetStatus = "idle" | "initial" | "refreshing";

const initialForm: WishlistForm = {
  category: "",
  memo: "",
  price: "",
  title: "",
  url: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeWishlistItem(value: unknown): WishlistItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const {
    id,
    title,
    price,
    url,
    memo,
    category,
    completed,
    created_at: createdAt,
  } = value;

  if (
    (typeof id !== "number" && typeof id !== "string") ||
    typeof title !== "string" ||
    typeof createdAt !== "string"
  ) {
    return null;
  }

  const normalizedPrice =
    typeof price === "number"
      ? price
      : typeof price === "string" && price.trim()
        ? Number(price)
        : null;

  return {
    category: typeof category === "string" ? category : null,
    completed: completed === true,
    created_at: createdAt,
    id,
    memo: typeof memo === "string" ? memo : null,
    price:
      normalizedPrice === null || Number.isNaN(normalizedPrice)
        ? null
        : normalizedPrice,
    title,
    url: typeof url === "string" ? url : null,
  };
}

function getApiErrorMessage(value: unknown, fallbackMessage: string) {
  if (
    isRecord(value) &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return fallbackMessage;
}

async function readJsonResponse(
  response: Response,
  fallbackMessage: string,
): Promise<unknown> {
  let result: unknown = null;

  try {
    result = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(fallbackMessage);
    }
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(result, fallbackMessage));
  }

  return result;
}

async function requestWishlistItems() {
  const response = await fetch("/api/todos", {
    cache: "no-store",
  });
  const result = await readJsonResponse(
    response,
    "欲しいものリストの取得に失敗しました。",
  );

  return Array.isArray(result)
    ? result.flatMap((value) => {
        const item = normalizeWishlistItem(value);
        return item ? [item] : [];
      })
    : [];
}

function formatPrice(price: number | null) {
  if (price === null) {
    return "価格未設定";
  }

  return new Intl.NumberFormat("ja-JP", {
    currency: "JPY",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(price);
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

export default function Home() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [form, setForm] = useState<WishlistForm>(initialForm);
  const [getStatus, setGetStatus] = useState<GetStatus>("initial");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<WishlistItem["id"] | null>(null);
  const [updatingId, setUpdatingId] = useState<WishlistItem["id"] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const trimmedTitle = form.title.trim();
  const isInitialLoading = getStatus === "initial";
  const isRefreshing = getStatus === "refreshing";
  const hasItemMutation = deletingId !== null || updatingId !== null;
  const canSubmit = trimmedTitle.length > 0 && !isSubmitting;
  const purchasedCount = useMemo(
    () => items.filter((item) => item.completed).length,
    [items],
  );
  const unpurchasedCount = items.length - purchasedCount;

  const fetchWishlistItems = useCallback(async () => {
    setGetStatus("refreshing");
    setErrorMessage("");

    try {
      setItems(await requestWishlistItems());
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "欲しいものリストの取得に失敗しました。",
      );
    } finally {
      setGetStatus("idle");
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialItems() {
      try {
        const nextItems = await requestWishlistItems();

        if (isActive) {
          setItems(nextItems);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "欲しいものリストの取得に失敗しました。",
          );
        }
      } finally {
        if (isActive) {
          setGetStatus("idle");
        }
      }
    }

    void loadInitialItems();

    return () => {
      isActive = false;
    };
  }, []);

  function updateForm<Field extends keyof WishlistForm>(
    field: Field,
    value: WishlistForm[Field],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!trimmedTitle) {
      setErrorMessage("商品名を入力してください。");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/todos", {
        body: JSON.stringify({
          category: form.category.trim(),
          memo: form.memo.trim(),
          price: form.price.trim(),
          title: trimmedTitle,
          url: form.url.trim(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      await readJsonResponse(response, "欲しいものの登録に失敗しました。");

      setForm(initialForm);
      await fetchWishlistItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "欲しいものの登録に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTogglePurchased(item: WishlistItem) {
    if (deletingId !== null || updatingId !== null) {
      return;
    }

    setUpdatingId(item.id);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/todos/${encodeURIComponent(String(item.id))}`,
        {
          body: JSON.stringify({ completed: !item.completed }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
        },
      );

      await readJsonResponse(response, "購入状態の更新に失敗しました。");
      await fetchWishlistItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "購入状態の更新に失敗しました。",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(itemId: WishlistItem["id"]) {
    if (deletingId !== null || updatingId !== null) {
      return;
    }

    setDeletingId(itemId);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/todos?id=${encodeURIComponent(String(itemId))}`,
        {
          method: "DELETE",
        },
      );

      await readJsonResponse(response, "欲しいものの削除に失敗しました。");
      await fetchWishlistItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "欲しいものの削除に失敗しました。",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-zinc-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8">
        <header className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Wishlist
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                欲しいものリスト
              </h1>
              <p className="mt-2 text-sm font-medium leading-6 text-zinc-600 sm:text-base">
                気になるものをまとめて管理
              </p>
            </div>
            <div className="grid w-full grid-cols-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 text-center text-xs font-bold text-zinc-700 sm:w-auto">
              <div className="px-3 py-2">
                <span className="block text-base text-zinc-950">
                  {items.length}
                </span>
                全件
              </div>
              <div className="border-x border-zinc-200 px-3 py-2">
                <span className="block text-base text-amber-700">
                  {unpurchasedCount}
                </span>
                未購入
              </div>
              <div className="px-3 py-2">
                <span className="block text-base text-emerald-700">
                  {purchasedCount}
                </span>
                購入済み
              </div>
            </div>
          </div>
        </header>

        <form
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-zinc-800">
                商品名
              </span>
              <input
                className="mt-2 h-12 w-full rounded-md border border-zinc-300 bg-white px-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                disabled={isSubmitting}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="例: ノイズキャンセリングイヤホン"
                value={form.title}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">価格</span>
              <input
                className="mt-2 h-12 w-full rounded-md border border-zinc-300 bg-white px-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                disabled={isSubmitting}
                inputMode="numeric"
                min="0"
                onChange={(event) => updateForm("price", event.target.value)}
                placeholder="例: 19800"
                type="number"
                value={form.price}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">URL</span>
              <input
                className="mt-2 h-12 w-full rounded-md border border-zinc-300 bg-white px-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                disabled={isSubmitting}
                onChange={(event) => updateForm("url", event.target.value)}
                placeholder="https://example.com/item"
                type="url"
                value={form.url}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                カテゴリ
              </span>
              <input
                className="mt-2 h-12 w-full rounded-md border border-zinc-300 bg-white px-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                disabled={isSubmitting}
                onChange={(event) =>
                  updateForm("category", event.target.value)
                }
                placeholder="例: ガジェット"
                value={form.category}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-zinc-800">メモ</span>
              <textarea
                className="mt-2 min-h-24 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                disabled={isSubmitting}
                onChange={(event) => updateForm("memo", event.target.value)}
                placeholder="サイズ、色、比較したいポイントなど"
                value={form.memo}
              />
            </label>
          </div>

          <button
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-base font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={!canSubmit}
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
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">欲しいもの一覧</h2>
              {isRefreshing ? (
                <span className="text-xs font-bold text-zinc-500">
                  再取得中
                </span>
              ) : null}
            </div>
            <button
              aria-label="欲しいものを再取得"
              className="inline-flex size-10 items-center justify-center rounded-md border border-zinc-200 text-emerald-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
              disabled={
                isInitialLoading ||
                isRefreshing ||
                isSubmitting ||
                hasItemMutation
              }
              onClick={() => void fetchWishlistItems()}
              title={isRefreshing ? "再取得中" : "再取得"}
              type="button"
            >
              <RefreshCw
                className={
                  isInitialLoading || isRefreshing ? "animate-spin" : undefined
                }
                size={18}
              />
            </button>
          </div>

          {errorMessage ? (
            <div
              className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-medium leading-6 text-rose-700"
              role="alert"
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3">
            {isInitialLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-sm font-bold text-zinc-500">
                <Loader2 className="animate-spin" size={18} />
                読み込み中
              </div>
            ) : items.length > 0 ? (
              items.map((item) => (
                <WishlistCard
                  deletingId={deletingId}
                  item={item}
                  itemActionDisabled={hasItemMutation}
                  key={item.id}
                  onDelete={handleDelete}
                  onTogglePurchased={handleTogglePurchased}
                  updatingId={updatingId}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center text-sm font-medium text-zinc-500">
                欲しいものがまだありません。
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function WishlistCard({
  deletingId,
  item,
  itemActionDisabled,
  onDelete,
  onTogglePurchased,
  updatingId,
}: {
  deletingId: WishlistItem["id"] | null;
  item: WishlistItem;
  itemActionDisabled: boolean;
  onDelete: (itemId: WishlistItem["id"]) => void;
  onTogglePurchased: (item: WishlistItem) => void;
  updatingId: WishlistItem["id"] | null;
}) {
  const isDeleting = deletingId === item.id;
  const isUpdating = updatingId === item.id;
  const isBusy = itemActionDisabled || isDeleting || isUpdating;

  return (
    <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span
            className={`inline-flex h-7 items-center rounded-md px-2 text-xs font-bold ${
              item.completed
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {item.completed ? "購入済み" : "未購入"}
          </span>

          <h3 className="mt-2 break-words text-base font-bold leading-7 text-zinc-950">
            {item.title}
          </h3>

          <dl className="mt-3 grid gap-2 text-sm text-zinc-700">
            <div className="flex items-start gap-2">
              <dt className="w-20 shrink-0 font-bold text-zinc-500">価格</dt>
              <dd className="min-w-0 font-semibold text-zinc-900">
                {formatPrice(item.price)}
              </dd>
            </div>

            <div className="flex items-start gap-2">
              <dt className="w-20 shrink-0 font-bold text-zinc-500">
                カテゴリ
              </dt>
              <dd className="min-w-0 break-words">
                {item.category || "未設定"}
              </dd>
            </div>

            {item.memo ? (
              <div className="flex items-start gap-2">
                <dt className="w-20 shrink-0 font-bold text-zinc-500">メモ</dt>
                <dd className="min-w-0 whitespace-pre-wrap break-words leading-6">
                  {item.memo}
                </dd>
              </div>
            ) : null}

            {item.url ? (
              <div className="flex items-start gap-2">
                <dt className="w-20 shrink-0 font-bold text-zinc-500">
                  商品URL
                </dt>
                <dd className="min-w-0">
                  <a
                    className="inline-flex max-w-full items-center gap-1 break-all font-semibold text-emerald-700 underline-offset-4 hover:underline"
                    href={item.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <LinkIcon className="shrink-0" size={15} />
                    {item.url}
                    <ExternalLink className="shrink-0" size={14} />
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          <p className="mt-3 text-xs font-medium text-zinc-500">
            {formatCreatedAt(item.created_at)}
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:shrink-0 sm:items-center">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-white px-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:hover:bg-white"
            disabled={isBusy}
            onClick={() => onTogglePurchased(item)}
            type="button"
          >
            {isUpdating ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Check size={17} />
            )}
            {item.completed ? "未購入に戻す" : "購入済みにする"}
          </button>
          <button
            aria-label={`${item.title}を削除`}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-rose-200 text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-transparent"
            disabled={isBusy}
            onClick={() => onDelete(item.id)}
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
