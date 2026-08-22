import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WishlistForm } from "@/features/wishlist/components/wishlist-form";
import type {
  UpdateWishlistForm,
  WishlistFormValues,
} from "@/features/wishlist/types";

type WishlistEditDialogProps = {
  imagePreviewUrl: string;
  isOpen: boolean;
  isSaving: boolean;
  isUploadingImage: boolean;
  itemTitle: string;
  onCancel: () => void;
  onChange: UpdateWishlistForm;
  onFileSelect: (file: File) => void;
  onRemoveImage: () => void;
  onSubmit: () => Promise<void>;
  values: WishlistFormValues;
};

export function WishlistEditDialog({
  imagePreviewUrl,
  isOpen,
  isSaving,
  isUploadingImage,
  itemTitle,
  onCancel,
  onChange,
  onFileSelect,
  onRemoveImage,
  onSubmit,
  values,
}: WishlistEditDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
    >
      <DialogContent>
        <DialogHeader className="pr-14">
          <DialogTitle>欲しいものを編集</DialogTitle>
        </DialogHeader>
        <WishlistForm
          actions={
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="h-11 bg-zinc-950 hover:bg-zinc-800"
                disabled={
                  isSaving || isUploadingImage || !values.title.trim()
                }
                type="submit"
              >
                {isSaving || isUploadingImage ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <Save size={17} />
                )}
                {isSaving || isUploadingImage ? "保存中" : "保存"}
              </Button>
              <Button
                className="h-11"
                variant="outline"
                disabled={isSaving || isUploadingImage}
                onClick={onCancel}
                type="button"
              >
                <X size={17} />
                キャンセル
              </Button>
            </div>
          }
          disabled={isSaving}
          imagePreviewUrl={imagePreviewUrl}
          isUploadingImage={isUploadingImage}
          mode="edit"
          onChange={onChange}
          onFileSelect={onFileSelect}
          onRemoveImage={onRemoveImage}
          onSubmit={onSubmit}
          ratingAriaLabel={`${itemTitle}の欲しいレベル`}
          values={values}
        />
      </DialogContent>
    </Dialog>
  );
}
