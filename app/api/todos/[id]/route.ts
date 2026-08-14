import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Todo = {
  id: string | number;
  title: string;
  completed: boolean;
  created_at: string;
};

type TodoRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

  const completed =
    typeof body === "object" &&
    body !== null &&
    "completed" in body &&
    typeof body.completed === "boolean"
      ? body.completed
      : null;

  if (completed === null) {
    return NextResponse.json(
      { error: "completed must be a boolean." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", todoId)
    .select("*")
    .single<Todo>();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;

    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(data);
}
