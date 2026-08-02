import React from "react";
import { Landmark } from "lucide-react";
import { Container } from "../ui/container";
import { cn } from "@/lib/utils";

/**
 * Standard dark footer for official authority portals.
 * Incorporates links to terms, guidelines, and accessibility commitments.
 */
export const Footer = React.forwardRef(({ className, ...props }, ref) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={ref}
      className={cn(
        "bg-neutral-950 text-neutral-400 py-12 border-t border-neutral-800",
        className
      )}
      {...props}
    >
      <Container size="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Landmark className="size-6 text-primary" aria-hidden="true" />
              <span className="font-heading text-lg font-bold tracking-tight">
                Citizen Grievance Portal
              </span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              An official government portal dedicated to resolving citizen concerns
              transparently, efficiently, and professionally.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Submit a Grievance
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Track Status
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Officer Directory
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Portal FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Accessibility */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Legal & Accessibility
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Accessibility Statement (WCAG 2.1)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help & Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            &copy; {currentYear} Department of Public Grievances. All rights
            reserved.
          </p>
          <p className="text-neutral-500">
            This portal complies with Web Content Accessibility Guidelines (WCAG)
            2.1 Level AA.
          </p>
        </div>
      </Container>
    </footer>
  );
});

Footer.displayName = "Footer";
