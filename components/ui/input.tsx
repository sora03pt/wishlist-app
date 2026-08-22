import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-control border border-control-border bg-surface px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-4 focus:ring-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-destructive-surface",
        className,
      )}
      type={type}
      {...props}
    />
  );
}

export { Input };
