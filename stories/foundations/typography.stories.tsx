import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  FoundationPage,
  FoundationSection,
} from "./foundation-layout";

function TypographyFoundation() {
  return (
    <FoundationPage
      description="フォントファミリーのみをプロダクトTokenとし、サイズ・weight・line-heightはTailwindの標準type scaleを組み合わせます。"
      title="Typography"
    >
      <FoundationSection title="Product hierarchy">
        <div className="grid gap-6 rounded-surface border border-border bg-surface p-5 shadow-surface">
          <div>
            <code className="text-xs text-muted-foreground">text-4xl / bold</code>
            <p className="mt-2 text-4xl font-bold">欲しいものリスト</p>
          </div>
          <div>
            <code className="text-xs text-muted-foreground">text-xl / semibold</code>
            <p className="mt-2 text-xl font-semibold">セクションタイトル</p>
          </div>
          <div>
            <code className="text-xs text-muted-foreground">text-base</code>
            <p className="mt-2 text-base">商品名や入力内容に使う標準本文です。</p>
          </div>
          <div>
            <code className="text-xs text-muted-foreground">text-sm / leading-6</code>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              説明やメモは読みやすい行間を確保します。コンパクトなUIでも本文を過度に小さくしません。
            </p>
          </div>
        </div>
      </FoundationSection>
      <FoundationSection
        description="装飾的な専用フォントや独自letter-spacingは導入せず、システムフォントで表示速度と可読性を優先します。"
        title="Font family"
      >
        <p className="font-sans text-lg">Arial, Helvetica, sans-serif</p>
      </FoundationSection>
    </FoundationPage>
  );
}

const meta = {
  component: TypographyFoundation,
  parameters: { layout: "fullscreen" },
  title: "Design System/Foundations/Typography",
} satisfies Meta<typeof TypographyFoundation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
