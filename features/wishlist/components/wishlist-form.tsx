import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const fieldPrefix = `${mode}-wishlist`;
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [hasTitleError, setHasTitleError] = useState(false);
  const titleErrorId = `${fieldPrefix}-title-error`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.title.trim()) {
      setHasTitleError(true);
      titleInputRef.current?.focus();
      return;
    }

    setHasTitleError(false);
    void onSubmit();
  }

  function handleTitleChange(value: string) {
    if (hasTitleError && value.trim()) {
      setHasTitleError(false);
    }

    onChange("title", value);
  }

  return (
    <form
      aria-busy={disabled || isUploadingImage}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField className="sm:col-span-2">
          <FormLabel htmlFor={`${fieldPrefix}-title`} required>
            商品名
          </FormLabel>
          <Input
            aria-describedby={hasTitleError ? titleErrorId : undefined}
            aria-invalid={hasTitleError}
            disabled={disabled}
            id={`${fieldPrefix}-title`}
            onChange={(event) => handleTitleChange(event.target.value)}
            onInvalid={(event) => {
              event.preventDefault();
              setHasTitleError(true);
              titleInputRef.current?.focus();
            }}
            placeholder={
              isCreate ? "例: ノイズキャンセリングイヤホン" : undefined
            }
            ref={titleInputRef}
            required
            value={values.title}
          />
          {hasTitleError ? (
            <FormMessage id={titleErrorId}>
              商品名を入力してください。
            </FormMessage>
          ) : null}
        </FormField>

        <FormField>
          <FormLabel htmlFor={`${fieldPrefix}-price`}>価格</FormLabel>
          <div className={isCreate ? undefined : "relative"}>
            <Input
              className={isCreate ? undefined : "pr-11"}
              disabled={disabled}
              id={`${fieldPrefix}-price`}
              inputMode="numeric"
              min="0"
              onChange={(event) => onChange("price", event.target.value)}
              placeholder={isCreate ? "例: 19800" : undefined}
              type="number"
              step="1"
              value={values.price}
            />
            {isCreate ? null : (
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                円
              </span>
            )}
          </div>
        </FormField>

        <FormField className="sm:col-span-2">
          <FormLabel htmlFor={`${fieldPrefix}-url`}>URL</FormLabel>
          <Input
            disabled={disabled}
            id={`${fieldPrefix}-url`}
            onChange={(event) => onChange("url", event.target.value)}
            placeholder={isCreate ? "https://example.com/item" : undefined}
            type="url"
            value={values.url}
          />
        </FormField>

        <FormField>
          <FormLabel htmlFor={`${fieldPrefix}-category`}>カテゴリ</FormLabel>
          <Select
            disabled={disabled}
            onValueChange={(value) => onChange("category", value)}
            value={values.category}
          >
            <SelectTrigger
              className={isCreate ? undefined : "h-11"}
              id={`${fieldPrefix}-category`}
            >
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
        </FormField>

        <div className="sm:col-span-2">
          <StarRating
            disabled={disabled}
            label={ratingAriaLabel}
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

        <FormField
          className={isCreate ? "sm:col-span-2" : "mb-2.5 sm:col-span-2"}
        >
          <FormLabel htmlFor={`${fieldPrefix}-memo`}>メモ</FormLabel>
          <Textarea
            disabled={disabled}
            id={`${fieldPrefix}-memo`}
            onChange={(event) => onChange("memo", event.target.value)}
            placeholder={
              isCreate ? "サイズ、色、比較したいポイントなど" : undefined
            }
            value={values.memo}
          />
        </FormField>
      </div>

      {actions}
    </form>
  );
}
