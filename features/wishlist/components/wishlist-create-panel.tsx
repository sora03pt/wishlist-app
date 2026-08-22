import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { WishlistForm } from "@/features/wishlist/components/wishlist-form";
import type {
  UpdateWishlistForm,
  WishlistFormValues,
} from "@/features/wishlist/types";

type WishlistCreatePanelProps = {
  canSubmit: boolean;
  imagePreviewUrl: string;
  isSubmitting: boolean;
  isUploadingImage: boolean;
  onChange: UpdateWishlistForm;
  onFileSelect: (file: File) => void;
  onRemoveImage: () => void;
  onSubmit: () => Promise<void>;
  values: WishlistFormValues;
};

export function WishlistCreatePanel({
  canSubmit,
  imagePreviewUrl,
  isSubmitting,
  isUploadingImage,
  onChange,
  onFileSelect,
  onRemoveImage,
  onSubmit,
  values,
}: WishlistCreatePanelProps) {
  return (
    <Card>
      <CardContent>
        <WishlistForm
          actions={
            <Button
              className="mt-5 h-12 w-full text-base"
              disabled={!canSubmit}
              type="submit"
            >
              {isSubmitting ? (
                <LoadingIndicator size={19} />
              ) : (
                <Plus size={19} />
              )}
              {isSubmitting ? "登録中" : "追加する"}
            </Button>
          }
          disabled={isSubmitting}
          imagePreviewUrl={imagePreviewUrl}
          isUploadingImage={isUploadingImage}
          mode="create"
          onChange={onChange}
          onFileSelect={onFileSelect}
          onRemoveImage={onRemoveImage}
          onSubmit={onSubmit}
          ratingAriaLabel="欲しいレベル"
          values={values}
        />
      </CardContent>
    </Card>
  );
}
