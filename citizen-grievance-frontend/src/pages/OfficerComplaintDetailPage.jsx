import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { complaintService } from "@/services/complaintService";
import { officerService } from "@/services/officerService";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Loader2,
  Send,
  User,
  ShieldAlert
} from "lucide-react";

export const OfficerComplaintDetailPage = () => {
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

  // Highlight state
  const [highlightedId, setHighlightedId] = useState(null);
  const [highlightStatus, setHighlightStatus] = useState(false);

  // Comments states
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Action Modals
  const [activeModal, setActiveModal] = useState(null); // 'resolve' | 'reject' | null
  const [remarks, setRemarks] = useState("");
  const [resolutionFile, setResolutionFile] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Viewport Intersection State
  const chatContainerRef = useRef(null);
  const [isChatInViewport, setIsChatInViewport] = useState(true);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);

  const fetchComplaint = async () => {
    try {
      const data = await complaintService.getComplaint(id, "OFFICER");
      setComplaint(data);
      // Trigger background viewed timestamp update
      complaintService.updateLastViewedAt(id).catch(console.error);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaint details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchComplaint();
  }, [id]);

  // Live sync from SSE notifications
  useEffect(() => {
    const handleLiveSync = (e) => {
      const notification = e.detail;
      if (notification && notification.relatedComplaintId === id) {
        // Silently fetch details to prevent page flashing
        complaintService.getComplaint(id, "OFFICER")
          .then((data) => {
            setComplaint(data);
            // If the chat thread is not in viewport, show a floating message indicator
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

  // Intersection Observer to monitor viewport visibility of the chat/discussion section
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
      const savedComment = await complaintService.addComment(id, {
        content: newComment.trim()
      }, user?.role);
      setComplaint((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), savedComment]
      }));
      setNewComment("");
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to post comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionFile || !remarks.trim()) return;

    setStatusLoading(true);
    setModalError("");
    try {
      const updated = await officerService.resolveComplaint(id, resolutionFile, remarks.trim());
      setComplaint(updated);
      setActiveModal(null);
      setResolutionFile(null);
      setRemarks("");
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to resolve complaint.");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!remarks.trim()) return;

    setStatusLoading(true);
    setModalError("");
    try {
      const updated = await officerService.rejectComplaint(id, remarks.trim());
      setComplaint(updated);
      setActiveModal(null);
      setRemarks("");
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to reject complaint.");
    } finally {
      setStatusLoading(false);
    }
  };

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLVED":
        return "bg-success/10 text-success border-success/20";
      case "REJECTED":
        return "bg-error/10 text-error border-error/20";
      case "IN_PROGRESS":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-warning/10 text-warning border-warning/20";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-neutral-400 gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading grievance details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </button>
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">
          {error || "Complaint details could not be loaded."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 relative">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/officer/dashboard')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 shadow-sm text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          title="Back to Dashboard"
        >
          <span>
            <ArrowLeft className="inline w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </span>
        </button>
      </div>

      {/* Main Details Card */}
      <Card className="border border-neutral-200 shadow-md bg-white rounded-lg overflow-hidden">
        {/* Ribbon Header */}
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Complaint ID: #{complaint.id}
          </span>
          <div className="flex items-center gap-3">
            <span ref={statusRef} className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase transition-colors ${
              highlightStatus ? "bg-yellow-200 border-yellow-400 text-yellow-900 animate-pulse" : getStatusBadge(complaint.status)
            }`}>
              {complaint.status}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded border uppercase ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority} Priority
            </span>
          </div>
        </div>

        {/* Card Body */}
        <CardContent className="p-6 space-y-6 pt-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {complaint.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900 tracking-tight leading-tight">
              {complaint.title}
            </h1>
          </div>

          {/* Citizen metadata details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 font-medium">
            <div className="flex items-center gap-2">
              <User className="size-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Submitted By</p>
                <p className="text-neutral-800 mt-0.5 font-bold">
                  {complaint.citizenName} ({complaint.citizenEmail})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Submitted On</p>
                <p className="text-neutral-800 mt-0.5">
                  {new Date(complaint.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Grievance Description
            </Label>
            <div className="p-5 rounded-lg border border-neutral-200 bg-white shadow-inner text-neutral-800 text-sm whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </div>
          </div>

          {/* Grievance Attachments */}
          {complaint.imageDetails && complaint.imageDetails.length > 0 && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Grievance Attachments ({complaint.imageDetails.length})
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {complaint.imageDetails.map((img) => {
                  const isNew = complaint.officerLastViewedAt &&
                    new Date(img.uploadedAt) > new Date(complaint.officerLastViewedAt) &&
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
            </div>
          )}

          {/* Officer Remarks/Proof details (if resolved or rejected) */}
          {(complaint.status === "RESOLVED" || complaint.status === "REJECTED") && (
            <div className={`p-5 rounded-lg border flex flex-col gap-2 ${
              complaint.status === "RESOLVED" ? "bg-success/5 border-success/20 text-neutral-800" : "bg-error/5 border-error/20 text-neutral-800"
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${
                complaint.status === "RESOLVED" ? "text-success" : "text-error"
              }`}>
                {complaint.status === "RESOLVED" ? "Resolution Summary / Remarks" : "Reason for Rejection"}
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.remarks}</p>
              {complaint.status === "RESOLVED" && complaint.resolutionImageUuid && (
                <div className="max-w-md aspect-video rounded-md overflow-hidden border border-neutral-200 mt-2">
                  <a
                    href={`${import.meta.env.VITE_R2_PUBLIC_URL}/${complaint.resolutionImageUuid}.webp`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block size-full"
                  >
                    <img
                      src={`${import.meta.env.VITE_R2_PUBLIC_URL}/${complaint.resolutionImageUuid}.webp`}
                      alt="Proof of resolution"
                      className="size-full object-cover"
                    />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Action buttons for officer (Only when in progress) */}
          {complaint.status === "IN_PROGRESS" && (
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
              <Button
                onClick={() => setActiveModal("reject")}
                variant="outline"
                className="text-error border-error/30 hover:bg-error/5 cursor-pointer font-semibold"
              >
                Reject Grievance
              </Button>
              <Button
                onClick={() => setActiveModal("resolve")}
                variant="primary"
                className="bg-success text-white hover:bg-success/90 border-transparent cursor-pointer font-semibold"
              >
                Mark as Resolved
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discussion Card */}
      <Card ref={chatContainerRef} className="border border-neutral-200 shadow-md bg-white rounded-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-neutral-100 bg-neutral-50/50">
          <CardTitle className="text-lg font-bold text-neutral-900">Discussion & Comments</CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-medium">
            Communication log between you and the citizen owner.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            {(!complaint.comments || complaint.comments.length === 0) ? (
              <div className="text-center py-6 text-neutral-400 text-sm border border-dashed border-neutral-200 rounded-lg italic">
                No comments or updates yet on this grievance.
              </div>
            ) : (
              <div className="space-y-4">
                {complaint.comments.map((comment, index) => {
                  const isOfficerAuthor = comment.authorRole === "OFFICER" || comment.authorRole === "ADMIN";
                  const isNew = (index === complaint.comments.length - 1) &&
                    complaint.officerLastViewedAt &&
                    new Date(comment.createdAt) > new Date(complaint.officerLastViewedAt) &&
                    comment.authorId !== user?.id;
                  const isHighlighted = highlightedId === comment.id;
                  return (
                    <div
                      key={comment.id}
                      id={`comment-${comment.id}`}
                      ref={(el) => (commentRefs.current[comment.id] = el)}
                      className={`flex flex-col p-4 rounded-lg border text-sm max-w-[85%] relative transition-all duration-500 ${
                        isOfficerAuthor
                          ? "bg-primary/5 border-primary/20 ml-auto text-neutral-800"
                          : "bg-neutral-50 border-neutral-200 mr-auto text-neutral-800"
                      } ${
                        isHighlighted ? "ring-4 ring-yellow-200 border-yellow-400 bg-yellow-50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1.5">
                        <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                          {comment.authorName} ({comment.authorRole})
                          {isNew && (
                            <span className="text-[9px] bg-success text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                              New
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comment form (Only active assignments) */}
          {complaint.status === "IN_PROGRESS" && (
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
                  placeholder="Type a message to update the citizen about progress..."
                  required
                  disabled={commentLoading}
                />
              </div>

              {commentError && (
                <div className="text-xs text-error font-medium flex items-center gap-1">
                  <AlertCircle className="size-3.5" />
                  {commentError}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="flex items-center gap-2 cursor-pointer font-semibold text-white bg-primary hover:bg-primary/95"
                >
                  {commentLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="size-4" />
                      Post Comment
                    </>
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

      {/* Resolve Modal */}
      {activeModal === "resolve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-neutral-900/40 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-neutral-200 max-w-lg w-full flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex items-start justify-between bg-success/5">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Mark Grievance as Resolved</h3>
                <p className="text-xs text-neutral-500 mt-1 truncate max-w-sm">
                  {complaint.title}
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-neutral-600 focus:outline-none rounded p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Proof of Resolution Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setResolutionFile(e.target.files[0])}
                    required
                    disabled={statusLoading}
                  />
                  <p className="text-[10px] text-neutral-400 font-medium">Please upload a JPEG, PNG, or WebP image detailing the resolved status.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Resolution Remarks</label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter details on how this issue was resolved..."
                    rows={4}
                    required
                    disabled={statusLoading}
                  />
                </div>

                {modalError && (
                  <div className="text-xs text-error font-medium flex items-center gap-1">
                    <ShieldAlert className="size-3.5" />
                    {modalError}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-neutral-200 bg-neutral-50/50 flex justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveModal(null)}
                  disabled={statusLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={statusLoading || !resolutionFile || !remarks.trim()}
                  className="bg-success text-white hover:bg-success/90 border-transparent cursor-pointer font-semibold"
                >
                  {statusLoading ? <Loader2 className="size-4 animate-spin" /> : "Submit Resolution"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {activeModal === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-neutral-900/40 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-neutral-200 max-w-lg w-full flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex items-start justify-between bg-error/5">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Reject Grievance</h3>
                <p className="text-xs text-neutral-500 mt-1 truncate max-w-sm">
                  {complaint.title}
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-neutral-600 focus:outline-none rounded p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Reason for Rejection</label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter reason or remarks for rejection..."
                    rows={4}
                    required
                    disabled={statusLoading}
                  />
                </div>

                {modalError && (
                  <div className="text-xs text-error font-medium flex items-center gap-1">
                    <ShieldAlert className="size-3.5" />
                    {modalError}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-neutral-200 bg-neutral-50/50 flex justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveModal(null)}
                  disabled={statusLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={statusLoading || !remarks.trim()}
                  className="bg-error text-white hover:bg-error/90 border-transparent cursor-pointer font-semibold"
                >
                  {statusLoading ? <Loader2 className="size-4 animate-spin" /> : "Submit Rejection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
