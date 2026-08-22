"use client";

import { WishlistCreatePanel } from "@/features/wishlist/components/wishlist-create-panel";
import { WishlistEditDialog } from "@/features/wishlist/components/wishlist-edit-dialog";
import { WishlistList } from "@/features/wishlist/components/wishlist-list";
import { WishlistSummary } from "@/features/wishlist/components/wishlist-summary";
import { useWishlistController } from "@/features/wishlist/hooks/use-wishlist-controller";

export function WishlistPage() {
  const wishlist = useWishlistController();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff1f7,transparent_34%),linear-gradient(135deg,#fffafb_0%,#fbf7ff_48%,#ffffff_100%)] text-zinc-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
        <WishlistSummary
          itemCount={wishlist.items.length}
          priceTotals={wishlist.priceTotals}
          purchasedCount={wishlist.purchasedCount}
          unpurchasedCount={wishlist.unpurchasedCount}
        />

        <WishlistCreatePanel
          canSubmit={wishlist.canSubmit}
          imagePreviewUrl={wishlist.createForm.imagePreviewUrl}
          isSubmitting={wishlist.isSubmitting}
          isUploadingImage={wishlist.uploadingImageId === "new"}
          onChange={wishlist.createForm.update}
          onFileSelect={wishlist.selectCreateImage}
          onRemoveImage={wishlist.createForm.clearImage}
          onSubmit={wishlist.submitCreate}
          values={wishlist.createForm.values}
        />

        <WishlistList
          deletingId={wishlist.deletingId}
          editingId={wishlist.editingId}
          errorMessage={wishlist.errorMessage}
          hasActiveEdit={wishlist.hasActiveEdit}
          hasItemMutation={wishlist.hasItemMutation}
          isInitialLoading={wishlist.isInitialLoading}
          isRefreshing={wishlist.isRefreshing}
          isSubmitting={wishlist.isSubmitting}
          items={wishlist.items}
          onDelete={wishlist.removeItem}
          onRefresh={wishlist.refreshItems}
          onStartEdit={wishlist.startEdit}
          onTogglePurchased={wishlist.togglePurchased}
          updatingId={wishlist.updatingId}
        />
      </div>

      {wishlist.editingItem ? (
        <WishlistEditDialog
          imagePreviewUrl={wishlist.editForm.imagePreviewUrl}
          isOpen
          isSaving={wishlist.savingEditId === wishlist.editingItem.id}
          isUploadingImage={
            wishlist.uploadingImageId === wishlist.editingItem.id
          }
          itemTitle={wishlist.editingItem.title}
          onCancel={wishlist.cancelEdit}
          onChange={wishlist.editForm.update}
          onFileSelect={wishlist.selectEditImage}
          onRemoveImage={wishlist.editForm.clearImage}
          onSubmit={wishlist.saveEdit}
          values={wishlist.editForm.values}
        />
      ) : null}
    </main>
  );
}
