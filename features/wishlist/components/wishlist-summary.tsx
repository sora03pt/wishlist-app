import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/features/wishlist/lib/formatters";

type WishlistSummaryProps = {
  itemCount: number;
  priceTotals: {
    purchased: number;
    unpurchased: number;
  };
  purchasedCount: number;
  unpurchasedCount: number;
};

export function WishlistSummary({
  itemCount,
  priceTotals,
  purchasedCount,
  unpurchasedCount,
}: WishlistSummaryProps) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-bold uppercase text-accent-emphasis">
          Wishlist
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="relative inline-block pb-2 text-3xl font-bold leading-tight sm:text-4xl">
              <span className="relative z-10 text-foreground/80">
                欲しいものリスト
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-1 left-0 h-3 w-full rounded-full bg-gradient-to-r from-accent-border via-accent-strong to-selected-border opacity-80"
              />
            </h1>
            <p className="mt-2 text-sm font-medium leading-6 text-foreground/70 sm:text-base">
              気になるものをまとめて管理
            </p>
          </div>
          <div className="grid w-full grid-cols-3 overflow-hidden rounded-md border border-border-strong bg-surface-muted text-center text-xs font-bold text-foreground/80 sm:w-auto">
            <div className="px-3 py-2">
              <span className="block text-base text-foreground">{itemCount}</span>
              全件
            </div>
            <div className="border-x border-border-strong px-3 py-2">
              <span className="block text-base text-amber-700">
                {unpurchasedCount}
              </span>
              未購入
            </div>
            <div className="px-3 py-2">
              <span className="block text-base text-accent-foreground">
                {purchasedCount}
              </span>
              購入済み
            </div>
          </div>
        </div>
        <dl className="mt-4 grid gap-3 border-t border-border-strong pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold text-muted-foreground">
              未購入の合計金額
            </dt>
            <dd className="mt-1 text-xl font-bold text-amber-700">
              {formatPrice(priceTotals.unpurchased)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-muted-foreground">
              購入済みの合計金額
            </dt>
            <dd className="mt-1 text-xl font-bold text-accent-foreground">
              {formatPrice(priceTotals.purchased)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
