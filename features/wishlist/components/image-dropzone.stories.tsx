import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ImageDropzone } from "@/features/wishlist/components/image-dropzone";

const meta = {
  args: {
    disabled: false,
    imageUrl: "",
    isUploading: false,
    label: "画像",
    onFileSelect: () => undefined,
    onRemove: () => undefined,
  },
  component: ImageDropzone,
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `画像選択、ドラッグ&ドロップ、preview、uploading状態を扱うWishlist Feature Componentです。画像の圧縮・保存処理は外部hookに保持します。

## Accessibility
見えるlabelをfile inputへ関連付け、選択方法と選択済み状態をテキストでも伝えます。タップ・Enter / Spaceによるfile picker操作を維持し、upload中だけrole=statusを使用します。

## Alternative text rule
フォーム内のpreviewは商品名と選択状態が同じフォーム内にあり、視覚的な確認を補助するため空のaltとします。一覧カードでは画像が商品識別を補うため、商品名をaltに使用します。「画像」「写真」などの冗長な語は加えません。

## Manual check
Tabでfile inputへ移動できること、Enter / Spaceでpickerを開けること、選択済み・upload中が支援技術へ伝わることを確認します。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Features/Wishlist/Image Dropzone",
} satisfies Meta<typeof ImageDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const WithImage: Story = { args: { imageUrl: "./window.svg" } };
export const Disabled: Story = { args: { disabled: true } };
export const Uploading: Story = { args: { isUploading: true } };
export const MobileWidth: Story = {
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full">
        <Story />
      </div>
    ),
  ],
};
