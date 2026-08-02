import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Route guard for protected/authenticated views.
 * Blocks anonymous access and preserves initial location for post-login redirect.
 */
export const ProtectedRoute = ({ children }) => {
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

  return <>{children}</>;
};
