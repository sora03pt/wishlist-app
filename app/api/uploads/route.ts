import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const bucketName = "wishlist-images";
const maxImageSize = 5 * 1024 * 1024;
const allowedImageTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getImageExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension;
  }

  return file.type.split("/").at(1) || "webp";
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();

  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "画像を選択してください。" }, { status: 400 });
  }

  if (!allowedImageTypes.has(file.type)) {
    return NextResponse.json(
      { error: "画像はPNG、JPG、WebP、GIF形式を選択してください。" },
      { status: 400 },
    );
  }

  if (file.size > maxImageSize) {
    return NextResponse.json(
      { error: "画像は5MB以下にしてください。" },
      { status: 400 },
    );
  }

  const filePath = `${auth.user.id}/${crypto.randomUUID()}.${getImageExtension(file)}`;
  const { error } = await auth.supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json(
      { error: "画像を保存できませんでした。Storage設定を確認してください。" },
      { status: 500 },
    );
  }

  return NextResponse.json({ image_path: filePath }, { status: 201 });
}
