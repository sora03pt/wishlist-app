import { isLocalMockMode } from "@/lib/mock/auth";
import { readJsonResponse } from "@/features/wishlist/api/http";
import { readMockImage } from "@/features/wishlist/api/wishlist-mock";

type UploadedWishlistImage = {
  imagePath: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function uploadWishlistImage(
  file: File,
): Promise<UploadedWishlistImage> {
  if (isLocalMockMode) {
    return { imagePath: await readMockImage(file) };
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads", {
    body: formData,
    method: "POST",
  });
  const result = await readJsonResponse(
    response,
    "画像のアップロードに失敗しました。",
  );

  if (isRecord(result) && typeof result.image_path === "string") {
    return { imagePath: result.image_path };
  }

  throw new Error("画像のアップロードに失敗しました。");
}
