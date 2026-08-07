
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
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


function App() {
  return (
    <AuthProvider>
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

          {/* Protected Routes wrapped in ProtectedLayout & ProtectedRoute guard */}
          <Route
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/complaints" element={<MyComplaintsPage />} />
            <Route path="/complaints/new" element={<CreateComplaintPage />} />
            <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
            <Route path="/complaints/:id/edit" element={<EditComplaintPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
