import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SelectDemoProps = {
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
};

function SelectDemo({
  defaultValue,
  disabled,
  placeholder = "カテゴリを選択",
}: SelectDemoProps) {
  return (
    <Select defaultValue={defaultValue} disabled={disabled}>
      <SelectTrigger aria-label="カテゴリ" className="w-72 max-w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="gadget">ガジェット</SelectItem>
        <SelectItem value="fashion">ファッション</SelectItem>
        <SelectItem value="cosmetics">コスメ</SelectItem>
        <SelectItem value="interior">インテリア</SelectItem>
      </SelectContent>
    </Select>
  );
}

const meta = {
  args: { disabled: false, placeholder: "カテゴリを選択" },
  component: SelectDemo,
  parameters: {
    docs: {
      description: {
        component: `## Purpose
定義済み候補から1つを選択する汎用Selectです。

## Usage
自由入力より候補の一貫性が重要な場合に使い、見えるlabelまたはaria-labelを付けます。

## Variants
placeholder、選択済み、disabledをRadix Selectの状態として提供します。

## Accessibility
Radix UIのkeyboard navigation、focus管理、ARIAを維持しています。

## Do / Don't
選択肢が少ない二択や即時切替には、より直接的なcontrolを検討します。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Design System/Components/Select",
} satisfies Meta<typeof SelectDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { defaultValue: "gadget" } };
export const Disabled: Story = {
  args: { defaultValue: "fashion", disabled: true },
};
export const LongText: Story = {
  args: { placeholder: "比較したい商品のカテゴリを選択してください" },
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
