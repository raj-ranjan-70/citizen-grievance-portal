import React from "react";
import { cn } from "@/lib/utils";

/**
 * Standard text input component with custom styling support.
 * Supports icons on either end and contextual error highlights.
 */
export const Input = React.forwardRef(({
  className,
  type = "text",
  error = false,
  startIcon: StartIcon,
  endIcon: EndIcon,
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      {StartIcon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
          <StartIcon className="size-4" aria-hidden="true" />
        </div>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          StartIcon && "pl-10",
          EndIcon && "pr-10",
          error && "border-error focus-visible:ring-error",
          className
        )}
        {...props}
      />
      {EndIcon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400">
          <EndIcon className="size-4" aria-hidden="true" />
        </div>
      )}
    </div>
  );
});

Input.displayName = "Input";
