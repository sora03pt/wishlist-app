import Image from "next/image";
import { useId, type ChangeEvent, type DragEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

type ImageDropzoneProps = {
  disabled: boolean;
  imageUrl: string;
  isUploading: boolean;
  label: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
};

export function ImageDropzone({
  disabled,
  imageUrl,
  isUploading,
  label,
  onFileSelect,
  onRemove,
}: ImageDropzoneProps) {
  const inputId = useId();
  const instructionId = `${inputId}-instruction`;
  const labelId = `${inputId}-label`;

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelect(file);
    }

    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();

    const file = event.dataTransfer.files[0];

    if (file) {
      onFileSelect(file);
    }
  }

  return (
    <div className="sm:col-span-2">
      <span className="text-sm font-semibold text-foreground" id={labelId}>
        {label}
      </span>
      <label
        className={`mt-2 flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed px-5 py-6 text-center transition focus-within:ring-4 focus-within:ring-focus ${
          disabled
            ? "cursor-not-allowed border-border bg-surface-muted text-muted-foreground"
            : "border-border-strong bg-surface/80 text-foreground/75 hover:border-accent-emphasis hover:bg-accent"
        }`}
        htmlFor={inputId}
        onDragOver={disabled ? undefined : handleDragOver}
        onDrop={disabled ? undefined : handleDrop}
      >
        <input
          accept="image/*"
          aria-describedby={instructionId}
          aria-labelledby={labelId}
          className="sr-only"
          disabled={disabled}
          id={inputId}
          onChange={handleInputChange}
          type="file"
        />
        {imageUrl ? (
          <>
            <Image
              alt=""
              className="max-h-60 w-full rounded-[1.25rem] object-cover"
              height={1200}
              src={imageUrl}
              unoptimized
              width={1200}
            />
            <span className="text-sm font-bold" id={instructionId}>
              選択済み。タップして変更
            </span>
          </>
        ) : (
          <>
            <ImagePlus size={30} />
            <span className="text-sm font-bold" id={instructionId}>
              画像をドラッグ&ドロップ、またはタップして選択
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              PNG / JPG / WebP / GIF、20MBまで
            </span>
          </>
        )}
        {isUploading ? (
          <span
            className="inline-flex items-center gap-2 text-sm font-bold text-accent-foreground"
            role="status"
          >
            <LoadingIndicator size={16} />
            アップロード中
          </span>
        ) : null}
      </label>
      {imageUrl ? (
        <Button
          className="mt-3"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={onRemove}
          type="button"
        >
          <X size={16} />
          画像を削除
        </Button>
      ) : null}
    </div>
  );
}
