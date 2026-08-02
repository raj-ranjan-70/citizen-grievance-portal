import React from "react";
import { cn } from "@/lib/utils";

/**
 * A responsive container component to align page layout content.
 * Supports different sizing limits for simple citizen forms vs dense officer dashboards.
 */
export const Container = React.forwardRef(({
  className,
  as: Component = "div",
  fluid = false,
  size = "lg",
  ...props
}, ref) => {
  return (
    <Component
      ref={ref}
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        fluid ? "max-w-full" : {
          sm: "max-w-screen-sm",
          md: "max-w-screen-md",
          lg: "max-w-screen-xl",
          xl: "max-w-screen-2xl",
        }[size],
        className
      )}
      {...props}
    />
  );
});

Container.displayName = "Container";
