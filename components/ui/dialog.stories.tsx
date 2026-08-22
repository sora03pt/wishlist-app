import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DialogDemoProps = {
  content: string;
  title: string;
  triggerLabel: string;
};

function DialogDemo({ content, title, triggerLabel }: DialogDemoProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{content}</DialogDescription>
        </DialogHeader>
        <Button className="justify-self-start">内容を保存</Button>
      </DialogContent>
    </Dialog>
  );
}

const meta = {
  args: {
    content: "現在のページを離れずに、関連する内容を確認・編集できます。",
    title: "欲しいものを編集",
    triggerLabel: "Dialogを開く",
  },
  component: DialogDemo,
  parameters: {
    docs: {
      description: {
        component: `## Purpose
現在の作業文脈を維持したまま、集中が必要な補助操作を前面に表示します。

## Usage
編集や確認など、閉じるまで背面操作を止める必要がある場面に限定します。

## Variants
Content、Header、Title、Triggerを組み合わせるcompound componentです。

## Accessibility
Radix UIのfocus trap、Escape操作、Dialog semanticsを維持し、必ずDialogTitleを置きます。

## Do / Don't
通常のページ遷移で十分な長い作業や、軽い通知だけの用途には使いません。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Design System/Components/Dialog",
} satisfies Meta<typeof DialogDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongText: Story = {
  args: {
    content:
      "このDialogは長い文章やフォームを含む場合でも、モバイル画面内でスクロールできる最大高さを持ちます。重要な操作は内容の末尾に配置し、閉じる操作は右上とEscapeキーの両方から利用できます。",
    title: "長い内容を含むDialogの表示確認",
  },
};
