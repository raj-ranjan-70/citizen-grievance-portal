import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

/**
 * Collapsible side navigation drawer for official staff dashboards.
 * Dynamically switches menus based on roles and supports badge highlights.
 */
export const Sidebar = React.forwardRef(({
  className,
  role = "officer",
  activeItem = "Dashboard",
  onSelect,
  ...props
}, ref) => {
  const [collapsed, setCollapsed] = useState(false);

  const officerLinks = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "All Grievances", icon: FileText, badge: "12" },
    { name: "Support/FAQ", icon: HelpCircle },
    { name: "Settings", icon: Settings },
  ];

  const adminLinks = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "All Grievances", icon: FileText, badge: "45" },
    { name: "User Management", icon: Users },
    { name: "System Logs", icon: ShieldCheck },
    { name: "Settings", icon: Settings },
  ];

  const menuItems = role === "admin" ? adminLinks : officerLinks;

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
          const isActive = item.name === activeItem;
          return (
            <button
              key={item.name}
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
            </button>
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
