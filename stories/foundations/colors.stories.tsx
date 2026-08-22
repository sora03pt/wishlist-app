import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  FoundationPage,
  FoundationSection,
} from "./foundation-layout";

const colorTokens = [
  ["background", "bg-background", "アプリ全体の背景"],
  ["surface", "bg-surface", "カード、Dialog、入力面"],
  ["surface-muted", "bg-surface-muted", "無効・補助領域"],
  ["foreground", "bg-foreground", "主要な文字とアイコン"],
  ["muted-foreground", "bg-muted-foreground", "補助情報と日時"],
  ["border", "bg-border", "静かな境界線"],
  ["border-strong", "bg-border-strong", "操作可能要素の境界線"],
  ["primary", "bg-primary", "主要アクション"],
  ["accent", "bg-accent", "hoverや淡い強調面"],
  ["accent-emphasis", "bg-accent-emphasis", "星やブランドアクセント"],
  ["selected", "bg-selected", "購入済みなどの選択面"],
  ["destructive", "bg-destructive", "削除とエラー"],
] as const;

function ColorsFoundation() {
  return (
    <FoundationPage
      description="色相名ではなくUI上の役割で参照します。Featureはpinkやzincを直接選ばず、状態の意味に対応するTokenを利用します。"
      title="Colors"
    >
      <FoundationSection
        description="Surfaceとcontentを分けることで、背景色を変更しても文字の役割が保たれます。"
        title="Semantic palette"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colorTokens.map(([name, colorClass, usage]) => (
            <div
              className="flex items-center gap-3 rounded-control border border-border bg-surface p-3"
              key={name}
            >
              <span
                aria-hidden="true"
                className={`size-12 shrink-0 rounded-xl border border-black/5 ${colorClass}`}
              />
              <span className="min-w-0">
                <code className="text-xs font-bold">{name}</code>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {usage}
                </span>
              </span>
            </div>
          ))}
        </div>
      </FoundationSection>
      <FoundationSection
        description="successとwarningは現在Badgeだけで使うため、Tailwind標準のemerald／amberを維持します。利用範囲が広がった時点でsemantic tokenへ昇格します。"
        title="Status colors"
      >
        <p className="text-sm text-muted-foreground">
          destructiveのみ、エラー表示と削除操作で共有されるためToken化しています。
        </p>
      </FoundationSection>
    </FoundationPage>
  );
}

const meta = {
  component: ColorsFoundation,
  parameters: { layout: "fullscreen" },
  title: "Design System/Foundations/Colors",
} satisfies Meta<typeof ColorsFoundation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
