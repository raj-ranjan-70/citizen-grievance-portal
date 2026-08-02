import { forwardRef } from "react";
import { Landmark, Globe, Share2, Mail, Phone, MapPin } from "lucide-react";
import { Container } from "../ui/container";
import { cn } from "@/lib/utils";

/**
 * Standard dark footer for official authority portals.
 * Incorporates links to terms, guidelines, contact info, and social placeholders.
 */
export const Footer = forwardRef(({ className, ...props }, ref) => {
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Identity */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <Landmark className="size-6 text-primary" aria-hidden="true" />
              <span className="font-heading text-lg font-bold tracking-tight">
                Citizen Grievance Portal
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              An official government portal dedicated to resolving citizen concerns
              transparently, efficiently, and professionally.
            </p>
            {/* Social Links Placeholders */}
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="hover:text-white transition-colors" aria-label="Share">
                <Share2 className="size-4" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Website">
                <Globe className="size-4" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Email">
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xs font-semibold text-white tracking-wider uppercase mb-4">
              About Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Portal Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Officer Directory
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h4 className="font-heading text-xs font-semibold text-white tracking-wider uppercase mb-4">
              Legal Policies
            </h4>
            <ul className="space-y-2 text-xs">
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
                  Accessibility Commitment
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-heading text-xs font-semibold text-white tracking-wider uppercase mb-4">
              Contact Info
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 text-primary shrink-0" />
                <span>1800-345-6789 (Toll-Free)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 text-primary shrink-0" />
                <span>support-grievance@gov.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>Department of Public Grievances, Central Secretariat, New Delhi - 110001</span>
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
