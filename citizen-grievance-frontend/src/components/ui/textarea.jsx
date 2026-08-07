import React from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable accessible Textarea component.
 * Stylistically aligned with standard input fields.
 */
export const Textarea = React.forwardRef(({
  className,
  error = false,
  ...props
}, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        error && "border-error focus-visible:ring-error",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
