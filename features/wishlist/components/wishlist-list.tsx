import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WishlistCard } from "@/features/wishlist/components/wishlist-card";
import {
  WishlistEmptyState,
  WishlistError,
  WishlistLoadingState,
} from "@/features/wishlist/components/wishlist-list-state";
import type {
  WishlistItem,
  WishlistItemId,
} from "@/features/wishlist/types";

type WishlistListProps = {
  deletingId: WishlistItemId | null;
  editingId: WishlistItemId | null;
  errorMessage: string;
  hasActiveEdit: boolean;
  hasItemMutation: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isSubmitting: boolean;
  items: WishlistItem[];
  onDelete: (itemId: WishlistItemId) => void;
  onRefresh: () => Promise<void>;
  onStartEdit: (item: WishlistItem) => void;
  onTogglePurchased: (item: WishlistItem) => void;
  updatingId: WishlistItemId | null;
};

export function WishlistList({
  deletingId,
  editingId,
  errorMessage,
  hasActiveEdit,
  hasItemMutation,
  isInitialLoading,
  isRefreshing,
  isSubmitting,
  items,
  onDelete,
  onRefresh,
  onStartEdit,
  onTogglePurchased,
  updatingId,
}: WishlistListProps) {
  return (
    <Card
      aria-busy={isInitialLoading || isRefreshing}
      aria-labelledby="wishlist-list-title"
    >
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle asChild>
              <h2 id="wishlist-list-title">欲しいもの一覧</h2>
            </CardTitle>
            {isRefreshing ? (
              <span className="text-xs font-bold text-muted-foreground">
                再取得中
              </span>
            ) : null}
          </div>
          <Button
            aria-label="欲しいものを再取得"
            size="icon"
            variant="outline"
            disabled={
              isInitialLoading ||
              isRefreshing ||
              isSubmitting ||
              hasItemMutation ||
              hasActiveEdit
            }
            onClick={() => void onRefresh()}
            title={isRefreshing ? "再取得中" : "再取得"}
            type="button"
          >
            <RefreshCw
              className={
                isInitialLoading || isRefreshing ? "animate-spin" : undefined
              }
              size={18}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <WishlistError message={errorMessage} />

        {isInitialLoading ? (
          <div className="mt-4">
            <WishlistLoadingState />
          </div>
        ) : items.length > 0 ? (
          <ul className="mt-4 grid gap-3">
            {items.map((item) =>
              editingId === item.id ? null : (
                <li key={item.id}>
                  <WishlistCard
                    deletingId={deletingId}
                    item={item}
                    itemActionDisabled={
                      hasItemMutation ||
                      (editingId !== null && editingId !== item.id)
                    }
                    onDelete={onDelete}
                    onStartEdit={onStartEdit}
                    onTogglePurchased={onTogglePurchased}
                    updatingId={updatingId}
                  />
                </li>
              ),
            )}
          </ul>
        ) : (
          <div className="mt-4">
            <WishlistEmptyState />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
