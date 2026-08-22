import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type FormFieldDemoProps = {
  description?: string;
  error?: string;
  label: string;
  required?: boolean;
};

function FormFieldDemo({
  description,
  error,
  label,
  required = false,
}: FormFieldDemoProps) {
  const descriptionId = description ? "form-story-description" : undefined;
  const errorId = error ? "form-story-error" : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <FormField className="w-80 max-w-full">
      <FormLabel htmlFor="form-story-input" required={required}>
        {label}
      </FormLabel>
      <Input
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        id="form-story-input"
        placeholder="入力してください"
        required={required}
      />
      {description ? (
        <FormDescription id={descriptionId}>{description}</FormDescription>
      ) : null}
      {error ? <FormMessage id={errorId}>{error}</FormMessage> : null}
    </FormField>
  );
}

const meta = {
  args: {
    description: "入力内容の条件を簡潔に説明します。",
    label: "商品名",
    required: false,
  },
  component: FormFieldDemo,
  parameters: {
    docs: {
      description: {
        component: `## Purpose
label、control、説明、エラーの垂直リズムと意味的な関係を整えます。

## Usage
FormField内でFormLabel、入力control、FormDescription、FormMessageを組み合わせます。必須項目ではlabelとnative controlの両方へ必須状態を設定します。

## Variants
説明のみ、エラーのみ、両方の構成に対応します。

## Accessibility
htmlFor / id、aria-invalid、aria-describedbyを明示的に接続し、FormMessageはrole=alertを持ちます。必須記号だけに依存せず、スクリーンリーダー向けの「必須」も含みます。

## Do / Don't
見た目だけを揃えて関連付けを省略せず、placeholderをlabelとして扱いません。`,
      },
    },
  },
  tags: ["autodocs"],
  title: "Design System/Components/Form Field",
} satisfies Meta<typeof FormFieldDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutDescription: Story = { args: { description: undefined } };
export const Required: Story = { args: { required: true } };
export const Error: Story = {
  args: {
    description: undefined,
    error: "商品名を入力してください。",
  },
};
