import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS classes and merges overlapping classes cleanly.
 * Useful for overriding variant styles and dynamic class names.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
