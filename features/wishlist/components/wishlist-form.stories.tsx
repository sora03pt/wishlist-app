import { useState } from "react";
import { Save } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { WishlistForm } from "@/features/wishlist/components/wishlist-form";
import { initialWishlistForm } from "@/features/wishlist/model/wishlist-form";
import type {
  UpdateWishlistForm,
  WishlistFormValues,
} from "@/features/wishlist/types";

type WishlistFormDemoProps = {
  disabled?: boolean;
  initialValues?: WishlistFormValues;
  isUploadingImage?: boolean;
  mode?: "create" | "edit";
};

function WishlistFormDemo({
  disabled = false,
  initialValues = initialWishlistForm,
  isUploadingImage = false,
  mode = "create",
}: WishlistFormDemoProps) {
  const [values, setValues] = useState(initialValues);
  const update: UpdateWishlistForm = (field, value) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  };

  return (
    <WishlistForm
      actions={
        <Button className="mt-5 w-full" disabled={disabled} type="submit">
          {isUploadingImage ? (
            <LoadingIndicator size={18} />
          ) : (
            <Save size={18} />
          )}
          {mode === "create" ? "追加する" : "保存"}
        </Button>
      }
      disabled={disabled}
      imagePreviewUrl=""
      isUploadingImage={isUploadingImage}
      mode={mode}
      onChange={update}
      onFileSelect={() => undefined}
      onRemoveImage={() => undefined}
      onSubmit={() => undefined}
      ratingAriaLabel="欲しいレベル"
      values={values}
    />
  );
}

const editValues: WishlistFormValues = {
  category: "インテリア",
  desireLevel: 5,
  imagePath: "",
  imageUrl: "./window.svg",
  memo: "部屋の幅を測ってから注文する。",
  price: "24800",
  title: "デスクライト",
  url: "https://example.com/products/light",
};

const meta = {
  args: {
    disabled: false,
    initialValues: initialWishlistForm,
    isUploadingImage: false,
    mode: "create",
  },
  component: WishlistFormDemo,
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-full rounded-surface border border-border bg-surface p-6 shadow-surface">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `Wishlistの新規作成と編集で共用するFeature Formです。入力primitiveはDesign Systemを利用し、商品フィールド、カテゴリ候補、欲しい度、画像というドメイン構成をFeature側に保持します。

## Accessibility
商品名は見えるlabelとnative requiredで必須を伝えます。空のまま送信した場合はFormMessageを表示し、aria-invalid / aria-describedbyで入力欄へ関連付けてfocusを戻します。価格はnumber + numeric keyboard、URLはnative url typeを利用します。

## Manual check
先頭からTab順が見た目の順序と一致すること、商品名を空にして送信するとエラーへfocusが移ること、RatingとSelectを矢印キーで変更できることを確認します。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Features/Wishlist/Wishlist Form",
} satisfies Meta<typeof WishlistFormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};
export const RequiredError: Story = {
  parameters: {
    docs: {
      description: {
        story: "商品名を空のまま追加すると、入力欄に関連付いたエラーを確認できます。",
      },
    },
  },
};
export const Edit: Story = {
  args: { initialValues: editValues, mode: "edit" },
};
export const Disabled: Story = {
  args: { disabled: true, initialValues: editValues, mode: "edit" },
};
export const UploadingImage: Story = {
  args: { initialValues: editValues, isUploadingImage: true, mode: "edit" },
};
export const MobileWidth: Story = {
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full">
        <Story />
      </div>
    ),
  ],
};
