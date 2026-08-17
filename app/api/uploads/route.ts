import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  return file.type.split("/").at(1) || "png";
}

async function ensureStorageBucket() {
  const supabase = createSupabaseServerClient();
  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    return { error: listError.message, supabase };
  }

  if (!buckets?.some((bucket) => bucket.name === bucketName)) {
    const { error: createError } = await supabase.storage.createBucket(
      bucketName,
      {
        allowedMimeTypes: Array.from(allowedImageTypes),
        fileSizeLimit: maxImageSize,
        public: true,
      },
    );

    if (createError) {
      return { error: createError.message, supabase };
    }
  }

  return { error: null, supabase };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required." }, { status: 400 });
  }

  if (!allowedImageTypes.has(file.type)) {
    return NextResponse.json(
      { error: "Only gif, jpeg, png, and webp images are supported." },
      { status: 400 },
    );
  }

  if (file.size > maxImageSize) {
    return NextResponse.json(
      { error: "Image must be 5MB or smaller." },
      { status: 400 },
    );
  }

  const { error: bucketError, supabase } = await ensureStorageBucket();

  if (bucketError) {
    return NextResponse.json({ error: bucketError }, { status: 500 });
  }

  const filePath = `${crypto.randomUUID()}.${getImageExtension(file)}`;
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

  return NextResponse.json({ image_url: data.publicUrl }, { status: 201 });
}
