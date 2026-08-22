"use client";

import { useEffect, useRef } from "react";
import { WishlistCreatePanel } from "@/features/wishlist/components/wishlist-create-panel";
import { WishlistEditDialog } from "@/features/wishlist/components/wishlist-edit-dialog";
import { WishlistList } from "@/features/wishlist/components/wishlist-list";
import { WishlistStatus } from "@/features/wishlist/components/wishlist-list-state";
import { WishlistSummary } from "@/features/wishlist/components/wishlist-summary";
import { useWishlistController } from "@/features/wishlist/hooks/use-wishlist-controller";
import { getWishlistEditButtonId } from "@/features/wishlist/lib/dom-ids";
import type { WishlistItemId } from "@/features/wishlist/types";

export function WishlistPage() {
  const wishlist = useWishlistController();
  const editingItemId = wishlist.editingItem?.id ?? null;
  const lastEditingItemId = useRef<WishlistItemId | null>(null);

  useEffect(() => {
    if (editingItemId !== null) {
      lastEditingItemId.current = editingItemId;
      return;
    }

    const returnFocusItemId = lastEditingItemId.current;

    if (returnFocusItemId === null) {
      return;
    }

    lastEditingItemId.current = null;
    requestAnimationFrame(() => {
      document
        .getElementById(getWishlistEditButtonId(returnFocusItemId))
        ?.focus();
    });
  }, [editingItemId]);

  return (
    <main className="app-canvas min-h-screen text-foreground">
      <WishlistStatus message={wishlist.statusMessage} />
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
          onRefresh={async () => {
            await wishlist.refreshItems();
          }}
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
