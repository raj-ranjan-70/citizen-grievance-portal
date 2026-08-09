import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  Edit2,
  UserCheck,
  Building,
  MessageSquare
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@/hooks/useAuth";

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const focusId = searchParams.get("focusId");
  const focusType = searchParams.get("type");

  // Refs for auto-scroll and highlight
  const commentRefs = useRef({});
  const imageRefs = useRef({});
  const statusRef = useRef(null);

  // States
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Highlight states
  const [highlightedId, setHighlightedId] = useState(null);
  const [highlightStatus, setHighlightStatus] = useState(false);

  // Comment submission states
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Image Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Viewport Intersection States
  const chatContainerRef = useRef(null);
  const [isChatInViewport, setIsChatInViewport] = useState(true);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      for (const file of acceptedFiles) {
        await complaintService.uploadImage(id, file);
      }
      const refreshed = await complaintService.getComplaint(id);
      setComplaint(refreshed);
      showToast("Attachment(s) uploaded successfully!", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to upload image. Please check file format and size.";
      setUploadError(msg);
      showToast(msg, "error");
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

  const fetchDetails = async () => {
    try {
      const data = await complaintService.getComplaint(id);
      setComplaint(data);
      complaintService.updateLastViewedAt(id).catch(console.error);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaint details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDetails();
  }, [id]);

  // Live sync from SSE notifications
  useEffect(() => {
    const handleLiveSync = (e) => {
      const notification = e.detail;
      if (notification && notification.relatedComplaintId === id) {
        complaintService.getComplaint(id)
          .then((data) => {
            setComplaint(data);
            if (!isChatInViewport && notification.type === "COMMENT") {
              setShowNewMessageIndicator(true);
            }
          })
          .catch(console.error);
      }
    };
    window.addEventListener("live-notification", handleLiveSync);
    return () => {
      window.removeEventListener("live-notification", handleLiveSync);
    };
  }, [id, isChatInViewport]);

  // Intersection Observer to monitor viewport visibility of discussion section
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsChatInViewport(entry.isIntersecting);
        if (entry.isIntersecting) {
          setShowNewMessageIndicator(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(chatContainerRef.current);
    return () => observer.disconnect();
  }, [complaint]);

  // Deep-link: Scroll to and highlight specific item
  useEffect(() => {
    if (!complaint || !focusId) return;

    let highlightTimer;
    let urlCleanupTimer;

    const scrollTimer = setTimeout(() => {
      let elementFound = false;

      if (focusType === "COMMENT" && commentRefs.current[focusId]) {
        commentRefs.current[focusId].scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(focusId);
        elementFound = true;
      } else if (focusType === "IMAGE" && imageRefs.current[focusId]) {
        imageRefs.current[focusId].scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(focusId);
        elementFound = true;
      } else if (focusType === "STATUS" && statusRef.current) {
        statusRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightStatus(true);
        elementFound = true;
      }

      if (elementFound) {
        // Remove highlights after 2000ms
        highlightTimer = setTimeout(() => {
          setHighlightedId(null);
          setHighlightStatus(false);
        }, 2000);

        // Remove search params from URL after 2000ms without reload
        urlCleanupTimer = setTimeout(() => {
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("focusId");
          newParams.delete("type");
          setSearchParams(newParams, { replace: true });
        }, 2000);
      }
    }, 400);

    return () => {
      clearTimeout(scrollTimer);
      if (highlightTimer) clearTimeout(highlightTimer);
      if (urlCleanupTimer) clearTimeout(urlCleanupTimer);
    };
  }, [complaint, focusId, focusType, searchParams, setSearchParams]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    setCommentError("");
    try {
      const postedComment = await complaintService.addComment(id, {
        content: newComment.trim()
      }, user?.role);
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
        return "bg-warning/10 text-warning border-warning/20";
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
          style: "bg-warning/15 text-warning border-warning/30",
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
          onClick={() => navigate(-1)}
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
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-semibold animate-slideIn ${
          toastMessage.type === "success" 
            ? "bg-success/10 border-success/35 text-success bg-white" 
            : "bg-error/10 border-error/35 text-error bg-white"
        }`}>
          {toastMessage.type === "success" ? (
            <CheckCircle className="size-4 shrink-0 text-success" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-error" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/citizen/dashboard')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 shadow-sm text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          title="Back to Dashboard"
        >
          <span>
            <ArrowLeft className="inline w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </span>
        </button>

        {isEditable && (
          <Button
            onClick={() => navigate(`/citizen/complaints/${complaint.id}/edit`)}
            variant="outline"
            className="flex items-center gap-2 cursor-pointer font-semibold"
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
            <div ref={statusRef} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all ${
              highlightStatus ? "bg-yellow-200 border-yellow-400 text-yellow-900 animate-pulse" : statusInfo.style
            }`}>
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

          {/* Timestamp and Officer details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 font-medium">
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

            <div className="flex items-center gap-2">
              <UserCheck className="size-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Assigned Officer</p>
                <p className="text-neutral-800 mt-0.5 font-bold">
                  {complaint.assignedOfficerName || "Unassigned"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building className="size-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Department</p>
                <p className="text-neutral-800 mt-0.5 font-bold">
                  {complaint.assignedOfficerDepartment || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Officer Remarks Banner */}
          {((complaint.status === "RESOLVED" || complaint.status === "REJECTED") && complaint.remarks) && (
            <div className={`p-5 rounded-lg border flex flex-col gap-2 ${
              complaint.status === "RESOLVED" 
                ? "bg-success/5 border-success/20 text-neutral-800" 
                : "bg-error/5 border-error/20 text-neutral-800"
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${
                complaint.status === "RESOLVED" ? "text-success" : "text-error"
              }`}>
                {complaint.status === "RESOLVED" ? "Resolution Summary / Officer Remarks" : "Reason for Rejection"}
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-body">{complaint.remarks}</p>
            </div>
          )}

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
              Grievance Attachments ({complaint.imageDetails?.length || 0})
            </Label>
            
            {complaint.imageDetails && complaint.imageDetails.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {complaint.imageDetails.map((img) => {
                  const isNew = complaint.citizenLastViewedAt && 
                    new Date(img.uploadedAt) > new Date(complaint.citizenLastViewedAt) &&
                    img.authorId !== user?.id;
                  const isHighlighted = highlightedId === img.id;
                  return (
                    <div
                      key={img.imageUuid}
                      ref={(el) => (imageRefs.current[img.id] = el)}
                      className={`group relative aspect-video rounded-lg overflow-hidden border bg-neutral-100 hover:shadow-md transition-all ${
                        isHighlighted ? "border-yellow-400 ring-4 ring-yellow-200" : "border-neutral-200"
                      }`}
                    >
                      <img
                        src={`${import.meta.env.VITE_R2_PUBLIC_URL}/${img.imageUuid}.webp`}
                        alt="Grievance attachment"
                        className="size-full object-cover"
                      />
                      <a
                        href={`${import.meta.env.VITE_R2_PUBLIC_URL}/${img.imageUuid}.webp`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
                      >
                        View Full Size
                      </a>
                      {isNew && (
                        <span className="absolute top-2 left-2 bg-success text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow z-10">
                          New
                        </span>
                      )}
                    </div>
                  );
                })}
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
      <Card ref={chatContainerRef} className="border border-neutral-200 shadow-md bg-white rounded-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-neutral-100 bg-neutral-50/50">
          <CardTitle className="text-lg font-bold text-neutral-900">Discussion & Comments</CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-medium">
            Official communications, updates, and comments thread.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Comments List */}
          <div className="space-y-4">
            {(!complaint.comments || complaint.comments.length === 0) ? (
              <div className="text-center py-6 text-neutral-400 text-sm border border-dashed border-neutral-200 rounded-lg italic">
                No comments or updates yet on this grievance.
              </div>
            ) : (
              <div className="space-y-4">
                {complaint.comments.map((comment, index) => {
                  const isOfficer = comment.authorRole === "OFFICER" || comment.authorRole === "ADMIN";
                  const isNew = (index === complaint.comments.length - 1) &&
                    complaint.citizenLastViewedAt && 
                    new Date(comment.createdAt) > new Date(complaint.citizenLastViewedAt) &&
                    comment.authorId !== user?.id;
                  const isHighlighted = highlightedId === comment.id;
                  return (
                    <div
                      key={comment.id}
                      id={`comment-${comment.id}`}
                      ref={(el) => (commentRefs.current[comment.id] = el)}
                      className={`flex flex-col p-4 rounded-lg border text-sm max-w-[85%] relative transition-all duration-500 ${
                        isOfficer
                          ? "bg-primary/5 border-primary/20 mr-auto text-neutral-800"
                          : "bg-neutral-50 border-neutral-200 ml-auto text-neutral-800"
                      } ${
                        isHighlighted ? "ring-4 ring-yellow-200 border-yellow-400 bg-yellow-50" : ""
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
                          {isNew && (
                            <span className="text-[9px] bg-success text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                              New
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
          {complaint.status !== "RESOLVED" && complaint.status !== "REJECTED" && (
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
                />
              </div>
              {commentError && (
                <div className="text-xs text-error font-medium flex items-center gap-1"><AlertCircle className="size-3.5" />{commentError}</div>
              )}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={commentLoading || !newComment.trim()}
                  className="flex items-center gap-2 cursor-pointer font-semibold"
                >
                  {commentLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Floating Viewport-Aware New Message Alert */}
      {showNewMessageIndicator && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce">
          <Button
            onClick={() => {
              setShowNewMessageIndicator(false);
              if (complaint.comments && complaint.comments.length > 0) {
                const lastComment = complaint.comments[complaint.comments.length - 1];
                const element = document.getElementById(`comment-${lastComment.id}`);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "center" });
                  element.classList.add("bg-yellow-100");
                  setTimeout(() => {
                    element.classList.remove("bg-yellow-100");
                  }, 2000);
                }
              }
            }}
            className="bg-primary text-white hover:bg-primary/95 font-semibold text-xs py-2.5 px-4 rounded-full shadow-lg flex items-center gap-2 border-transparent cursor-pointer"
          >
            <MessageSquare className="size-4" />
            New comment below 👇
          </Button>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetailsPage;
