import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const bucketName = "wishlist-images";

type Todo = {
  id: string | number;
  title: string;
  price: number | null;
  url: string | null;
  image_url: string | null;
  image_path: string | null;
  memo: string | null;
  category: string | null;
  desire_level: number | null;
  completed: boolean;
  created_at: string;
};

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

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = readStringField(body, "title");
  const price = readOptionalPrice(body);
  const desireLevel = readOptionalDesireLevel(body);
  const url = readStringField(body, "url");
  const imageUrl = readStringField(body, "image_url");
  const imagePath = readStringField(body, "image_path");
  const memo = readStringField(body, "memo");
  const category = readStringField(body, "category");

  if (!title) {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  if (price === undefined) {
    return NextResponse.json(
      { error: "price must be a positive integer." },
      { status: 400 },
    );
  }

  if (desireLevel === undefined) {
    return NextResponse.json(
      { error: "desire_level must be an integer between 1 and 5." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("todos")
    .insert({
      category: category || null,
      completed: false,
      desire_level: desireLevel,
      image_path: imagePath || null,
      image_url: imageUrl || null,
      memo: memo || null,
      price,
      title,
      url: url || null,
    })
    .select("*")
    .single<Todo>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: existingTodo, error: findError } = await supabase
    .from("todos")
    .select("*")
    .eq("id", id)
    .single<Todo>();

  if (findError) {
    const status = findError.code === "PGRST116" ? 404 : 500;

    return NextResponse.json({ error: findError.message }, { status });
  }

  if (existingTodo.image_path) {
    const { error: storageError } = await supabase.storage
      .from(bucketName)
      .remove([existingTodo.image_path]);

    if (storageError) {
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 },
      );
    }
  }

  const { data, error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .select("*")
    .single<Todo>();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;

    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(data);
}
