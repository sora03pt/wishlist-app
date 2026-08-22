import type { FormEvent, ReactNode } from "react";
import { ImageDropzone } from "@/features/wishlist/components/image-dropzone";
import { StarRating } from "@/features/wishlist/components/star-rating";
import { getWishlistCategoryOptions } from "@/features/wishlist/model/wishlist-form";
import type {
  UpdateWishlistForm,
  WishlistFormValues,
} from "@/features/wishlist/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WishlistFormProps = {
  actions: ReactNode;
  disabled: boolean;
  imagePreviewUrl: string;
  isUploadingImage: boolean;
  mode: "create" | "edit";
  onChange: UpdateWishlistForm;
  onFileSelect: (file: File) => void;
  onRemoveImage: () => void;
  onSubmit: () => void | Promise<void>;
  ratingAriaLabel: string;
  values: WishlistFormValues;
};

export function WishlistForm({
  actions,
  disabled,
  imagePreviewUrl,
  isUploadingImage,
  mode,
  onChange,
  onFileSelect,
  onRemoveImage,
  onSubmit,
  ratingAriaLabel,
  values,
}: WishlistFormProps) {
  const isCreate = mode === "create";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-zinc-800">商品名</span>
          <input
            className="mt-2 h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
            disabled={disabled}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder={
              isCreate ? "例: ノイズキャンセリングイヤホン" : undefined
            }
            value={values.title}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-zinc-800">価格</span>
          <div className={isCreate ? undefined : "relative mt-2"}>
            <input
              className={
                isCreate
                  ? "mt-2 h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                  : "h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 pr-11 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
              }
              disabled={disabled}
              inputMode="numeric"
              min="0"
              onChange={(event) => onChange("price", event.target.value)}
              placeholder={isCreate ? "例: 19800" : undefined}
              type="number"
              value={values.price}
            />
            {isCreate ? null : (
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                円
              </span>
            )}
          </div>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-zinc-800">URL</span>
          <input
            className="mt-2 h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
            disabled={disabled}
            onChange={(event) => onChange("url", event.target.value)}
            placeholder={isCreate ? "https://example.com/item" : undefined}
            type="url"
            value={values.url}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-zinc-800">
            カテゴリ
          </span>
          <Select
            disabled={disabled}
            onValueChange={(value) => onChange("category", value)}
            value={values.category || undefined}
          >
            <SelectTrigger className={isCreate ? "mt-2" : "mt-2 h-11"}>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {getWishlistCategoryOptions(values.category).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <div className="sm:col-span-2">
          <span className="text-sm font-semibold text-zinc-800">
            欲しいレベル
          </span>
          <StarRating
            ariaLabel={ratingAriaLabel}
            disabled={disabled}
            onChange={(value) => onChange("desireLevel", value)}
            value={values.desireLevel ?? 3}
          />
        </div>

        <ImageDropzone
          disabled={disabled || isUploadingImage}
          imageUrl={imagePreviewUrl || values.imageUrl}
          isUploading={isUploadingImage}
          label="画像"
          onFileSelect={onFileSelect}
          onRemove={onRemoveImage}
        />

        <label className={isCreate ? "block sm:col-span-2" : "mb-2.5 block sm:col-span-2"}>
          <span className="text-sm font-semibold text-zinc-800">メモ</span>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-pink-100 bg-white px-4 py-3 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
            disabled={disabled}
            onChange={(event) => onChange("memo", event.target.value)}
            placeholder={
              isCreate ? "サイズ、色、比較したいポイントなど" : undefined
            }
            value={values.memo}
          />
        </label>
      </div>

      {actions}
    </form>
  );
}
