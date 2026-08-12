"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type WishlistItem = {
  id: number;
  name: string;
  price: number;
  url: string;
  memo: string;
  purchased: boolean;
};

type FormState = {
  name: string;
  price: string;
  url: string;
  memo: string;
  purchased: boolean;
};

const initialItems: WishlistItem[] = [
  {
    id: 1,
    name: "ノイズキャンセリングイヤホン",
    price: 24800,
    url: "https://example.com/earbuds",
    memo: "通勤用。セール時に再チェック。",
    purchased: false,
  },
  {
    id: 2,
    name: "デスクライト",
    price: 6200,
    url: "https://example.com/light",
    memo: "作業机の左側に置けるサイズ。",
    purchased: true,
  },
];

const emptyForm: FormState = {
  name: "",
  price: "",
  url: "",
  memo: "",
  purchased: false,
};

const filters = [
  { label: "すべて", value: "all" },
  { label: "未購入", value: "wanted" },
  { label: "購入済み", value: "purchased" },
] as const;

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  currency: "JPY",
  maximumFractionDigits: 0,
  style: "currency",
});

export default function Home() {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");

  const visibleItems = useMemo(() => {
    if (filter === "wanted") {
      return items.filter((item) => !item.purchased);
    }

    if (filter === "purchased") {
      return items.filter((item) => item.purchased);
    }

    return items;
  }, [filter, items]);

  const wantedItems = items.filter((item) => !item.purchased);
  const wantedTotal = wantedItems.reduce((sum, item) => sum + item.price, 0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextItem = {
      name: form.name.trim(),
      price: Number(form.price || 0),
      url: form.url.trim(),
      memo: form.memo.trim(),
      purchased: form.purchased,
    };

    if (!nextItem.name) {
      return;
    }

    if (editingId) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingId ? { ...item, ...nextItem } : item,
        ),
      );
      setEditingId(null);
    } else {
      setItems((currentItems) => [
        { ...nextItem, id: Date.now() },
        ...currentItems,
      ]);
    }

    setForm(emptyForm);
  }

  function startEdit(item: WishlistItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      price: String(item.price),
      url: item.url,
      memo: item.memo,
      purchased: item.purchased,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function togglePurchased(itemId: number, purchased: boolean) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, purchased } : item,
      ),
    );
  }

  function deleteItem(itemId: number) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );

    if (editingId === itemId) {
      cancelEdit();
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Wishlist
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              欲しいもの管理
            </h1>
            <p className="mt-2 text-sm font-medium leading-6 text-zinc-600 sm:text-base">
              気になるものをまとめて管理
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm sm:w-[360px]">
            <Metric label="合計" value={`${items.length}`} />
            <Metric label="未購入" value={`${wantedItems.length}`} />
            <Metric label="予算" value={currencyFormatter.format(wantedTotal)} />
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
          <form
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">
                {editingId ? "編集" : "登録"}
              </h2>
              {editingId ? (
                <button
                  aria-label="編集をキャンセル"
                  className="inline-flex size-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50"
                  onClick={cancelEdit}
                  title="編集をキャンセル"
                  type="button"
                >
                  <X size={18} />
                </button>
              ) : null}
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">名前</span>
                <input
                  className="mt-2 h-12 w-full rounded-md border border-zinc-300 bg-white px-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="例: ワイヤレスキーボード"
                  required
                  value={form.name}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">価格</span>
                <input
                  className="mt-2 h-12 w-full rounded-md border border-zinc-300 bg-white px-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  inputMode="numeric"
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  placeholder="12000"
                  type="number"
                  value={form.price}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">URL</span>
                <input
                  className="mt-2 h-12 w-full rounded-md border border-zinc-300 bg-white px-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      url: event.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                  type="url"
                  value={form.url}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">メモ</span>
                <textarea
                  className="mt-2 min-h-24 w-full resize-none rounded-md border border-zinc-300 bg-white px-3 py-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      memo: event.target.value,
                    }))
                  }
                  placeholder="サイズ、候補、買うタイミングなど"
                  value={form.memo}
                />
              </label>

              <label className="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3">
                <Checkbox.Root
                  checked={form.purchased}
                  className="flex size-6 items-center justify-center rounded border border-zinc-300 bg-white text-white outline-none transition data-[state=checked]:border-emerald-700 data-[state=checked]:bg-emerald-700"
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      purchased: checked === true,
                    }))
                  }
                >
                  <Checkbox.Indicator>
                    <Check size={16} strokeWidth={3} />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <span className="text-sm font-semibold text-zinc-800">
                  購入済み
                </span>
              </label>

              <button
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-base font-bold text-white transition hover:bg-emerald-800"
                type="submit"
              >
                <Plus size={19} />
                {editingId ? "更新する" : "追加する"}
              </button>
            </div>
          </form>

          <section className="space-y-4">
            <Tabs.Root
              onValueChange={(value) =>
                setFilter(value as (typeof filters)[number]["value"])
              }
              value={filter}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold">欲しいもの一覧</h2>
                <Tabs.List
                  aria-label="表示する欲しいもの"
                  className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-200 p-1"
                >
                  {filters.map((filterItem) => (
                    <Tabs.Trigger
                      className="h-10 rounded-md px-3 text-sm font-bold text-zinc-600 outline-none transition data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm"
                      key={filterItem.value}
                      value={filterItem.value}
                    >
                      {filterItem.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
              </div>

              {filters.map((filterItem) => (
                <Tabs.Content
                  className="mt-4 grid gap-3"
                  key={filterItem.value}
                  value={filterItem.value}
                >
                  {visibleItems.length > 0 ? (
                    visibleItems.map((item) => (
                      <WishlistCard
                        item={item}
                        key={item.id}
                        onDelete={deleteItem}
                        onEdit={startEdit}
                        onTogglePurchased={togglePurchased}
                      />
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm font-medium text-zinc-500">
                      表示できるアイテムがありません。
                    </div>
                  )}
                </Tabs.Content>
              ))}
            </Tabs.Root>
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-zinc-50 px-2 py-3 text-center">
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-zinc-950">{value}</p>
    </div>
  );
}

function WishlistCard({
  item,
  onDelete,
  onEdit,
  onTogglePurchased,
}: {
  item: WishlistItem;
  onDelete: (itemId: number) => void;
  onEdit: (item: WishlistItem) => void;
  onTogglePurchased: (itemId: number, purchased: boolean) => void;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Checkbox.Root
          aria-label={`${item.name}を購入済みにする`}
          checked={item.purchased}
          className="mt-1 flex size-7 shrink-0 items-center justify-center rounded border border-zinc-300 bg-white text-white outline-none transition data-[state=checked]:border-emerald-700 data-[state=checked]:bg-emerald-700"
          onCheckedChange={(checked) =>
            onTogglePurchased(item.id, checked === true)
          }
        >
          <Checkbox.Indicator>
            <Check size={17} strokeWidth={3} />
          </Checkbox.Indicator>
        </Checkbox.Root>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3
                className={`break-words text-lg font-bold leading-snug ${
                  item.purchased ? "text-zinc-500 line-through" : "text-zinc-950"
                }`}
              >
                {item.name}
              </h3>
              <p className="mt-1 text-xl font-bold text-emerald-800">
                {currencyFormatter.format(item.price)}
              </p>
            </div>
            <span
              className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${
                item.purchased
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {item.purchased ? <CheckCircle2 size={14} /> : null}
              {item.purchased ? "購入済み" : "未購入"}
            </span>
          </div>

          {item.memo ? (
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-600">
              {item.memo}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {item.url ? (
              <a
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
                href={item.url}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink size={16} />
                URL
              </a>
            ) : null}
            <button
              aria-label={`${item.name}を編集`}
              className="inline-flex size-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50"
              onClick={() => onEdit(item)}
              title="編集"
              type="button"
            >
              <Pencil size={17} />
            </button>
            <button
              aria-label={`${item.name}を削除`}
              className="inline-flex size-10 items-center justify-center rounded-md border border-rose-200 text-rose-700 transition hover:bg-rose-50"
              onClick={() => onDelete(item.id)}
              title="削除"
              type="button"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
