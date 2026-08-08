import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/hooks/useAuth";

/**
 * Layout for protected/authenticated routes (Dashboard).
 * Renders the top navigation header and a collapsible sidebar.
 */
export const ProtectedLayout = () => {
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Navbar user={user} onLogout={logout} />
      <div className="flex flex-1">
        {user && (
          <Sidebar
            role={user.role}
            activeItem={activeItem}
            onSelect={setActiveItem}
          />
        )}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
