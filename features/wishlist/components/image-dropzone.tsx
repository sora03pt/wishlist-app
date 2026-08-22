import Image from "next/image";
import type { ChangeEvent, DragEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <span className="text-sm font-semibold text-zinc-800">{label}</span>
      <label
        className={`mt-2 flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed px-5 py-6 text-center transition ${
          disabled
            ? "cursor-not-allowed border-pink-100 bg-zinc-50 text-zinc-400"
            : "border-pink-200 bg-white/80 text-zinc-600 hover:border-pink-300 hover:bg-pink-50/60"
        }`}
        onDragOver={disabled ? undefined : handleDragOver}
        onDrop={disabled ? undefined : handleDrop}
      >
        <input
          accept="image/*"
          className="sr-only"
          disabled={disabled}
          onChange={handleInputChange}
          type="file"
        />
        {imageUrl ? (
          <Image
            alt=""
            className="max-h-60 w-full rounded-[1.25rem] object-cover"
            height={1200}
            src={imageUrl}
            unoptimized
            width={1200}
          />
        ) : (
          <>
            <ImagePlus size={30} />
            <span className="text-sm font-bold">
              画像をドラッグ&ドロップ、またはタップして選択
            </span>
            <span className="text-xs font-medium text-zinc-500">
              PNG / JPG / WebP / GIF、20MBまで
            </span>
          </>
        )}
        {isUploading ? (
          <span className="inline-flex items-center gap-2 text-sm font-bold text-pink-700">
            <Loader2 className="animate-spin" size={16} />
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
