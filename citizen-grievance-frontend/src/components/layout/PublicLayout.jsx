import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { useAuth } from "@/hooks/useAuth";

/**
 * Layout for public routes (Landing, Login, Signup).
 * Renders the global navigation header and dark official footer.
 */
export const PublicLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Navbar user={user} onLogout={logout} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
