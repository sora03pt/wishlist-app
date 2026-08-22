import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/ui/badge";

const meta = {
  args: { children: "未購入", variant: "pink" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "lavender",
        "outline",
        "pink",
        "success",
        "warning",
      ],
    },
  },
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: `## Purpose
短い状態や分類を補助的に示します。

## Usage
文章ではなく、一覧を走査するときに役立つ短いラベルへ使います。

## Variants
brand系、outline、success、warningを提供します。

## Accessibility
色だけに依存せず、状態名を必ずテキストで表示します。

## Do / Don't
操作には使わず、長文や重要なエラー通知には使いません。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Design System/Components/Badge",
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge>Default</Badge>
      <Badge variant="lavender">Lavender</Badge>
      <Badge variant="pink">Pink</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">購入済み</Badge>
      <Badge variant="warning">未購入</Badge>
    </div>
  ),
};

export const LongText: Story = {
  args: { children: "あとで比較してから購入を検討する" },
};
