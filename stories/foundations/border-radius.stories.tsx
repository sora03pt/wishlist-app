import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  FoundationPage,
  FoundationSection,
} from "./foundation-layout";

const radii = [
  ["control", "rounded-control", "Input、Button、Select"],
  ["surface", "rounded-surface", "Cardなどのまとまり"],
  ["overlay", "rounded-overlay", "Dialogなど最前面の面"],
] as const;

function BorderRadiusFoundation() {
  return (
    <FoundationPage
      description="大きめの角丸はプロダクトの視覚的特徴です。数値ではなく、UI階層に応じた3段階で管理します。"
      title="Border Radius"
    >
      <FoundationSection title="Semantic radius">
        <div className="grid gap-4 sm:grid-cols-3">
          {radii.map(([name, radiusClass, usage]) => (
            <div key={name}>
              <div className={`h-32 border border-accent-border bg-accent ${radiusClass}`} />
              <code className="mt-3 block text-xs font-bold">{name}</code>
              <p className="mt-1 text-xs text-muted-foreground">{usage}</p>
            </div>
          ))}
        </div>
      </FoundationSection>
      <FoundationSection
        description="Avatarや星のボタンなど円形であること自体に意味がある場合はrounded-fullを直接使います。"
        title="Exceptions"
      >
        <p className="text-sm text-muted-foreground">
          Feature固有の画像サイズや一度しか現れない形状はToken化しません。
        </p>
      </FoundationSection>
    </FoundationPage>
  );
}

const meta = {
  component: BorderRadiusFoundation,
  parameters: { layout: "fullscreen" },
  title: "Design System/Foundations/Border Radius",
} satisfies Meta<typeof BorderRadiusFoundation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
