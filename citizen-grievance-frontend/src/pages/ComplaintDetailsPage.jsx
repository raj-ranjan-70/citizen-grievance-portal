import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { complaintService } from "@/services/complaintService";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  Calendar,
  AlertCircle,
  Edit2
} from "lucide-react";
import { useDropzone } from "react-dropzone";

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Comment submission states
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Image Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      for (const file of acceptedFiles) {
        const updated = await complaintService.uploadImage(id, file);
        setComplaint(updated);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to upload image. Please check file format and size.");
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"]
    },
    maxSize: 5 * 1024 * 1024,
    multiple: true
  });

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    setCommentError("");
    try {
      const postedComment = await complaintService.addComment(id, {
        content: newComment.trim()
      });
      setComplaint((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), postedComment]
      }));
      setNewComment("");
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to post comment. Please try again.");
    } finally {
      setCommentLoading(false);
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

          {/* Grievance Attachments (Images) */}
          <div className="space-y-3 pt-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Grievance Attachments ({complaint.imageUuids?.length || 0})
            </Label>
            
            {complaint.imageUuids && complaint.imageUuids.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {complaint.imageUuids.map((uuid) => (
                  <div key={uuid} className="group relative aspect-video rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 hover:shadow-md transition-all">
                    <img
                      src={`${import.meta.env.VITE_R2_PUBLIC_URL}/${uuid}.webp`}
                      alt="Grievance attachment"
                      className="size-full object-cover"
                    />
                    <a
                      href={`${import.meta.env.VITE_R2_PUBLIC_URL}/${uuid}.webp`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
                    >
                      View Full Size
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Dropzone for citizen uploads */}
            {complaint.status !== "RESOLVED" && complaint.status !== "REJECTED" && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-neutral-300 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="size-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                    {uploading ? (
                      <Loader2 className="size-5 animate-spin text-primary" />
                    ) : (
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">
                      {uploading ? "Processing and uploading..." : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      WebP, JPEG, PNG, or GIF up to 5MB (images will be resized and optimized)
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {uploadError && (
              <p className="text-xs text-error font-medium flex items-center gap-1">
                <AlertCircle className="size-3.5" /> {uploadError}
              </p>
            )}
          </div>

          {/* Resolution Proof Attachments */}
          {complaint.status === "RESOLVED" && complaint.resolutionImageUuid && (
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <Label className="text-sm font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
                <CheckCircle className="size-4 shrink-0 text-success" />
                Proof of Resolution Uploaded by Officer
              </Label>
              <div className="max-w-md rounded-lg overflow-hidden border border-success/30 bg-success/5 p-2 hover:shadow-md transition-all">
                <div className="relative aspect-video rounded-md overflow-hidden bg-neutral-100 group">
                  <img
                    src={`${import.meta.env.VITE_R2_PUBLIC_URL}/${complaint.resolutionImageUuid}.webp`}
                    alt="Proof of resolution"
                    className="size-full object-cover"
                  />
                  <a
                    href={`${import.meta.env.VITE_R2_PUBLIC_URL}/${complaint.resolutionImageUuid}.webp`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
                  >
                    View Resolution Image
                  </a>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discussion & Comments Section */}
      <Card className="border border-neutral-200 shadow-md bg-white rounded-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-neutral-100 bg-neutral-50/50">
          <CardTitle className="text-lg font-bold text-neutral-900">Discussion & Comments</CardTitle>
          <CardDescription className="text-xs text-neutral-500">
            Official communications, updates, and comments thread.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Comments List */}
          <div className="space-y-4">
            {(!complaint.comments || complaint.comments.length === 0) ? (
              <div className="text-center py-6 text-neutral-400 text-sm border border-dashed border-neutral-200 rounded-lg">
                No comments or updates yet on this grievance.
              </div>
            ) : (
              <div className="space-y-4">
                {complaint.comments.map((comment) => {
                  const isOfficer = comment.authorRole === "OFFICER" || comment.authorRole === "ADMIN";
                  return (
                    <div
                      key={comment.id}
                      className={`flex flex-col p-4 rounded-lg border text-sm max-w-[85%] ${
                        isOfficer
                          ? "bg-primary/5 border-primary/20 mr-auto text-neutral-800"
                          : "bg-neutral-50 border-neutral-200 ml-auto text-neutral-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1.5">
                        <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                          {comment.authorName}
                          {isOfficer && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 uppercase font-semibold">
                              Officer
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-neutral-100 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="comment" className="font-semibold text-neutral-800 text-xs uppercase tracking-wider">
                Post an Update
              </Label>
              <Textarea
                id="comment"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your message or query here..."
                required
                disabled={commentLoading}
                error={!!commentError}
              />
            </div>
            {commentError && (
              <div className="text-xs text-error font-medium flex items-center gap-1"><AlertCircle className="size-3.5" />{commentError}</div>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={commentLoading || !newComment.trim()}
              className="flex items-center gap-2 cursor-pointer"
            >
              {commentLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Post Comment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintDetailsPage;
