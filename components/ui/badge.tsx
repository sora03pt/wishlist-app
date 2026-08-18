import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-zinc-950 text-white",
        lavender: "bg-violet-100 text-violet-800",
        outline: "border border-pink-200 bg-white text-zinc-700",
        pink: "bg-pink-100 text-pink-800",
        success: "border border-emerald-200 bg-emerald-100 text-emerald-800",
        warning: "border border-amber-200 bg-amber-100 text-amber-800",
      },
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ className, variant }))} {...props} />
  );
}

export { Badge, badgeVariants };
