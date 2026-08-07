import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Bell, Landmark } from "lucide-react";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { cn } from "@/lib/utils";

/**
 * Sticky top navigation bar with mobile support.
 * Designed to build trust using official visual elements.
 */
export const Navbar = React.forwardRef(({
  className,
  user,
  onLogout,
  activeLink = "Home",
  ...props
}, ref) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "#features" },
    { name: "About", href: "#about" },
  ];

  return (
    <header
      ref={ref}
      className={cn(
        "sticky top-0 z-50 w-full border-b border-neutral-200 bg-background/95 backdrop-blur-md",
        className
      )}
      {...props}
    >
      <Container size="lg">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Portal Identity */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Landmark
              className="size-6 text-primary shrink-0"
              aria-hidden="true"
            />
            <span className="font-heading text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
              Citizen Grievance Portal
            </span>
            <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary sm:inline-block">
              Official
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Global Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary py-5 -mb-[1px]",
                  link.name === activeLink
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-600"
                )}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* User Actions / Notification bell */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-neutral-600 hover:text-neutral-950"
                  aria-label="Notifications"
                >
                  <Bell className="size-5" />
                  <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-error" />
                </Button>
                <div className="hidden sm:flex items-center gap-2 border-l border-neutral-200 pl-4">
                  <div className="flex flex-col text-right mr-2">
                    <span className="text-sm font-medium text-neutral-800">
                      {user.name}
                    </span>
                    <span className="text-xs text-neutral-500 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={onLogout}>
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  as={Link}
                  to="/login"
                  className="hidden sm:inline-flex"
                >
                  Login
                </Button>
                <Button variant="primary" size="sm" as={Link} to="/signup">
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </Button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-background px-4 py-4">
          <nav className="flex flex-col gap-3" aria-label="Mobile Navigation">
            {user ? (
              <>
                {user.role?.toUpperCase() === "ADMIN" && (
                  <Link
                    to="/admin/dashboard"
                    className="block py-2 px-3 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user.role?.toUpperCase() === "OFFICER" && (
                  <Link
                    to="/officer/dashboard"
                    className="block py-2 px-3 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Officer Dashboard
                  </Link>
                )}
                {user.role?.toUpperCase() === "CITIZEN" && (
                  <>
                    <Link
                      to="/citizen/dashboard"
                      className="block py-2 px-3 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/complaints"
                      className="block py-2 px-3 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Complaints
                    </Link>
                    <Link
                      to="/complaints/new"
                      className="block py-2 px-3 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      New Complaint
                    </Link>
                  </>
                )}
              </>
            ) : (
              navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "block py-2 px-3 rounded-md text-base font-medium transition-colors",
                    link.name === activeLink
                      ? "bg-primary/10 text-primary"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))
            )}
            {!user ? (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-neutral-200">
                <Button variant="outline" as={Link} to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  Login
                </Button>
                <Button variant="primary" as={Link} to="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-neutral-200">
                <div className="flex flex-col px-3 py-1 mb-2">
                  <span className="text-sm font-medium text-neutral-800">
                    {user.name}
                  </span>
                  <span className="text-xs text-neutral-500 capitalize">
                    {user.role}
                  </span>
                </div>
                <Button variant="outline" onClick={() => { onLogout?.(); setMobileMenuOpen(false); }} className="w-full">
                  Sign Out
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
});

Navbar.displayName = "Navbar";
