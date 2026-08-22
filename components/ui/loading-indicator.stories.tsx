import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

const meta = {
  args: { label: "読み込み中", size: 20 },
  argTypes: { size: { control: { min: 12, max: 40, step: 2, type: "range" } } },
  component: LoadingIndicator,
  parameters: {
    docs: {
      description: {
        component: `## Purpose
通信や処理の進行中を一貫したspinnerで示します。

## Usage
単独表示ではlabelを渡し、可視テキストと併用するときは装飾として使います。

## Variants
sizeとclassNameで文脈に合わせます。

## Accessibility
labelがある場合のみrole=statusを持ち、アイコン自体はaria-hiddenです。

## Do / Don't
処理が即時に終わる操作へ常時表示せず、画面全体を不必要にブロックしません。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Design System/Components/Loading Indicator",
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithVisibleLabel: Story = {
  render: (args) => (
    <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
      <LoadingIndicator {...args} label={undefined} />
      読み込み中
    </div>
  ),
};
