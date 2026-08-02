import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Standard CVA configuration for the Button component.
 * Maps clean semantic variants to utility values, avoiding global classes.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active border border-neutral-200",
        outline:
          "border border-neutral-300 bg-background text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 active:bg-neutral-100",
        ghost:
          "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200",
        destructive:
          "bg-error text-error-foreground hover:bg-error/95 active:bg-error/90 shadow-sm",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export const Button = React.forwardRef(({
  className,
  variant,
  size,
  as: Component = "button",
  ...props
}, ref) => {
  return (
    <Component
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";
