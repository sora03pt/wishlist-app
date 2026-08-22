import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  WishlistEmptyState,
  WishlistError,
  WishlistLoadingState,
  WishlistStatus,
} from "@/features/wishlist/components/wishlist-list-state";

function WishlistStates() {
  return <WishlistEmptyState />;
}

const meta = {
  component: WishlistStates,
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `Wishlist一覧の非同期状態です。汎用Feedback primitiveへ早期に抽象化せず、このFeatureの文言と密度を保持しています。

## Accessibility
処理待ち・空結果・成功は中断しないrole=status、操作失敗は即時に伝えるrole=alertを使用します。個別ボタン内のspinnerは装飾として隠し、画面全体のlive regionへ同じ文言を重複させません。

## Manual check
スクリーンリーダーで処理開始と完了が一度ずつ通知され、errorだけが割り込み通知になることを確認します。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Features/Wishlist/States",
} satisfies Meta<typeof WishlistStates>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Loading: Story = { render: () => <WishlistLoadingState /> };
export const Error: Story = {
  render: () => (
    <WishlistError message="欲しいものリストの取得に失敗しました。" />
  ),
};
export const AsyncSuccess: Story = {
  render: () => (
    <div>
      <p aria-hidden="true" className="text-sm text-muted-foreground">
        支援技術への通知: 欲しいものを追加しました。
      </p>
      <WishlistStatus message="欲しいものを追加しました。" />
    </div>
  ),
};
