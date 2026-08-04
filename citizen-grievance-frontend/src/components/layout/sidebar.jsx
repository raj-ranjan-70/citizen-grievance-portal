import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  ShieldCheck,
  HelpCircle,
  PlusCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

/**
 * Collapsible side navigation drawer for citizen and official dashboards.
 * Dynamically switches menus based on roles and supports badge highlights.
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
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "My Complaints", icon: FileText, path: "/complaints" },
    { name: "New Complaint", icon: PlusCircle, path: "/complaints/new" },
  ];

  const officerLinks = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "All Grievances", icon: FileText, badge: "12", path: "/dashboard" },
    { name: "Support/FAQ", icon: HelpCircle, path: "/dashboard" },
    { name: "Settings", icon: Settings, path: "/dashboard" },
  ];

  const adminLinks = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "All Grievances", icon: FileText, badge: "45", path: "/dashboard" },
    { name: "User Management", icon: Users, path: "/dashboard" },
    { name: "System Logs", icon: ShieldCheck, path: "/dashboard" },
    { name: "Settings", icon: Settings, path: "/dashboard" },
  ];

  let menuItems = citizenLinks;
  if (role === "admin") {
    menuItems = adminLinks;
  } else if (role === "officer") {
    menuItems = officerLinks;
  }

  return (
    <aside
      ref={ref}
      className={cn(
        "flex flex-col border-r border-neutral-200 bg-background transition-all duration-300 h-[calc(100vh-4rem)] sticky top-16 shrink-0 z-40",
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
          // Determine active status by matching pathname or explicit prop
          const isActive = activeItem
            ? item.name === activeItem
            : location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => onSelect?.(item.name)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group relative focus-visible:ring-inset",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              {/* Active Indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-md bg-primary" />
              )}
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  isActive
                    ? "text-primary"
                    : "text-neutral-400 group-hover:text-neutral-600"
                )}
              />

              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.name}</span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "ml-auto text-xs px-2 py-0.5 rounded-full font-semibold",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-neutral-100 text-neutral-600"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <span className="absolute left-14 scale-0 rounded-md bg-neutral-950 px-2 py-1 text-xs text-white transition-all group-hover:scale-100 whitespace-nowrap z-50 shadow-md">
                  {item.name} {item.badge && `(${item.badge})`}
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
  );
});

Sidebar.displayName = "Sidebar";
