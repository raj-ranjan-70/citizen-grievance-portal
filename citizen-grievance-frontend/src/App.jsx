
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/ui/PublicOnlyRoute";

import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { MyComplaintsPage } from "@/pages/MyComplaintsPage";
import { CreateComplaintPage } from "@/pages/CreateComplaintPage";
import { ComplaintDetailsPage } from "@/pages/ComplaintDetailsPage";
import { EditComplaintPage } from "@/pages/EditComplaintPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { OfficerDashboardPage } from "@/pages/OfficerDashboardPage";


function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Routes wrapped in PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />

            {/* Guest-only routes protected from authenticated users */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignupPage />
                </PublicOnlyRoute>
              }
            />
          </Route>

          {/* CITIZEN Protected Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["CITIZEN"]}>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/citizen/dashboard" element={<DashboardPage />} />
            <Route path="/citizen/complaints" element={<MyComplaintsPage />} />
            <Route path="/citizen/complaints/new" element={<CreateComplaintPage />} />
            <Route path="/citizen/complaints/:id" element={<ComplaintDetailsPage />} />
            <Route path="/citizen/complaints/:id/edit" element={<EditComplaintPage />} />
          </Route>

          {/* OFFICER Protected Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["OFFICER"]}>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/officer/dashboard" element={<OfficerDashboardPage />} />
          </Route>

          {/* ADMIN Protected Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
