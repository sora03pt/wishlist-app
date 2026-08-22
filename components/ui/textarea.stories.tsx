import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FormField, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const meta = {
  args: {
    disabled: false,
    placeholder: "サイズ、色、比較したいポイントなど",
  },
  component: Textarea,
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `## Purpose
メモなど複数行の入力に使うTextareaです。

## Usage
FormLabelと組み合わせ、内容に応じて利用者が縦方向へresizeできます。

## Variants
disabledとaria-invalidをInputと同じTokenで表現します。

## Accessibility
明示的なlabelを付け、エラーはaria-describedbyで接続します。

## Do / Don't
短い単一値にはInputを使い、固定高さで長文を隠しません。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Design System/Components/Textarea",
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithLabel: Story = {
  render: (args) => (
    <FormField>
      <FormLabel htmlFor="story-memo">メモ</FormLabel>
      <Textarea {...args} id="story-memo" />
    </FormField>
  ),
};
export const Disabled: Story = {
  args: { defaultValue: "保存済みのメモ", disabled: true },
};
export const LongText: Story = {
  args: {
    defaultValue:
      "購入前にサイズと色を店舗で確認する。現在使っている商品との違いを比較して、必要であればセール時期まで待つ。",
  },
};
