import Image from "next/image";
import {
  Check,
  ExternalLink,
  Link as LinkIcon,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { StarRatingDisplay } from "@/features/wishlist/components/star-rating";
import { getWishlistEditButtonId } from "@/features/wishlist/lib/dom-ids";
import {
  formatCreatedAt,
  formatPrice,
} from "@/features/wishlist/lib/formatters";
import type {
  WishlistItem,
  WishlistItemId,
} from "@/features/wishlist/types";

type WishlistCardProps = {
  deletingId: WishlistItemId | null;
  item: WishlistItem;
  itemActionDisabled: boolean;
  onDelete: (itemId: WishlistItemId) => void;
  onStartEdit: (item: WishlistItem) => void;
  onTogglePurchased: (item: WishlistItem) => void;
  updatingId: WishlistItemId | null;
};

export function WishlistCard({
  deletingId,
  item,
  itemActionDisabled,
  onDelete,
  onStartEdit,
  onTogglePurchased,
  updatingId,
}: WishlistCardProps) {
  const isDeleting = deletingId === item.id;
  const isUpdating = updatingId === item.id;
  const isBusy = itemActionDisabled || isDeleting || isUpdating;

  return (
    <Card
      className={
        item.completed
          ? "border-selected-border bg-selected shadow-selected transition-colors"
          : "bg-surface/80 shadow-card transition-colors"
      }
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 w-full flex-1">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              {formatCreatedAt(item.created_at)}
            </p>

            <div className="flex items-start gap-4">
              {item.image_url ? (
                <Image
                  alt={item.title}
                  className="size-24 shrink-0 rounded-[1.5rem] object-cover sm:size-28"
                  height={112}
                  src={item.image_url}
                  unoptimized
                  width={112}
                />
              ) : null}

              <div className="min-w-0 pt-1">
                <h3 className="break-words text-base font-bold leading-7 text-foreground">
                  {item.title}
                </h3>
              </div>
            </div>

            <dl className="mt-3 grid w-full gap-2 text-sm text-foreground/80">
              <div className="flex items-start gap-2">
                <dt className="w-20 shrink-0 font-bold text-muted-foreground">価格</dt>
                <dd className="min-w-0 font-semibold text-foreground">
                  {formatPrice(item.price)}
                </dd>
              </div>

              <div className="flex items-start gap-2">
                <dt className="w-20 shrink-0 font-bold text-muted-foreground">
                  カテゴリ
                </dt>
                <dd className="min-w-0 break-words">
                  {item.category || "未設定"}
                </dd>
              </div>

              <div className="flex items-start gap-2">
                <dt className="w-20 shrink-0 font-bold text-muted-foreground">
                  欲しい度
                </dt>
                <dd className="min-w-0">
                  <StarRatingDisplay value={item.desire_level} />
                </dd>
              </div>

              {item.url ? (
                <div className="flex items-start gap-2">
                  <dt className="w-20 shrink-0 font-bold text-muted-foreground">
                    商品URL
                  </dt>
                  <dd className="min-w-0">
                    <a
                      aria-label={`${item.title}の商品ページを新しいタブで開く`}
                      className="inline-flex max-w-full items-center gap-1 break-all font-semibold text-accent-foreground underline-offset-4 hover:underline"
                      href={item.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <LinkIcon aria-hidden="true" className="shrink-0" size={15} />
                      {item.url}
                      <ExternalLink aria-hidden="true" className="shrink-0" size={14} />
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:flex sm:shrink-0 sm:items-center">
            <Button
              className={
                item.completed
                  ? "border-selected-border bg-surface text-selected-foreground hover:bg-selected-subtle"
                  : undefined
              }
              variant={item.completed ? "outline" : "soft"}
              disabled={isBusy}
              onClick={() => onTogglePurchased(item)}
              type="button"
            >
              {isUpdating ? (
                <LoadingIndicator size={17} />
              ) : (
                <Check size={17} />
              )}
              {item.completed ? "未購入に戻す" : "購入済みにする"}
            </Button>
            <Button
              id={getWishlistEditButtonId(item.id)}
              variant="outline"
              disabled={isBusy}
              onClick={() => onStartEdit(item)}
              type="button"
            >
              <Pencil size={17} />
              編集
            </Button>
            <Button
              aria-label={`${item.title}を削除`}
              size="icon"
              variant="destructive"
              disabled={isBusy}
              onClick={() => onDelete(item.id)}
              title="削除"
              type="button"
            >
              {isDeleting ? (
                <LoadingIndicator size={17} />
              ) : (
                <Trash2 size={17} />
              )}
            </Button>
          </div>
        </div>
        {item.memo ? (
          <div className="mt-4 grid w-full gap-1">
            <p className="text-sm font-bold text-muted-foreground">メモ</p>
            <div className="min-w-0 whitespace-pre-wrap break-words rounded-control border border-border bg-surface/80 px-4 py-3 text-sm leading-6 text-foreground/80 shadow-inset">
              {item.memo}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
