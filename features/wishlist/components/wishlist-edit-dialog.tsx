import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
          <DialogDescription className="sr-only">
            {itemTitle}の商品情報を編集します。
          </DialogDescription>
        </DialogHeader>
        <WishlistForm
          actions={
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="h-11"
                disabled={
                  isSaving || isUploadingImage || !values.title.trim()
                }
                type="submit"
              >
                {isSaving || isUploadingImage ? (
                  <LoadingIndicator size={17} />
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
