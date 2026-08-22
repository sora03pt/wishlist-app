import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import type { WishlistItem } from "@/features/wishlist/types";

type TodoRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type TodoUpdate = {
  title?: string;
  price?: number | null;
  url?: string | null;
  image_path?: string | null;
  memo?: string | null;
  category?: string | null;
  desire_level?: number | null;
  completed?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readOptionalTextUpdate(
  body: Record<string, unknown>,
  field: string,
) {
  if (!(field in body)) {
    return undefined;
  }

  const value = body[field];

  if (typeof value !== "string") {
    return null;
  }

  return value.trim();
}

function readOptionalPriceUpdate(body: Record<string, unknown>) {
  if (!("price" in body)) {
    return undefined;
  }

  const value = body.price;

  if (value === null || value === "") {
    return null;
  }

  const price = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(price) || price < 0) {
    return Number.NaN;
  }

  return price;
}

function readOptionalDesireLevelUpdate(body: Record<string, unknown>) {
  if (!("desire_level" in body)) {
    return undefined;
  }

  const value = body.desire_level;

  if (value === null || value === "") {
    return null;
  }

  const desireLevel = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(desireLevel) || desireLevel < 1 || desireLevel > 5) {
    return Number.NaN;
  }

  return desireLevel;
}

export async function PATCH(request: Request, { params }: TodoRouteContext) {
  const { id } = await params;
  const todoId = id.trim();

  if (!todoId) {
    return NextResponse.json({ error: "対象を指定してください。" }, { status: 400 });
  }

  const auth = await getAuthenticatedUser();

  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
  }

  const { data: existingTodo, error: findError } = await auth.supabase
    .from("todos")
    .select("id, image_path")
    .eq("id", todoId)
    .eq("user_id", auth.user.id)
    .single<Pick<WishlistItem, "id" | "image_path">>();

  if (findError || !existingTodo) {
    return NextResponse.json({ error: "対象が見つかりません。" }, { status: 404 });
  }

  const updates: TodoUpdate = {};
  const title = readOptionalTextUpdate(body, "title");
  const url = readOptionalTextUpdate(body, "url");
  const imagePath = readOptionalTextUpdate(body, "image_path");
  const memo = readOptionalTextUpdate(body, "memo");
  const category = readOptionalTextUpdate(body, "category");
  const price = readOptionalPriceUpdate(body);
  const desireLevel = readOptionalDesireLevelUpdate(body);

  if (title === "") {
    return NextResponse.json({ error: "商品名を入力してください。" }, { status: 400 });
  }

  if (title === null || url === null || imagePath === null || memo === null || category === null) {
    return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
  }

  if (typeof title === "string") {
    updates.title = title;
  }

  if (typeof url === "string") {
    updates.url = url || null;
  }

  if (typeof imagePath === "string") {
    const isExistingImage = imagePath === (existingTodo.image_path ?? "");
    const isNewUserImage = imagePath.startsWith(`${auth.user.id}/`);

    if (imagePath && !isExistingImage && !isNewUserImage) {
      return NextResponse.json({ error: "画像の指定が正しくありません。" }, { status: 400 });
    }

    updates.image_path = imagePath || null;
  }

  if (typeof memo === "string") {
    updates.memo = memo || null;
  }

  if (typeof category === "string") {
    updates.category = category || null;
  }

  if (typeof price === "number" && Number.isNaN(price)) {
    return NextResponse.json({ error: "価格は0以上の整数で入力してください。" }, { status: 400 });
  }

  if (price !== undefined && !Number.isNaN(price)) {
    updates.price = price;
  }

  if (typeof desireLevel === "number" && Number.isNaN(desireLevel)) {
    return NextResponse.json(
      { error: "欲しいレベルは1から5で入力してください。" },
      { status: 400 },
    );
  }

  if (desireLevel !== undefined && !Number.isNaN(desireLevel)) {
    updates.desire_level = desireLevel;
  }

  if ("completed" in body) {
    if (typeof body.completed !== "boolean") {
      return NextResponse.json(
        { error: "購入状態の指定が正しくありません。" },
        { status: 400 },
      );
    }

    updates.completed = body.completed;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "更新する内容を入力してください。" },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("todos")
    .update(updates)
    .eq("id", todoId)
    .eq("user_id", auth.user.id)
    .select("*")
    .single<WishlistItem>();

  if (error) {
    return NextResponse.json(
      { error: "欲しいものを更新できませんでした。" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
