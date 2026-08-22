import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FoundationPage, FoundationSection } from "../foundations/foundation-layout";

const findings = [
  [
    "High",
    "StarRatingの選択状態",
    "現在はbuttonのgroupで、選択値がradio / aria-checked / aria-pressedとして伝わりません。Phase 3でradiogroupとして再設計します。",
  ],
  [
    "High",
    "フォームエラーとの関連付け",
    "APIエラーは一覧上部のalertへ集約され、該当fieldのaria-invalidとaria-describedbyに接続されません。",
  ],
  [
    "Medium",
    "画像の代替テキスト方針",
    "商品画像は現在altが空です。装飾画像と商品識別に必要な画像を区別するルールが必要です。",
  ],
  [
    "Medium",
    "非同期状態の通知",
    "再取得・保存完了・一覧更新をscreen readerへ通知するlive regionが統一されていません。",
  ],
  [
    "Medium",
    "色コントラスト",
    "accent、selected、mutedの組み合わせはa11y addonと実機でAA基準を確認し、必要に応じてToken側で調整します。",
  ],
] as const;

function WishlistAccessibilityNotes() {
  return (
    <FoundationPage
      description="Phase 2では問題を隠すためのrule無効化を行わず、Storybook化で見つかった課題をPhase 3の入力として記録します。"
      title="Wishlist Accessibility Notes"
    >
      <FoundationSection title="Current findings">
        <div className="grid gap-3">
          {findings.map(([priority, title, description]) => (
            <article
              className="rounded-control border border-border bg-surface p-4"
              key={title}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-accent-strong px-2.5 py-1 text-xs font-bold text-accent-foreground">
                  {priority}
                </span>
                <h2 className="font-semibold">{title}</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </FoundationSection>
    </FoundationPage>
  );
}

const meta = {
  component: WishlistAccessibilityNotes,
  parameters: { layout: "fullscreen" },
  title: "Features/Wishlist/Accessibility Notes",
} satisfies Meta<typeof WishlistAccessibilityNotes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Review: Story = {};
