import React from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable accessible Select dropdown component.
 * Synthesized with standard input heights and theme focus borders.
 */
export const Select = React.forwardRef(({
  className,
  error = false,
  children,
  ...props
}, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer",
        error && "border-error focus-visible:ring-error",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

export default Select;
