import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-focus",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-11 px-4 py-2",
        icon: "size-11",
        sm: "h-9 rounded-xl px-3",
      },
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
        destructive:
          "border border-destructive-border bg-surface text-destructive hover:bg-destructive-surface",
        ghost: "text-foreground hover:bg-accent",
        outline:
          "border border-border-strong bg-surface/80 text-foreground shadow-sm hover:bg-accent",
        secondary:
          "bg-selected text-foreground hover:bg-selected-border",
        soft:
          "border border-accent-border bg-accent-strong text-accent-foreground hover:bg-accent-hover",
      },
    },
  },
);

function Button({
  asChild = false,
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
