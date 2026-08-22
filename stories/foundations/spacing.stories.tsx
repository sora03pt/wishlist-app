import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  FoundationPage,
  FoundationSection,
} from "./foundation-layout";

const spacingScale = [
  ["1", "4px", "w-1"],
  ["2", "8px", "w-2"],
  ["3", "12px", "w-3"],
  ["4", "16px", "w-4"],
  ["5", "20px", "w-5"],
  ["6", "24px", "w-6"],
  ["8", "32px", "w-8"],
] as const;

function SpacingFoundation() {
  return (
    <FoundationPage
      description="独自のspacing variableは作らず、Tailwindの4px基準スケールを利用します。クラスから実寸と密度を推測できることを優先します。"
      title="Spacing"
    >
      <FoundationSection
        description="gap-2〜4はコントロール内部、p-5〜6はsurface、gap-6〜8はセクション間の基準です。"
        title="Core scale"
      >
        <div className="grid gap-3 rounded-surface border border-border bg-surface p-5">
          {spacingScale.map(([token, pixels, widthClass]) => (
            <div className="grid grid-cols-[3rem_4rem_1fr] items-center gap-3" key={token}>
              <code className="text-xs font-bold">{token}</code>
              <span className="text-xs text-muted-foreground">{pixels}</span>
              <span className={`h-3 rounded-full bg-accent-emphasis ${widthClass}`} />
            </div>
          ))}
        </div>
      </FoundationSection>
    </FoundationPage>
  );
}

const meta = {
  component: SpacingFoundation,
  parameters: { layout: "fullscreen" },
  title: "Design System/Foundations/Spacing",
} satisfies Meta<typeof SpacingFoundation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
