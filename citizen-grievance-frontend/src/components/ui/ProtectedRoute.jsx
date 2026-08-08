import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Route guard for protected/authenticated views.
 *
 * - Without `allowedRoles`: blocks anonymous access and redirects to /login.
 * - With `allowedRoles`: additionally enforces role-based access.
 *   If the user is authenticated but the wrong role, they are redirected to their
 *   own home dashboard instead of the login page.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="size-10 rounded-full bg-primary/20 border border-primary/40 animate-ping" />
          <span className="text-sm font-medium text-neutral-500 font-heading">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role guard: if allowedRoles are specified and user's role is not in the list,
  // redirect to their own home dashboard silently.
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toUpperCase();
    if (!allowedRoles.includes(userRole)) {
      const roleDashboards = {
        CITIZEN: "/citizen/dashboard",
        OFFICER: "/officer/dashboard",
        ADMIN: "/admin/dashboard",
      };
      const redirectTo = roleDashboards[userRole] || "/";
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};
