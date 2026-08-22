import type { WishlistItemId } from "@/features/wishlist/types";

export function getWishlistEditButtonId(itemId: WishlistItemId) {
  return `wishlist-edit-${itemId}`;
}
