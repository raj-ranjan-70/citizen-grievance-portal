import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Main dashboard routing gateway.
 * Redirects admin users to the Admin dashboard, and renders citizen placeholder otherwise.
 */
export const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold font-heading mb-2">Dashboard Page</h2>
      <p className="text-neutral-600">This is the protected dashboard view placeholder.</p>
    </div>
  );
};

export default DashboardPage;
