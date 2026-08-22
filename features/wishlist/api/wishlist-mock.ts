import { getMockSession } from "@/lib/mock/auth";
import type {
  WishlistInput,
  WishlistItem,
  WishlistItemId,
} from "@/features/wishlist/types";

type MockWishlistItem = WishlistItem & { id: string };

const mockWishlistKeyPrefix = "wishlist-app:mock-items";

function getMockWishlistKey() {
  const email = getMockSession()?.email ?? "guest";
  return `${mockWishlistKeyPrefix}:${email}`;
}

function readMockWishlistItems() {
  const storedItems = window.localStorage.getItem(getMockWishlistKey());

  if (!storedItems) {
    return [];
  }

  try {
    const items: unknown = JSON.parse(storedItems);
    return Array.isArray(items) ? (items as MockWishlistItem[]) : [];
  } catch {
    return [];
  }
}

function saveMockWishlistItems(items: MockWishlistItem[]) {
  window.localStorage.setItem(getMockWishlistKey(), JSON.stringify(items));
}

function normalizePrice(price: string) {
  if (!price.trim()) {
    return null;
  }

  const normalizedPrice = Number(price);
  return Number.isInteger(normalizedPrice) && normalizedPrice >= 0
    ? normalizedPrice
    : null;
}

export function getMockWishlistItems() {
  return readMockWishlistItems();
}

export function createMockWishlistItem(input: WishlistInput) {
  const items = readMockWishlistItems();
  const item: MockWishlistItem = {
    category: input.category || null,
    completed: false,
    created_at: new Date().toISOString(),
    desire_level: input.desire_level,
    id: crypto.randomUUID(),
    image_path: input.image_path || null,
    image_url: input.image_path || null,
    memo: input.memo || null,
    price: normalizePrice(input.price),
    title: input.title,
    url: input.url || null,
  };

  saveMockWishlistItems([item, ...items]);
  return item;
}

export function updateMockWishlistItem(
  itemId: WishlistItemId,
  updates: Partial<WishlistInput> & { completed?: boolean },
) {
  const items = readMockWishlistItems();
  const nextItems = items.map((item) => {
    if (String(item.id) !== String(itemId)) {
      return item;
    }

    const imagePath = updates.image_path ?? item.image_path ?? "";

    return {
      ...item,
      category:
        updates.category === undefined ? item.category : updates.category || null,
      completed: updates.completed ?? item.completed,
      desire_level: updates.desire_level ?? item.desire_level,
      image_path: imagePath || null,
      image_url: imagePath || null,
      memo: updates.memo === undefined ? item.memo : updates.memo || null,
      price:
        updates.price === undefined ? item.price : normalizePrice(updates.price),
      title: updates.title ?? item.title,
      url: updates.url === undefined ? item.url : updates.url || null,
    };
  });

  saveMockWishlistItems(nextItems);
}

export function deleteMockWishlistItem(itemId: WishlistItemId) {
  saveMockWishlistItems(
    readMockWishlistItems().filter(
      (item) => String(item.id) !== String(itemId),
    ),
  );
}

export function readMockImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("画像の読み込みに失敗しました。"));
    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました。"));
    reader.readAsDataURL(file);
  });
}
