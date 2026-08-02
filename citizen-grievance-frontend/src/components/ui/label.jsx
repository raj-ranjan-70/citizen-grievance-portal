import React from "react";
import { cn } from "@/lib/utils";

/**
 * Accessible form label component, styled for consistent weight and spacing.
 * Includes support for visually representing required inputs.
 */
export const Label = React.forwardRef(({
  className,
  children,
  htmlFor,
  required,
  ...props
}, ref) => {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none text-neutral-800 select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-error" aria-hidden="true" title="Required">
          *
        </span>
      )}
    </label>
  );
});

Label.displayName = "Label";
