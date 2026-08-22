import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import type { WishlistItem } from "@/features/wishlist/types";

const bucketName = "wishlist-images";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStringField(body: Record<string, unknown>, field: string) {
  const value = body[field];
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalPrice(body: Record<string, unknown>) {
  const value = body.price;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const price = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(price) || price < 0) {
    return undefined;
  }

  return price;
}

function readOptionalDesireLevel(body: Record<string, unknown>) {
  const value = body.desire_level;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const desireLevel = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(desireLevel) || desireLevel < 1 || desireLevel > 5) {
    return undefined;
  }

  return desireLevel;
}

function isNewImagePathForUser(imagePath: string, userId: string) {
  return !imagePath || imagePath.startsWith(`${userId}/`);
}

async function addSignedImageUrls(
  supabase: Awaited<ReturnType<typeof getAuthenticatedUser>>["supabase"],
  todos: WishlistItem[],
) {
  return Promise.all(
    todos.map(async (todo) => {
      if (!todo.image_path) {
        return todo;
      }

      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(todo.image_path, 60 * 60);

      return {
        ...todo,
        image_url: error ? null : data.signedUrl,
      };
    }),
  );
}

async function requireAuthenticatedUser() {
  const auth = await getAuthenticatedUser();

  if (auth.error || !auth.user) {
    return null;
  }

  return auth;
}

export async function GET() {
  const auth = await requireAuthenticatedUser();

  if (!auth) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const { data, error } = await auth.supabase
    .from("todos")
    .select("*")
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "欲しいものリストを取得できませんでした。" },
      { status: 500 },
    );
  }

  return NextResponse.json(await addSignedImageUrls(auth.supabase, data ?? []));
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();

  if (!auth) {
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

  const title = readStringField(body, "title");
  const price = readOptionalPrice(body);
  const desireLevel = readOptionalDesireLevel(body);
  const url = readStringField(body, "url");
  const imagePath = readStringField(body, "image_path");
  const memo = readStringField(body, "memo");
  const category = readStringField(body, "category");

  if (!title) {
    return NextResponse.json({ error: "商品名を入力してください。" }, { status: 400 });
  }

  if (price === undefined) {
    return NextResponse.json({ error: "価格は0以上の整数で入力してください。" }, { status: 400 });
  }

  if (desireLevel === undefined) {
    return NextResponse.json(
      { error: "欲しいレベルは1から5で入力してください。" },
      { status: 400 },
    );
  }

  if (!isNewImagePathForUser(imagePath, auth.user!.id)) {
    return NextResponse.json({ error: "画像の指定が正しくありません。" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("todos")
    .insert({
      category: category || null,
      completed: false,
      desire_level: desireLevel,
      image_path: imagePath || null,
      memo: memo || null,
      price,
      title,
      url: url || null,
      user_id: auth.user!.id,
    })
    .select("*")
    .single<WishlistItem>();

  if (error) {
    return NextResponse.json(
      { error: "欲しいものを保存できませんでした。" },
      { status: 500 },
    );
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requireAuthenticatedUser();

  if (!auth) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ error: "対象を指定してください。" }, { status: 400 });
  }

  const { data: existingTodo, error: findError } = await auth.supabase
    .from("todos")
    .select("id, image_path")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single<Pick<WishlistItem, "id" | "image_path">>();

  if (findError || !existingTodo) {
    return NextResponse.json({ error: "対象が見つかりません。" }, { status: 404 });
  }

  if (existingTodo.image_path) {
    const { error: storageError } = await auth.supabase.storage
      .from(bucketName)
      .remove([existingTodo.image_path]);

    if (storageError) {
      return NextResponse.json(
        { error: "画像を削除できなかったため、欲しいものを削除しませんでした。" },
        { status: 500 },
      );
    }
  }

  const { data, error } = await auth.supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single<WishlistItem>();

  if (error) {
    return NextResponse.json(
      { error: "欲しいものを削除できませんでした。" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
