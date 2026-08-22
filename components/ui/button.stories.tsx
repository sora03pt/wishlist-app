import { ArrowRight } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

const meta = {
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm", "icon"],
    },
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "ghost",
        "outline",
        "secondary",
        "soft",
      ],
    },
  },
  args: {
    children: "追加する",
    size: "default",
    variant: "default",
  },
  component: Button,
  parameters: {
    docs: {
      description: {
        component: `## Purpose
明確なユーザー操作を実行する汎用Buttonです。

## Usage
画面内の主要操作はdefault、補助操作はoutlineまたはghostを使います。

## Variants
default / destructive / ghost / outline / secondary / soft と3サイズを提供します。

## Accessibility
native buttonを維持し、focus-visible ringとdisabled状態を共通化しています。Icon-onlyではaria-labelが必要です。

## Do / Don't
1画面に主要なdefault actionを増やしすぎず、リンク遷移だけの用途にはButtonを使いません。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Design System/Components/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-wrap gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">削除</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button aria-label="次へ" size="icon">
        <ArrowRight size={18} />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: {
    children: (
      <>
        <LoadingIndicator size={18} />
        保存中
      </>
    ),
    disabled: true,
  },
};

export const LongText: Story = {
  args: {
    children: "選択した欲しいものを購入済みの状態に変更する",
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};
