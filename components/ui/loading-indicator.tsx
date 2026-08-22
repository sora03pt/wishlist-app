import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingIndicatorProps = React.ComponentProps<"span"> & {
  label?: string;
  size?: number;
};

function LoadingIndicator({
  className,
  label,
  size = 18,
  ...props
}: LoadingIndicatorProps) {
  return (
    <span
      aria-label={label}
      className={cn("inline-flex shrink-0", className)}
      role={label ? "status" : undefined}
      {...props}
    >
      <Loader2 aria-hidden="true" className="animate-spin" size={size} />
    </span>
  );
}

export { LoadingIndicator };
