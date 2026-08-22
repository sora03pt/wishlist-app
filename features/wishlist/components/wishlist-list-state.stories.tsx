import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  WishlistEmptyState,
  WishlistError,
  WishlistLoadingState,
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
        component:
          "Wishlist一覧の非同期状態です。汎用Feedback primitiveへ早期に抽象化せず、このFeatureの文言と密度を保持しています。",
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
