import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WishlistSummary } from "@/features/wishlist/components/wishlist-summary";

const meta = {
  args: {
    itemCount: 8,
    priceTotals: { purchased: 52400, unpurchased: 118600 },
    purchasedCount: 3,
    unpurchasedCount: 5,
  },
  component: WishlistSummary,
  decorators: [
    (Story) => (
      <div className="w-[896px] max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Wishlistの件数と金額を要約するFeature Componentです。集計ロジックはcontrollerに置き、このコンポーネントは表示に専念します。",
      },
    },
  },
  tags: ["autodocs"],
  title: "Features/Wishlist/Wishlist Summary",
} satisfies Meta<typeof WishlistSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = {
  args: {
    itemCount: 0,
    priceTotals: { purchased: 0, unpurchased: 0 },
    purchasedCount: 0,
    unpurchasedCount: 0,
  },
};
export const MobileWidth: Story = {
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full">
        <Story />
      </div>
    ),
  ],
};
