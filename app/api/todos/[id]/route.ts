import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Todo = {
  id: string | number;
  title: string;
  price: number | null;
  url: string | null;
  image_url: string | null;
  memo: string | null;
  category: string | null;
  desire_level: number | null;
  completed: boolean;
  created_at: string;
};

type TodoRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type TodoUpdate = {
  title?: string;
  price?: number | null;
  url?: string | null;
  image_url?: string | null;
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
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const updates: TodoUpdate = {};
  const title = readOptionalTextUpdate(body, "title");
  const url = readOptionalTextUpdate(body, "url");
  const imageUrl = readOptionalTextUpdate(body, "image_url");
  const memo = readOptionalTextUpdate(body, "memo");
  const category = readOptionalTextUpdate(body, "category");
  const price = readOptionalPriceUpdate(body);
  const desireLevel = readOptionalDesireLevelUpdate(body);

  if (title === "") {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  if (
    title === null ||
    url === null ||
    imageUrl === null ||
    memo === null ||
    category === null
  ) {
    return NextResponse.json(
      { error: "Text fields must be strings." },
      { status: 400 },
    );
  }

  if (typeof title === "string") {
    updates.title = title;
  }

  if (typeof url === "string") {
    updates.url = url || null;
  }

  if (typeof imageUrl === "string") {
    updates.image_url = imageUrl || null;
  }

  if (typeof memo === "string") {
    updates.memo = memo || null;
  }

  if (typeof category === "string") {
    updates.category = category || null;
  }

  if (typeof price === "number" && Number.isNaN(price)) {
    return NextResponse.json(
      { error: "price must be a positive integer." },
      { status: 400 },
    );
  }

  if (price !== undefined && !Number.isNaN(price)) {
    updates.price = price;
  }

  if (typeof desireLevel === "number" && Number.isNaN(desireLevel)) {
    return NextResponse.json(
      { error: "desire_level must be an integer between 1 and 5." },
      { status: 400 },
    );
  }

  if (desireLevel !== undefined && !Number.isNaN(desireLevel)) {
    updates.desire_level = desireLevel;
  }

  if ("completed" in body) {
    if (typeof body.completed !== "boolean") {
      return NextResponse.json(
        { error: "completed must be a boolean." },
        { status: 400 },
      );
    }

    updates.completed = body.completed;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "At least one field is required." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("todos")
    .update(updates)
    .eq("id", todoId)
    .select("*")
    .single<Todo>();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;

    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(data);
}
