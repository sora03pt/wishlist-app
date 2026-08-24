import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WishlistCard } from "@/features/wishlist/components/wishlist-card";
import type { WishlistItem } from "@/features/wishlist/types";

const defaultItem = {
  category: "ガジェット",
  completed: false,
  created_at: "2026-08-22T10:30:00.000Z",
  desire_level: 4,
  id: "story-item",
  image_path: null,
  image_url: "/window.svg",
  memo: "色と装着感を店頭で確認してから購入する。",
  price: 39800,
  title: "ノイズキャンセリングイヤホン",
  url: "https://example.com/products/headphones",
} satisfies WishlistItem;

const meta = {
  args: {
    deletingId: null,
    item: defaultItem,
    itemActionDisabled: false,
    onDelete: () => undefined,
    onStartEdit: () => undefined,
    onTogglePurchased: () => undefined,
    updatingId: null,
  },
  component: WishlistCard,
  decorators: [
    (Story) => (
      <div className="w-[800px] max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "商品情報、欲しい度、購入状態、編集・削除操作をまとめるWishlist Feature Componentです。CardやButtonはDesign Systemから利用し、商品フィールドと状態判断はFeature側に残します。商品画像は商品を識別する情報として商品名をaltにし、商品URLのアクセシブルネームには画面に見えるURLを含めます。",
      },
    },
  },
  tags: ["autodocs"],
  title: "Features/Wishlist/Wishlist Card",
} satisfies Meta<typeof WishlistCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Purchased: Story = {
  args: { item: { ...defaultItem, completed: true } },
};

export const WithoutOptionalFields: Story = {
  args: {
    item: {
      ...defaultItem,
      category: null,
      desire_level: null,
      image_url: null,
      memo: null,
      price: null,
      url: null,
    },
  },
};

export const Updating: Story = { args: { updatingId: defaultItem.id } };
export const Deleting: Story = { args: { deletingId: defaultItem.id } };

export const LongText: Story = {
  args: {
    item: {
      ...defaultItem,
      memo: "複数のショップで価格を比較し、保証期間、付属品、返品条件も確認する。現在使っているイヤホンとの音質差を試聴してから最終判断する。",
      title:
        "限定カラーの高性能ノイズキャンセリング機能付き完全ワイヤレスイヤホン",
      url: "https://example.com/products/a-very-long-product-url-for-responsive-layout-check",
    },
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
