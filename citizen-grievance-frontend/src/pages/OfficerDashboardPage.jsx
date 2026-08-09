import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { officerService } from "@/services/officerService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  History,
  Clock,
  Loader2
} from "lucide-react";

export const OfficerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data states
  const [activeComplaints, setActiveComplaints] = useState([]);
  const [historyComplaints, setHistoryComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [activeList, historyList] = await Promise.all([
        officerService.getActiveComplaints(),
        officerService.getComplaintHistory()
      ]);
      setActiveComplaints(activeList);
      setHistoryComplaints(historyList);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch officer dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-error/10 text-error border-error/20";
      case "MEDIUM":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-neutral-100 text-neutral-600 border-neutral-200";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-neutral-900 tracking-tight">
            Officer Dashboard
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Logged in as <span className="font-semibold text-neutral-700">{user?.name}</span> • Department: <span className="font-semibold text-neutral-700 capitalize">{user?.department?.toLowerCase()}</span>
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 gap-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Clock className="size-4" />
          Active Assignments ({activeComplaints.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <History className="size-4" />
          Archive History ({historyComplaints.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading assignments...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">
            {error}
          </div>
        )}

        {/* Active tab contents */}
        {!loading && !error && activeTab === "active" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-heading text-neutral-900">Active Grievances</h2>
              <p className="text-sm text-neutral-500 mt-0.5">Complaints currently assigned to you for resolution.</p>
            </div>

            <Card className="border border-neutral-200 shadow-md bg-white rounded-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-4">Complaint Title</th>
                        <th className="px-6 py-4">Citizen</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Assigned On</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {activeComplaints.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-12 text-neutral-400 font-medium">
                            No active grievances assigned to your department.
                          </td>
                        </tr>
                      ) : (
                        activeComplaints.map((c) => (
                          <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-neutral-900 max-w-xs truncate">
                              {c.title}
                            </td>
                            <td className="px-6 py-4 text-neutral-600 font-medium">
                              {c.citizenName}
                            </td>
                            <td className="px-6 py-4 text-neutral-500 font-medium text-xs">
                              {c.category}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(c.priority)}`}>
                                {c.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-neutral-500 text-xs">
                              {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                onClick={() => navigate(`/officer/complaints/${c.id}`)}
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs cursor-pointer font-semibold border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History tab contents */}
        {!loading && !error && activeTab === "history" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-heading text-neutral-900">Processed History</h2>
              <p className="text-sm text-neutral-500 mt-0.5">Archive of complaints assigned to you that are resolved or rejected.</p>
            </div>

            <Card className="border border-neutral-200 shadow-md bg-white rounded-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-4">Complaint Title</th>
                        <th className="px-6 py-4">Citizen</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Resolution Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {historyComplaints.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-12 text-neutral-400 font-medium">
                            No resolved or rejected complaints in your archive history.
                          </td>
                        </tr>
                      ) : (
                        historyComplaints.map((c) => (
                          <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-neutral-900 max-w-xs truncate">
                              {c.title}
                            </td>
                            <td className="px-6 py-4 text-neutral-600 font-medium">
                              {c.citizenName}
                            </td>
                            <td className="px-6 py-4 text-neutral-500 font-medium text-xs">
                              {c.category}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                c.status === "RESOLVED"
                                  ? "bg-success/10 text-success border-success/20"
                                  : "bg-error/10 text-error border-error/20"
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-neutral-500 text-xs">
                              {new Date(c.updatedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                onClick={() => navigate(`/officer/complaints/${c.id}`)}
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs cursor-pointer"
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboardPage;
