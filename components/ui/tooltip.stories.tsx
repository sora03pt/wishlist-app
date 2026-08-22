import { Info } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TooltipDemoProps = { content: string };

function TooltipDemo({ content }: TooltipDemoProps) {
  return (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button aria-label="詳細情報" size="icon" variant="outline">
            <Info size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const meta = {
  args: { content: "この項目についての補足情報です。" },
  component: TooltipDemo,
  parameters: {
    docs: {
      description: {
        component: `## Purpose
アイコンなど、単体では意味が伝わりにくいcontrolへ短い補足を提供します。

## Usage
TooltipTriggerをfocus可能な要素へasChildで適用します。

## Variants
表示位置やdelayはRadix Tooltipのpropsで調整します。

## Accessibility
hoverだけでなくkeyboard focusでも表示されます。Tooltipだけに必須情報を置きません。

## Do / Don't
長い説明、エラー、操作に必要な唯一のlabelとしては使いません。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Design System/Components/Tooltip",
} satisfies Meta<typeof TooltipDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongText: Story = {
  args: {
    content:
      "Tooltipは短い補足に限定します。この長さを超える説明は画面内のテキストとして表示してください。",
  },
};
