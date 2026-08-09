import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Bell, Landmark, Check } from "lucide-react";
import { NotificationContext } from "@/context/NotificationContext";
import { AuthContext } from "@/context/AuthContext";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { notifications, markAsRead } = useContext(NotificationContext) || { notifications: [], markAsRead: () => {} };
  const { user: authUser } = useContext(AuthContext) || {};

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const getNavLinks = () => {
    if (!user) {
      return [
        { name: "Home", href: "/" },
        { name: "Features", href: "#features" },
        { name: "About", href: "#about" },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

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
          <Link to={user ? (user.role?.toUpperCase() === "ADMIN" ? "/admin/dashboard" : user.role?.toUpperCase() === "OFFICER" ? "/officer/dashboard" : "/citizen/dashboard") : "/"} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
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
            {navLinks.map((link) => {
              const isAnchor = link.href.startsWith("#");
              return isAnchor ? (
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
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary py-5 -mb-[1px]",
                    link.name === activeLink || (link.name === "Dashboard" && activeLink === "Home")
                      ? "text-primary border-b-2 border-primary"
                      : "text-neutral-600"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Actions / Notification bell */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Real-time Notifications Bell */}
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="relative text-neutral-600 hover:text-neutral-950 focus:outline-none cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="size-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white ring-2 ring-white">
                        {notifications.length}
                      </span>
                    )}
                  </Button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-screen max-w-[calc(100vw-2rem)] sm:max-w-sm rounded-lg border border-neutral-200 bg-white shadow-xl py-1 z-50 animate-fadeIn text-sm">
                      <div className="px-4 py-2.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                        <span className="font-bold text-neutral-800">Notifications</span>
                        <span className="text-[10px] font-semibold bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
                          {notifications.length} Unread
                        </span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-xs text-neutral-400 font-medium">
                            No new notifications
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className="p-3 hover:bg-neutral-50 transition-colors flex items-start gap-2.5 cursor-pointer relative group"
                              onClick={() => {
                                setDropdownOpen(false);
                                if (n.relatedComplaintId) {
                                  const role = (authUser?.role || user?.role)?.toUpperCase();
                                  const focusParams = n.targetEntityId ? `?focusId=${n.targetEntityId}&type=${n.type || ""}` : "";
                                  if (role === "CITIZEN") {
                                    navigate(`/citizen/complaints/${n.relatedComplaintId}${focusParams}`);
                                  } else if (role === "OFFICER") {
                                    navigate(`/officer/complaints/${n.relatedComplaintId}${focusParams}`);
                                  } else if (role === "ADMIN") {
                                    navigate(`/admin/dashboard?complaintId=${n.relatedComplaintId}${n.targetEntityId ? `&focusId=${n.targetEntityId}&type=${n.type || ""}` : ""}`);
                                  }
                                }
                              }}
                            >
                              <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="text-xs text-neutral-700 font-medium leading-normal break-words">
                                  {n.message}
                                </p>
                                <span className="text-[9px] text-neutral-400 font-medium mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(n.id);
                                }}
                                className="p-1 rounded bg-neutral-50 hover:bg-success/15 text-neutral-400 hover:text-success transition-colors shrink-0 cursor-pointer self-center"
                                title="Mark as read"
                              >
                                <Check className="size-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 border-l border-neutral-200 pl-2 sm:pl-4">
                  <div className="hidden sm:flex flex-col text-right mr-2">
                    <span className="text-sm font-medium text-neutral-800">
                      {user.name}
                    </span>
                    <span className="text-xs text-neutral-500 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={onLogout} className="px-2 sm:px-3 text-xs sm:text-sm">
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
            {!user && (
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
            )}
          </div>
        </div>
      </Container>
 
      {/* Mobile Drawer */}
      {!user && mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-background px-4 py-4">
          <nav className="flex flex-col gap-3" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
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
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-neutral-200">
              <Button variant="outline" as={Link} to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                Login
              </Button>
              <Button variant="primary" as={Link} to="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                Sign Up
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
});

Navbar.displayName = "Navbar";
