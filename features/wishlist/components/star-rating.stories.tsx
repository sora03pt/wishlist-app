import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  StarRating,
  StarRatingDisplay,
} from "@/features/wishlist/components/star-rating";

function StarRatingDemo({ disabled = false, initialValue = 3 }) {
  const [value, setValue] = useState(initialValue);

  return (
    <StarRating
      disabled={disabled}
      label="欲しいレベル"
      onChange={setValue}
      value={value}
    />
  );
}

const meta = {
  args: { disabled: false, initialValue: 3 },
  argTypes: {
    initialValue: { control: { min: 1, max: 5, step: 1, type: "range" } },
  },
  component: StarRatingDemo,
  parameters: {
    docs: {
      description: {
        component: `Wishlist固有の欲しい度入力です。Design System primitiveではなく、1〜5というドメインルールと星表現をまとめたFeature Componentです。

## Accessibility
native radioとfieldset / legendを使用し、現在値・グループ名・選択肢を支援技術へ伝えます。Tabではグループへ1回だけ入り、矢印キーで値を変更できます。選択状態は色に加えて星の塗りでも表します。

## Manual check
Tabで選択中の星へ移動し、左右矢印で値が変わること、focus ringが明確なこと、スクリーンリーダーが「欲しいレベル、3つ星、選択済み」のように読み上げることを確認します。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Features/Wishlist/Star Rating",
} satisfies Meta<typeof StarRatingDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Maximum: Story = { args: { initialValue: 5 } };
export const Disabled: Story = { args: { disabled: true } };
export const KeyboardNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Tabでradio groupへ移動後、左右矢印で変更します。Tabを5回押す必要はありません。",
      },
    },
  },
};
export const Display: Story = { render: () => <StarRatingDisplay value={4} /> };
export const UnsetDisplay: Story = {
  render: () => <StarRatingDisplay value={null} />,
};
