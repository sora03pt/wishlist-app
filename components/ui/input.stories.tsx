import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const meta = {
  args: {
    disabled: false,
    placeholder: "例: ノイズキャンセリングイヤホン",
  },
  component: Input,
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `## Purpose
単一行の文字・数値入力に使う汎用Inputです。

## Usage
FormLabelと明示的なidで関連付け、補足やエラーはaria-describedbyで接続します。

## Variants
native inputのtypeを利用し、disabledとaria-invalidの見た目を共通化します。

## Accessibility
placeholderをlabelの代わりにせず、エラー時はaria-invalidを設定します。

## Do / Don't
複数行の入力にはTextareaを使い、入力形式を見た目だけで伝えません。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Design System/Components/Input",
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: (args) => (
    <FormField>
      <FormLabel htmlFor="story-product-name">商品名</FormLabel>
      <Input {...args} id="story-product-name" />
      <FormDescription id="story-product-name-description">
        欲しいものを識別できる名前を入力します。
      </FormDescription>
    </FormField>
  ),
};

export const Disabled: Story = {
  args: { defaultValue: "編集できない値", disabled: true },
};

export const Error: Story = {
  render: (args) => (
    <FormField>
      <FormLabel htmlFor="story-price">価格</FormLabel>
      <Input
        {...args}
        aria-describedby="story-price-error"
        aria-invalid="true"
        id="story-price"
        defaultValue="-100"
      />
      <FormMessage id="story-price-error">
        価格は0以上で入力してください。
      </FormMessage>
    </FormField>
  ),
};

export const Focus: Story = {
  args: { autoFocus: true },
};

export const LongText: Story = {
  args: {
    defaultValue:
      "限定カラーのノイズキャンセリング機能付きワイヤレスヘッドフォン",
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
