import * as React from "react";
import { cn } from "@/lib/utils";

function FormField({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

type FormLabelProps = React.ComponentProps<"label"> & {
  required?: boolean;
};

function FormLabel({
  children,
  className,
  required = false,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={cn("text-sm font-semibold text-foreground", className)}
      {...props}
    >
      {children}
      {required ? (
        <>
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
          <span className="sr-only">（必須）</span>
        </>
      ) : null}
    </label>
  );
}

function FormDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm leading-5 text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm font-medium text-destructive", className)}
      role="alert"
      {...props}
    />
  );
}

export { FormDescription, FormField, FormLabel, FormMessage };
