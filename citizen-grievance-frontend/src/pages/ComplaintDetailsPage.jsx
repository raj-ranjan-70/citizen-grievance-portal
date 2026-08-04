import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { complaintService } from "@/services/complaintService";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Edit2
} from "lucide-react";

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await complaintService.getComplaint(id);
        setComplaint(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load complaint details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="text-sm text-neutral-500 font-medium">Fetching complaint details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-4">
        <button
          onClick={() => navigate("/complaints")}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back to My Complaints
        </button>
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium flex items-center gap-2">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  const statusInfo = getStatusBadge(complaint.status);
  const StatusIcon = statusInfo.icon;
  const isEditable = complaint.status === "SUBMITTED";

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate("/complaints")}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-primary transition-colors group cursor-pointer"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to My Complaints
        </button>

        {isEditable && (
          <Button
            onClick={() => navigate(`/complaints/${complaint.id}/edit`)}
            variant="outline"
            className="flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Edit2 className="size-4" />
            Edit Complaint
          </Button>
        )}
      </div>

      {/* Main Details Card */}
      <Card className="border border-neutral-200 shadow-md bg-white rounded-lg overflow-hidden">
        {/* Header Ribbon / Meta bar */}
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
            <span>Complaint ID: #{complaint.id}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Status badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusInfo.style}`}>
              <StatusIcon className="size-3.5" />
              <span>{statusInfo.label}</span>
            </div>

            {/* Priority Badge */}
            <span className={`text-xs font-bold px-2.5 py-1 rounded border uppercase ${getPriorityStyle(complaint.priority)}`}>
              {complaint.priority} Priority
            </span>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-6 space-y-6 pt-6">
          {/* Title */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {complaint.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900 tracking-tight leading-tight">
              {complaint.title}
            </h1>
          </div>

          {/* Timestamp details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Submitted On</p>
                <p className="text-neutral-800 mt-0.5">{formatDate(complaint.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="size-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Last Updated</p>
                <p className="text-neutral-800 mt-0.5">
                  {complaint.updatedAt ? formatDate(complaint.updatedAt) : "No updates recorded"}
                </p>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Grievance Description
            </Label>
            <div className="p-5 rounded-lg border border-neutral-200 bg-white shadow-inner text-neutral-800 text-sm whitespace-pre-wrap leading-relaxed font-body">
              {complaint.description}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintDetailsPage;
