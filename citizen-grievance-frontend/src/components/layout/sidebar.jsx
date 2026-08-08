import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

/**
 * Collapsible side navigation drawer for citizen and official dashboards.
 * Dynamically switches menus based on roles and supports badge highlights.
 * Renders as a bottom navigation bar on mobile devices and a sidebar on desktop.
 */
export const Sidebar = React.forwardRef(({
  className,
  role = "citizen",
  activeItem,
  onSelect,
  ...props
}, ref) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const citizenLinks = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/citizen/dashboard" },
    { name: "My Complaints", icon: FileText, path: "/citizen/complaints" },
    { name: "New Complaint", icon: PlusCircle, path: "/citizen/complaints/new" },
  ];

  const officerLinks = [
    { name: "Officer Dashboard", icon: LayoutDashboard, path: "/officer/dashboard" },
  ];

  const adminLinks = [
    { name: "Admin Dashboard", icon: ShieldCheck, path: "/admin/dashboard" },
  ];

  const normalizedRole = role?.toLowerCase();
  let menuItems = citizenLinks;
  if (normalizedRole === "admin") {
    menuItems = adminLinks;
  } else if (normalizedRole === "officer") {
    menuItems = officerLinks;
  }

  const checkIsActive = (path) => {
    return location.pathname === path ||
      (path === "/citizen/complaints" && 
       location.pathname.startsWith("/citizen/complaints") && 
       !location.pathname.startsWith("/citizen/complaints/new")) ||
      (path.endsWith("/dashboard") && location.pathname.startsWith(path));
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        ref={ref}
        className={cn(
          "hidden md:flex flex-col border-r border-neutral-200 bg-background transition-[width] duration-300 h-[calc(100vh-4rem)] sticky top-16 shrink-0 z-40",
          collapsed ? "w-16" : "w-64",
          className
        )}
        {...props}
      >
        {/* Navigation Links */}
        <nav
          className="flex-1 px-3 py-6 space-y-1"
          aria-label="Sidebar Navigation"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = checkIsActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => onSelect?.(item.name)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all group relative focus-visible:ring-inset",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-4 border-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                )}
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0",
                    isActive
                      ? "text-blue-700"
                      : "text-gray-400 group-hover:text-blue-600"
                  )}
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.name}</span>
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <span className="absolute left-14 scale-0 rounded-md bg-neutral-950 px-2 py-1 text-xs text-white transition-all group-hover:scale-100 whitespace-nowrap z-50 shadow-md">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Action Trigger */}
        <div className="p-3 border-t border-neutral-200 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="size-8 text-neutral-500 hover:text-neutral-800"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 z-40 flex items-center justify-around shadow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = checkIsActive(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-grow h-full py-1.5 transition-all text-center",
                isActive
                  ? "bg-blue-50/50 text-blue-700 font-semibold border-t-4 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              )}
            >
              <Icon className={cn("size-5 mb-1", isActive ? "text-blue-700" : "text-gray-400")} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
});

Sidebar.displayName = "Sidebar";
