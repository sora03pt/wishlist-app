import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Todo = {
  id: string | number;
  title: string;
  price: number | null;
  url: string | null;
  memo: string | null;
  category: string | null;
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
  const url = readStringField(body, "url");
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

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("todos")
    .insert({
      category: category || null,
      completed: false,
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
