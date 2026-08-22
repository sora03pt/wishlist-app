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
        default: "bg-primary text-primary-foreground",
        lavender: "bg-selected text-selected-foreground",
        outline: "border border-border-strong bg-surface text-foreground",
        pink: "bg-accent-strong text-accent-foreground",
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
