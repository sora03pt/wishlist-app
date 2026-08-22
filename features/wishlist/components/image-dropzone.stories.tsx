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
        component:
          "画像選択、ドラッグ&ドロップ、preview、uploading状態を扱うWishlist Feature Componentです。画像の圧縮・保存処理は外部hookに保持します。",
      },
    },
  },
  tags: ["autodocs"],
  title: "Features/Wishlist/Image Dropzone",
} satisfies Meta<typeof ImageDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const WithImage: Story = { args: { imageUrl: "/window.svg" } };
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
