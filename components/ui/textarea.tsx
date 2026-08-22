import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-control border border-border bg-surface px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-4 focus:ring-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70 aria-invalid:border-destructive-border aria-invalid:ring-destructive-surface",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
