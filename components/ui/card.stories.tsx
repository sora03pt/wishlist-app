import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CardDemo({ content, title }: { content: string; title: string }) {
  return (
    <Card className="w-96 max-w-full">
      <CardHeader>
        <CardTitle asChild>
          <h2>{title}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm leading-6 text-muted-foreground">
        {content}
      </CardContent>
    </Card>
  );
}

const meta = {
  args: {
    content: "関連する情報と操作をひとつのまとまりとして表示します。",
    title: "Card title",
  },
  component: CardDemo,
  parameters: {
    docs: {
      description: {
        component: `## Purpose
関連する情報をひとつのsurfaceとしてまとめます。

## Usage
Card、CardHeader、CardTitle、CardContentを必要な構造だけ組み合わせます。

## Variants
背景・border・shadowはsemantic tokenで統一し、状態差はfeature側のclassNameで拡張します。

## Accessibility
Card自体に不要なroleを与えず、見出し階層は利用画面で決定します。

## Do / Don't
ページセクションすべてをCard化せず、Cardの中に別のCardを重ねません。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Design System/Components/Card",
} satisfies Meta<typeof CardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongText: Story = {
  args: {
    content:
      "長い内容が入ってもCardの幅を超えず、本文の行間と内側余白を保ちます。情報量が増えた場合は見出しや段落で構造化します。",
    title: "長いタイトルを含むCardの表示確認",
  },
};
