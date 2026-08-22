import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  FoundationPage,
  FoundationSection,
} from "./foundation-layout";

const shadows = [
  ["surface", "shadow-surface", "ページ上の主要Card"],
  ["card", "shadow-card", "Wishlistの反復Card"],
  ["selected", "shadow-selected", "選択・購入済みCard"],
  ["popover", "shadow-popover", "Select、Tooltip"],
  ["overlay", "shadow-overlay", "Dialog"],
] as const;

function ShadowFoundation() {
  return (
    <FoundationPage
      description="影は装飾ではなくUI階層を示すために使います。弱い色付きshadowで、背景から必要な分だけ面を分離します。"
      title="Shadow"
    >
      <FoundationSection title="Elevation">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {shadows.map(([name, shadowClass, usage]) => (
            <div
              className={`rounded-surface border border-border bg-surface p-5 ${shadowClass}`}
              key={name}
            >
              <code className="text-xs font-bold">{name}</code>
              <p className="mt-2 text-sm text-muted-foreground">{usage}</p>
            </div>
          ))}
        </div>
      </FoundationSection>
    </FoundationPage>
  );
}

const meta = {
  component: ShadowFoundation,
  parameters: { layout: "fullscreen" },
  title: "Design System/Foundations/Shadow",
} satisfies Meta<typeof ShadowFoundation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
