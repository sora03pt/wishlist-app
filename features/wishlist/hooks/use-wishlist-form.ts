import { useCallback, useState } from "react";
import {
  maxSourceImageSize,
  optimizeWishlistImage,
} from "@/features/wishlist/lib/image";
import { initialWishlistForm } from "@/features/wishlist/model/wishlist-form";
import type {
  UpdateWishlistForm,
  WishlistFormValues,
} from "@/features/wishlist/types";

function revokeObjectUrl(url: string) {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function useWishlistForm() {
  const [values, setValues] = useState<WishlistFormValues>(initialWishlistForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const update: UpdateWishlistForm = useCallback((field, value) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }, []);

  const replaceImagePreview = useCallback((nextUrl: string) => {
    setImagePreviewUrl((currentUrl) => {
      revokeObjectUrl(currentUrl);
      return nextUrl;
    });
  }, []);

  const reset = useCallback(
    (
      nextValues: WishlistFormValues = initialWishlistForm,
      nextImagePreviewUrl = "",
    ) => {
      setValues(nextValues);
      setImageFile(null);
      replaceImagePreview(nextImagePreviewUrl);
    },
    [replaceImagePreview],
  );

  const clearImage = useCallback(() => {
    setImageFile(null);
    replaceImagePreview("");
    setValues((currentValues) => ({
      ...currentValues,
      imagePath: "",
      imageUrl: "",
    }));
  }, [replaceImagePreview]);

  const selectImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        throw new Error("画像ファイルを選択してください。");
      }

      if (file.size > maxSourceImageSize) {
        throw new Error("画像は20MB以下にしてください。");
      }

      const optimizedFile = await optimizeWishlistImage(file);

      setImageFile(optimizedFile);
      replaceImagePreview(URL.createObjectURL(optimizedFile));
      setValues((currentValues) => ({
        ...currentValues,
        imagePath: "",
        imageUrl: "",
      }));
    },
    [replaceImagePreview],
  );

  return {
    clearImage,
    imageFile,
    imagePreviewUrl,
    reset,
    selectImage,
    update,
    values,
  };
}
