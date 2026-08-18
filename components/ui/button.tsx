import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-pink-100",
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
        default:
          "bg-zinc-950 text-white shadow-sm hover:bg-zinc-800",
        destructive:
          "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
        ghost: "text-zinc-700 hover:bg-pink-50",
        outline:
          "border border-pink-200 bg-white/80 text-zinc-800 shadow-sm hover:bg-pink-50",
        secondary:
          "bg-lavender-100 text-zinc-800 hover:bg-lavender-200",
        soft:
          "border border-pink-200 bg-pink-100 text-pink-900 hover:bg-pink-200",
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
