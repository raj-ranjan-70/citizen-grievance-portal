import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Users,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Shield,
  Clock,
  XCircle,
  Building,
  Menu,
  ChevronRight
} from "lucide-react";

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("complaints");

  // Data states
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Assign Officer Modal states
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");

  // Create Officer Modal/Form states
  const [showCreateOfficer, setShowCreateOfficer] = useState(false);
  const [officerForm, setOfficerForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "WATER"
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [complaintsList, officersList] = await Promise.all([
        adminService.getComplaints(),
        adminService.getOfficers()
      ]);
      setComplaints(complaintsList);
      setOfficers(officersList);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch admin dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedOfficerId) return;

    setAssignLoading(true);
    setAssignError("");
    try {
      const updatedComplaint = await adminService.assignComplaint(selectedComplaint.id, selectedOfficerId);
      setComplaints((prev) =>
        prev.map((c) => (c.id === updatedComplaint.id ? updatedComplaint : c))
      );
      setSelectedComplaint(null);
      setSelectedOfficerId("");
    } catch (err) {
      setAssignError(err.response?.data?.message || "Failed to assign officer. Please try again.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!officerForm.name.trim() || !officerForm.email.trim() || officerForm.password.length < 6) {
      setCreateError("Please fill out all fields. Password must be at least 6 characters.");
      return;
    }

    setCreateLoading(true);
    try {
      const newOfficer = await adminService.createOfficer({
        name: officerForm.name.trim(),
        email: officerForm.email.trim(),
        password: officerForm.password,
        department: officerForm.department
      });
      setOfficers((prev) => [...prev, newOfficer]);
      setCreateSuccess(`Officer ${newOfficer.name} registered successfully!`);
      setOfficerForm({
        name: "",
        email: "",
        password: "",
        department: "WATER"
      });
      setTimeout(() => setShowCreateOfficer(false), 2000);
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create officer account.");
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusBadge = (status) => {
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Horizontal Navigation Tabs */}
        <div className="flex border-b border-neutral-200 bg-white p-2 rounded-lg shadow-sm gap-2">
          <button
            onClick={() => setActiveTab("complaints")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
              activeTab === "complaints"
                ? "bg-primary/10 text-primary"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            <FileText className="size-4" />
            <span>Manage Complaints</span>
          </button>

          <button
            onClick={() => setActiveTab("officers")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
              activeTab === "officers"
                ? "bg-primary/10 text-primary"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            <Users className="size-4" />
            <span>Manage Officers</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-sm text-neutral-500 font-medium">Fetching administrative records...</span>
          </div>
        )}

        {/* Global Error Banner */}
        {!loading && error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium flex items-center gap-2">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Complaints Management Tab */}
        {!loading && !error && activeTab === "complaints" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-heading text-neutral-900">Manage Grievances</h2>
                <p className="text-sm text-neutral-500 mt-0.5">Assign submitted concerns to department officers for resolution.</p>
              </div>
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
                        <th className="px-6 py-4">Assigned Officer</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {complaints.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-neutral-400">
                            No complaints filed in the system.
                          </td>
                        </tr>
                      ) : (
                        complaints.map((c) => (
                          <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-neutral-900 max-w-xs truncate">
                              {c.title}
                            </td>
                            <td className="px-6 py-4 text-neutral-600 font-medium">
                              {c.citizenName}
                            </td>
                            <td className="px-6 py-4 text-neutral-500 text-xs uppercase font-bold">
                              {c.category}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(c.status)}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-neutral-700 font-medium">
                              {c.assignedOfficerName ? (
                                <span className="flex items-center gap-1.5 text-xs">
                                  <UserCheck className="size-3.5 text-success" />
                                  {c.assignedOfficerName}
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-400 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {c.status === "SUBMITTED" ? (
                                <Button
                                  onClick={() => setSelectedComplaint(c)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs cursor-pointer"
                                >
                                  Assign Officer
                                </Button>
                              ) : (
                                <span className="text-xs text-neutral-400 font-medium">Processed</span>
                              )}
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

        {/* Officers Management Tab */}
        {!loading && !error && activeTab === "officers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-heading text-neutral-900">Manage Officers</h2>
                <p className="text-sm text-neutral-500 mt-0.5">Register new municipal officers and inspect existing listings.</p>
              </div>
              <Button
                onClick={() => setShowCreateOfficer(true)}
                variant="primary"
                className="flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="size-4" />
                Add Officer
              </Button>
            </div>

            <Card className="border border-neutral-200 shadow-md bg-white rounded-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-4">Officer Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {officers.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center py-10 text-neutral-400">
                            No officers registered yet. Click "Add Officer" to register one.
                          </td>
                        </tr>
                      ) : (
                        officers.map((o) => (
                          <tr key={o.id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-neutral-900">
                              {o.name}
                            </td>
                            <td className="px-6 py-4 text-neutral-600 font-medium">
                              {o.email}
                            </td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1.5 text-xs text-neutral-700 font-semibold">
                                <Building className="size-3.5 text-neutral-400" />
                                {o.department}
                              </span>
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

      {/* Officer Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-neutral-900/40 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-neutral-200 max-w-md w-full p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold font-heading text-neutral-900">Assign Officer</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Select an officer to resolve: <span className="font-semibold text-neutral-800">"{selectedComplaint.title}"</span>
              </p>
            </div>

            <form onSubmit={handleAssign} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="officerSelect" className="font-semibold text-neutral-800 text-xs">
                  Available Officers
                </Label>
                <select
                  id="officerSelect"
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                >
                  <option value="">-- Choose Officer --</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.department})
                    </option>
                  ))}
                </select>
              </div>

              {assignError && (
                <div className="text-xs text-error font-medium flex items-center gap-1">
                  <AlertCircle className="size-3.5" />
                  {assignError}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedComplaint(null);
                    setSelectedOfficerId("");
                  }}
                  disabled={assignLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={assignLoading || !selectedOfficerId}
                  className="min-w-[80px]"
                >
                  {assignLoading ? <Loader2 className="size-4 animate-spin" /> : "Assign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Officer Modal */}
      {showCreateOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-neutral-900/40 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-neutral-200 max-w-md w-full p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold font-heading text-neutral-900">Add New Officer</h3>
              <p className="text-xs text-neutral-500 mt-1">Register a new official to handle public complaints.</p>
            </div>

            <form onSubmit={handleCreateOfficer} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="officerName" className="font-semibold text-neutral-800 text-xs">
                  Full Name
                </Label>
                <Input
                  id="officerName"
                  type="text"
                  value={officerForm.name}
                  onChange={(e) => setOfficerForm({ ...officerForm, name: e.target.value })}
                  placeholder="Officer Kumar"
                  required
                  disabled={createLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="officerEmail" className="font-semibold text-neutral-800 text-xs">
                  Email Address
                </Label>
                <Input
                  id="officerEmail"
                  type="email"
                  value={officerForm.email}
                  onChange={(e) => setOfficerForm({ ...officerForm, email: e.target.value })}
                  placeholder="kumar@citizen.com"
                  required
                  disabled={createLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="officerPassword" className="font-semibold text-neutral-800 text-xs">
                  Password
                </Label>
                <Input
                  id="officerPassword"
                  type="password"
                  value={officerForm.password}
                  onChange={(e) => setOfficerForm({ ...officerForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  disabled={createLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="officerDept" className="font-semibold text-neutral-800 text-xs">
                  Department
                </Label>
                <select
                  id="officerDept"
                  value={officerForm.department}
                  onChange={(e) => setOfficerForm({ ...officerForm, department: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                >
                  <option value="WATER">Water Supply</option>
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="ROADS">Roads & Infrastructure</option>
                  <option value="SANITATION">Sanitation</option>
                  <option value="NONE">None</option>
                </select>
              </div>

              {createError && (
                <div className="text-xs text-error font-medium flex items-center gap-1">
                  <AlertCircle className="size-3.5" />
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="text-xs text-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-success" />
                  {createSuccess}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreateOfficer(false);
                    setCreateError("");
                    setCreateSuccess("");
                  }}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={createLoading}
                  className="min-w-[80px]"
                >
                  {createLoading ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
