import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { complaintService } from "@/services/complaintService";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  AlertTriangle,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle
} from "lucide-react";

export const MyComplaintsPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Deletion state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getComplaints();
      setComplaints(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await complaintService.deleteComplaint(deleteId);
      setComplaints((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete complaint.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Badges styles helpers
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLVED":
        return {
          label: "Resolved",
          style: "bg-success/15 text-success border-success/30",
          icon: CheckCircle
        };
      case "REJECTED":
        return {
          label: "Rejected",
          style: "bg-error/15 text-error border-error/30",
          icon: XCircle
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          style: "bg-warning/15 text-warning-foreground border-warning/30",
          icon: Clock
        };
      case "SUBMITTED":
      default:
        return {
          label: "Submitted",
          style: "bg-primary/10 text-primary border-primary/25",
          icon: FileText
        };
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-neutral-900">My Grievances</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Track, edit, or file public complaints and grievance applications.
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

      {/* Loading view */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-sm text-neutral-500 font-medium">Loading complaints...</span>
        </div>
      )}

      {/* Error banner */}
      {!loading && error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && complaints.length === 0 && (
        <Card className="border border-dashed border-neutral-300 py-16 text-center bg-white rounded-lg">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="size-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <FileText className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-neutral-800 text-lg">No Grievances Found</p>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                You haven't submitted any complaints yet. Click "File Grievance" to report an issue.
              </p>
            </div>
            <Button as={Link} to="/complaints/new" variant="primary" size="sm" className="mt-2 cursor-pointer">
              File First Grievance
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Complaints Grid */}
      {!loading && !error && complaints.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => {
            const statusInfo = getStatusBadge(complaint.status);
            const StatusIcon = statusInfo.icon;
            const isEditable = complaint.status === "SUBMITTED";

            return (
              <Card key={complaint.id} hover className="flex flex-col h-full border border-neutral-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Category Label */}
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 truncate max-w-[150px]">
                      {complaint.category}
                    </span>
                    {/* Priority Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getPriorityStyle(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 text-base font-bold text-neutral-900 leading-snug">
                    {complaint.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 pb-3 text-neutral-600 text-sm">
                  {/* Short snippet of description */}
                  <p className="line-clamp-3 leading-relaxed">
                    {complaint.description}
                  </p>
                </CardContent>

                <CardFooter className="flex-col items-stretch pt-3 border-t border-neutral-100 gap-4">
                  {/* Status & Date row */}
                  <div className="flex items-center justify-between text-xs">
                    {/* Status badge */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${statusInfo.style}`}>
                      <StatusIcon className="size-3.5" />
                      <span>{statusInfo.label}</span>
                    </div>

                    {/* Date */}
                    <span className="text-neutral-500 font-medium">
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => navigate(`/complaints/${complaint.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-center gap-1.5 text-xs h-9 cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      View
                    </Button>

                    <Button
                      onClick={() => navigate(`/complaints/${complaint.id}/edit`)}
                      variant={isEditable ? "outline" : "ghost"}
                      size="sm"
                      disabled={!isEditable}
                      title={!isEditable ? "This action cannot be performed" : undefined}
                      className={`flex items-center justify-center gap-1.5 text-xs h-9 ${
                        !isEditable ? "opacity-40 cursor-not-allowed hover:bg-transparent text-neutral-400" : "cursor-pointer"
                      }`}
                    >
                      <Edit2 className="size-3.5" />
                      Edit
                    </Button>

                    <Button
                      onClick={() => setDeleteId(complaint.id)}
                      variant={isEditable ? "outline" : "ghost"}
                      size="sm"
                      disabled={!isEditable}
                      title={!isEditable ? "This action cannot be performed" : undefined}
                      className={`flex items-center justify-center gap-1.5 text-xs h-9 ${
                        !isEditable
                          ? "opacity-40 cursor-not-allowed hover:bg-transparent text-neutral-400"
                          : "text-error border-error/25 hover:bg-error/5 hover:text-error cursor-pointer"
                      }`}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Styled Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-neutral-900/40 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-neutral-200 max-w-md w-full p-6 space-y-6">
            <div className="flex gap-4">
              <div className="size-10 rounded-full bg-error/10 flex items-center justify-center text-error shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-heading text-neutral-900">Delete Complaint?</h3>
                <p className="text-sm text-neutral-500">
                  Are you sure you want to permanently delete this grievance application? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="min-w-[80px]"
              >
                {deleteLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyComplaintsPage;
