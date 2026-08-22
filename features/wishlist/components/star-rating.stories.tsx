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
      ariaLabel="欲しいレベル"
      disabled={disabled}
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
        component:
          "Wishlist固有の欲しい度入力です。Design System primitiveではなく、1〜5というドメインルールと星表現をまとめたFeature Componentです。",
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
export const Display: Story = { render: () => <StarRatingDisplay value={4} /> };
export const UnsetDisplay: Story = {
  render: () => <StarRatingDisplay value={null} />,
};
