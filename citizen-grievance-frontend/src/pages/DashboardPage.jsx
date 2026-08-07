import { useState, useEffect } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { complaintService } from "@/services/complaintService";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Loader2,
  AlertCircle,
  ArrowRight,
  TrendingUp
} from "lucide-react";

/**
 * Citizen Dashboard Page.
 * Displays complaint stats counters, recent grievance submissions, and quick links.
 */
export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only fetch data if user is a citizen (avoid rendering conflicts during role checks)
    if (user && user.role !== "ADMIN" && user.role !== "OFFICER") {
      const fetchComplaints = async () => {
        setLoading(true);
        try {
          const data = await complaintService.getComplaints();
          setComplaints(data);
        } catch (err) {
          setError(err.response?.data?.message || "Failed to load dashboard data. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchComplaints();
    }
  }, [user]);

  // Auth Role Route guards
  if (user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === "OFFICER") {
    return <Navigate to="/officer/dashboard" replace />;
  }

  // Stats computation
  const totalCount = complaints.length;
  const submittedCount = complaints.filter((c) => c.status === "SUBMITTED").length;
  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-error/10 text-error border-error/20";
      case "MEDIUM":
        return "bg-warning/10 text-warning-foreground border-warning/20";
      case "LOW":
      default:
        return "bg-neutral-100 text-neutral-600 border-neutral-200";
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "RESOLVED":
        return "bg-success/15 text-success border-success/30";
      case "REJECTED":
        return "bg-error/15 text-error border-error/30";
      case "IN_PROGRESS":
        return "bg-warning/15 text-warning-foreground border-warning/30";
      case "SUBMITTED":
      default:
        return "bg-primary/10 text-primary border-primary/25";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* 1. Header/Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-lg border border-primary/10 animate-fadeIn">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-neutral-900 tracking-tight">
            Welcome Back, {user?.name || "Citizen"}
          </h2>
          <p className="text-sm text-neutral-600 mt-1.5 max-w-xl leading-relaxed">
            Report issues, track progress in real-time, and collaborate with municipal officers to keep our neighborhood clean and secure.
          </p>
        </div>
        <Button
          as={Link}
          to="/complaints/new"
          variant="primary"
          className="flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-4" />
          File Grievance
        </Button>
      </div>

      {/* 2. Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-sm text-neutral-500 font-medium">Loading your dashboard...</span>
        </div>
      )}

      {/* 3. Error State */}
      {!loading && error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium flex items-center gap-2">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Active Dashboard Grid */}
      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="border border-neutral-200 bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Complaints</p>
                  <p className="text-3xl font-bold text-neutral-900 font-heading">{totalCount}</p>
                </div>
                <div className="size-11 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <FileText className="size-5.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Submitted</p>
                  <p className="text-3xl font-bold text-primary font-heading">{submittedCount}</p>
                </div>
                <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="size-5.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">In Progress</p>
                  <p className="text-3xl font-bold text-warning-foreground font-heading">{inProgressCount}</p>
                </div>
                <div className="size-11 rounded-full bg-warning/10 flex items-center justify-center text-warning-foreground">
                  <Clock className="size-5.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Resolved</p>
                  <p className="text-3xl font-bold text-success font-heading">{resolvedCount}</p>
                </div>
                <div className="size-11 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <CheckCircle2 className="size-5.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Layout Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Complaints Panel */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-heading text-neutral-900">Recent Complaints</h3>
                <Link
                  to="/complaints"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 p-1 rounded"
                >
                  View All Grievances
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              {recentComplaints.length === 0 ? (
                <Card className="border border-dashed border-neutral-200 bg-white py-12 text-center">
                  <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <div className="size-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                      <FileText className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-neutral-800 text-base">No complaints filed yet</p>
                      <p className="text-xs text-neutral-500">File a grievance to see it detailed on your dashboard monitor.</p>
                    </div>
                    <Button
                      as={Link}
                      to="/complaints/new"
                      variant="outline"
                      size="sm"
                      className="mt-2 cursor-pointer"
                    >
                      File Grievance
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentComplaints.map((complaint) => (
                    <Card
                      key={complaint.id}
                      hover
                      onClick={() => navigate(`/complaints/${complaint.id}`)}
                      className="border border-neutral-200 bg-white cursor-pointer transition-all"
                    >
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                              {complaint.category}
                            </span>
                            <span className="text-[10px] font-semibold text-neutral-400">•</span>
                            <span className="text-[10px] text-neutral-500">
                              {formatDate(complaint.createdAt)}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-neutral-900 leading-snug line-clamp-1">
                            {complaint.title}
                          </h4>
                          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                            {complaint.description}
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getPriorityStyle(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadgeStyle(complaint.status)}`}>
                            {complaint.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Resources / Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-heading text-neutral-900">Information & Guides</h3>
              <Card className="border border-neutral-200 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-neutral-900">How Resolutions Work</CardTitle>
                  <CardDescription className="text-xs">Timeline and assignment protocol for complaints.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs text-neutral-600 leading-relaxed">
                  <div className="flex gap-3">
                    <span className="font-bold text-primary">1.</span>
                    <p>Submitted tickets are routed to the central administration panel within 12 hours.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-primary">2.</span>
                    <p>Department administrators verify details and assign a resolving officer.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-primary">3.</span>
                    <p>The resolving officer updates status parameters and corresponds via dashboard comments.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-neutral-200 bg-white">
                <CardContent className="p-5 space-y-3 text-center">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Need Immediate Support?</p>
                  <p className="text-xs text-neutral-600 leading-relaxed">For urgent utility emergencies or hazardous road concerns, contact local emergency services.</p>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="inline-block text-xs font-bold text-primary hover:underline"
                  >
                    View Toll-Free Directory
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
