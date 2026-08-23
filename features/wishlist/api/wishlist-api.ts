import { isLocalMockMode } from "@/lib/mock/auth";
import { readJsonResponse } from "@/features/wishlist/api/http";
import {
  createMockWishlistItem,
  deleteMockWishlistItem,
  getMockWishlistItems,
  updateMockWishlistItem,
} from "@/features/wishlist/api/wishlist-mock";
import type {
  WishlistInput,
  WishlistItem,
  WishlistItemId,
} from "@/features/wishlist/types";

const e2eMockDelay = Number(
  process.env.NEXT_PUBLIC_E2E_MOCK_DELAY_MS ?? "0",
);

async function runLocalMockAction<T>(action: () => T) {
  if (Number.isFinite(e2eMockDelay) && e2eMockDelay > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, e2eMockDelay));
  }

  return action();
}

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
    image_url: imageUrl,
    image_path: imagePath,
    memo,
    category,
    desire_level: desireLevel,
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
  const normalizedDesireLevel =
    typeof desireLevel === "number"
      ? desireLevel
      : typeof desireLevel === "string" && desireLevel.trim()
        ? Number(desireLevel)
        : null;

  return {
    category: typeof category === "string" ? category : null,
    completed: completed === true,
    created_at: createdAt,
    desire_level:
      normalizedDesireLevel === null || Number.isNaN(normalizedDesireLevel)
        ? null
        : normalizedDesireLevel,
    id,
    image_path: typeof imagePath === "string" ? imagePath : null,
    image_url: typeof imageUrl === "string" ? imageUrl : null,
    memo: typeof memo === "string" ? memo : null,
    price:
      normalizedPrice === null || Number.isNaN(normalizedPrice)
        ? null
        : normalizedPrice,
    title,
    url: typeof url === "string" ? url : null,
  };
}

function compareWishlistItemsByDesireLevel(
  firstItem: WishlistItem,
  secondItem: WishlistItem,
) {
  const firstDesireLevel = firstItem.desire_level ?? 0;
  const secondDesireLevel = secondItem.desire_level ?? 0;

  if (firstDesireLevel !== secondDesireLevel) {
    return secondDesireLevel - firstDesireLevel;
  }

  return (
    new Date(secondItem.created_at).getTime() -
    new Date(firstItem.created_at).getTime()
  );
}

export async function getWishlistItems() {
  const result = isLocalMockMode
    ? await runLocalMockAction(getMockWishlistItems)
    : await (async () => {
        const response = await fetch("/api/todos", { cache: "no-store" });
        return readJsonResponse(
          response,
          "欲しいものリストの取得に失敗しました。",
        );
      })();

  const items = Array.isArray(result)
    ? result.flatMap((value) => {
        const item = normalizeWishlistItem(value);
        return item ? [item] : [];
      })
    : [];

  return items.sort(compareWishlistItemsByDesireLevel);
}

export async function createWishlistItem(input: WishlistInput) {
  if (isLocalMockMode) {
    await runLocalMockAction(() => createMockWishlistItem(input));
    return;
  }

  const response = await fetch("/api/todos", {
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  await readJsonResponse(response, "欲しいものの登録に失敗しました。");
}

export async function updateWishlistItem(
  itemId: WishlistItemId,
  input: WishlistInput,
) {
  if (isLocalMockMode) {
    await runLocalMockAction(() => updateMockWishlistItem(itemId, input));
    return;
  }

  const response = await fetch(
    `/api/todos/${encodeURIComponent(String(itemId))}`,
    {
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    },
  );

  await readJsonResponse(response, "欲しいものの更新に失敗しました。");
}

export async function updateWishlistItemCompleted(
  itemId: WishlistItemId,
  completed: boolean,
) {
  if (isLocalMockMode) {
    await runLocalMockAction(() =>
      updateMockWishlistItem(itemId, { completed }),
    );
    return;
  }

  const response = await fetch(
    `/api/todos/${encodeURIComponent(String(itemId))}`,
    {
      body: JSON.stringify({ completed }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    },
  );

  await readJsonResponse(response, "購入状態の更新に失敗しました。");
}

export async function deleteWishlistItem(itemId: WishlistItemId) {
  if (isLocalMockMode) {
    await runLocalMockAction(() => deleteMockWishlistItem(itemId));
    return;
  }

  const response = await fetch(
    `/api/todos?id=${encodeURIComponent(String(itemId))}`,
    { method: "DELETE" },
  );

  await readJsonResponse(response, "欲しいものの削除に失敗しました。");
}
