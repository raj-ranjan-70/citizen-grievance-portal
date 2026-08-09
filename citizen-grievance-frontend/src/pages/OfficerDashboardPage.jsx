import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { officerService } from "@/services/officerService";
import { complaintService } from "@/services/complaintService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  History,
  Clock,
  AlertCircle,
  Loader2,
  Send,
  MessageSquare
} from "lucide-react";

export const OfficerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkComplaintId = searchParams.get("complaintId");
  const { user } = useAuth();

  // Data states
  const [activeComplaints, setActiveComplaints] = useState([]);
  const [historyComplaints, setHistoryComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Details Modal states
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [resolutionFile, setResolutionFile] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'view' | 'resolve' | 'reject' | null
  const [remarks, setRemarks] = useState("");

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

  const fetchComplaintDetails = async (id) => {
    try {
      const details = await complaintService.getComplaint(id, "OFFICER");
      setSelectedComplaint(details);
      
      // Update local state list items too so they match the loaded data
      setActiveComplaints((prev) =>
        prev.map((c) => (c.id === details.id ? details : c))
      );
      setHistoryComplaints((prev) =>
        prev.map((c) => (c.id === details.id ? details : c))
      );
      return details;
    } catch (err) {
      console.error("Failed to fetch complaint details", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Deep-link: auto-open/close complaint from notification click (?complaintId=...)
  useEffect(() => {
    if (!deepLinkComplaintId) {
      // If parameter is cleared, close view/modal states
      setSelectedComplaint(null);
      setActiveModal(null);
      return;
    }
    const loadDetails = async () => {
      const details = await fetchComplaintDetails(deepLinkComplaintId);
      if (details) {
        setActiveModal("view");
        if (details.status === "RESOLVED" || details.status === "REJECTED") {
          setActiveTab("history");
        } else {
          setActiveTab("active");
        }
      }
    };
    loadDetails();
  }, [deepLinkComplaintId]);

  // Live sync from SSE notifications
  useEffect(() => {
    if (!selectedComplaint) return;

    const handleLiveSync = (e) => {
      const notification = e.detail;
      if (notification && notification.relatedComplaintId === selectedComplaint.id) {
        fetchComplaintDetails(selectedComplaint.id);
      }
    };

    window.addEventListener("live-notification", handleLiveSync);
    return () => {
      window.removeEventListener("live-notification", handleLiveSync);
    };
  }, [selectedComplaint?.id]);

  // Mark as viewed when selectedComplaint opens
  useEffect(() => {
    if (!selectedComplaint) return;

    const triggerViewReceipt = async () => {
      try {
        await complaintService.updateLastViewedAt(selectedComplaint.id);
      } catch (err) {
        console.error("Failed to update viewed receipt", err);
      }
    };
    triggerViewReceipt();
  }, [selectedComplaint?.id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedComplaint) return;

    setCommentLoading(true);
    setModalError("");
    try {
      const savedComment = await complaintService.addComment(selectedComplaint.id, {
        content: newComment.trim()
      }, user?.role);

      // Update local state for comments in the selected complaint
      const updatedComplaint = {
        ...selectedComplaint,
        comments: [...(selectedComplaint.comments || []), savedComment]
      };
      setSelectedComplaint(updatedComplaint);

      // Also update the complaint in the lists
      setActiveComplaints((prev) =>
        prev.map((c) => (c.id === updatedComplaint.id ? updatedComplaint : c))
      );
      setHistoryComplaints((prev) =>
        prev.map((c) => (c.id === updatedComplaint.id ? updatedComplaint : c))
      );

      setNewComment("");
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to post comment. Please try again.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedComplaint(null);
    setActiveModal(null);
    setResolutionFile(null);
    setRemarks("");
    setModalError("");
    setSearchParams({});
  };

  const handleResolveSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedComplaint || !resolutionFile || !remarks.trim()) return;

    setStatusLoading(true);
    setModalError("");
    try {
      const updated = await officerService.resolveComplaint(selectedComplaint.id, resolutionFile, remarks.trim());
      setActiveComplaints((prev) => prev.filter((c) => c.id !== selectedComplaint.id));
      setHistoryComplaints((prev) => {
        if (prev.some((c) => c.id === updated.id)) return prev;
        return [updated, ...prev];
      });
      handleCloseModal();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to resolve complaint.");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedComplaint || !remarks.trim()) return;

    setStatusLoading(true);
    setModalError("");
    try {
      const updated = await officerService.rejectComplaint(selectedComplaint.id, remarks.trim());
      setActiveComplaints((prev) => prev.filter((c) => c.id !== selectedComplaint.id));
      setHistoryComplaints((prev) => {
        if (prev.some((c) => c.id === updated.id)) return prev;
        return [updated, ...prev];
      });
      handleCloseModal();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to reject complaint.");
    } finally {
      setStatusLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "text-error bg-error/10 border-error/20";
      case "MEDIUM":
        return "text-warning-foreground bg-warning/10 border-warning/20";
      case "LOW":
      default:
        return "text-success bg-success/10 border-success/20";
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Horizontal Navigation Tabs */}
        <div className="flex border-b border-neutral-200 bg-white p-2 rounded-lg shadow-sm gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
              activeTab === "active"
                ? "bg-primary/10 text-primary"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            <Clock className="size-4" />
            <span>Active Assignments</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-neutral-100 text-neutral-600">
              {activeComplaints.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-primary/10 text-primary"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            <History className="size-4" />
            <span>Processed History</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-neutral-100 text-neutral-600">
              {historyComplaints.length}
            </span>
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-sm text-neutral-500 font-medium">Fetching assigned complaints...</span>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium flex items-center gap-2">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Active tab contents */}
        {!loading && !error && activeTab === "active" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-heading text-neutral-900">Active Grievances</h2>
              <p className="text-sm text-neutral-500 mt-0.5">Complaints currently assigned to you that require attention.</p>
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
                            No active complaints assigned to you.
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
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={() => { setSelectedComplaint(c); setActiveModal("view"); }}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs cursor-pointer font-semibold border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                                >
                                  View
                                </Button>
                                <Button
                                  onClick={() => { setSelectedComplaint(c); setActiveModal("resolve"); }}
                                  variant="primary"
                                  size="sm"
                                  className="h-8 text-xs cursor-pointer bg-success text-white hover:bg-success/90 border-transparent font-semibold"
                                >
                                  Resolve
                                </Button>
                                <Button
                                  onClick={() => { setSelectedComplaint(c); setActiveModal("reject"); }}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs cursor-pointer text-error border-error/30 hover:bg-error/5 font-semibold"
                                >
                                  Reject
                                </Button>
                              </div>
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
                                onClick={() => { setSelectedComplaint(c); setActiveModal("view"); }}
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

      {/* Complaint View Modal */}
      {selectedComplaint && activeModal === "view" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-neutral-900/40 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-neutral-200 max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-200 flex items-start justify-between">
              <div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColor(selectedComplaint.priority)}`}>
                  {selectedComplaint.priority} Priority
                </span>
                <h3 className="text-xl font-bold font-heading text-neutral-900 mt-2">{selectedComplaint.title}</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Filed by <span className="font-semibold text-neutral-800">{selectedComplaint.citizenName}</span> ({selectedComplaint.citizenEmail}) on {new Date(selectedComplaint.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Grievance Description</h4>
                <div className="p-4 bg-neutral-50 rounded-lg text-sm text-neutral-700 leading-relaxed border border-neutral-100 whitespace-pre-wrap">
                  {selectedComplaint.description}
                </div>
              </div>

              {/* Citizen Attachments (If any) */}
              {selectedComplaint.imageDetails && selectedComplaint.imageDetails.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Attachments ({selectedComplaint.imageDetails.length})</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedComplaint.imageDetails.map((img) => {
                      const isNew = selectedComplaint.officerLastViewedAt && 
                        new Date(img.uploadedAt) > new Date(selectedComplaint.officerLastViewedAt);
                      return (
                        <div key={img.imageUuid} className="relative group">
                          <a
                            href={`${import.meta.env.VITE_R2_PUBLIC_URL}/${img.imageUuid}.webp`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block aspect-video rounded-md overflow-hidden border border-neutral-200 bg-neutral-50 hover:opacity-85 transition-opacity"
                          >
                            <img
                              src={`${import.meta.env.VITE_R2_PUBLIC_URL}/${img.imageUuid}.webp`}
                              alt="Attachment"
                              className="size-full object-cover"
                            />
                          </a>
                          {isNew && (
                            <span className="absolute top-1 left-1 bg-success text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              New
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Remarks/Proof Banner (If RESOLVED or REJECTED) */}
              {(selectedComplaint.status === "RESOLVED" || selectedComplaint.status === "REJECTED") && (
                <div className={`p-4 rounded-lg border space-y-2 ${
                  selectedComplaint.status === "RESOLVED" ? "bg-success/5 border-success/20" : "bg-error/5 border-error/20"
                }`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${
                    selectedComplaint.status === "RESOLVED" ? "text-success" : "text-error"
                  }`}>
                    {selectedComplaint.status === "RESOLVED" ? "Resolution Summary / Officer Remarks" : "Reason for Rejection"}
                  </h4>
                  {selectedComplaint.remarks && (
                    <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">{selectedComplaint.remarks}</p>
                  )}
                  {selectedComplaint.status === "RESOLVED" && selectedComplaint.resolutionImageUuid && (
                    <div className="max-w-xs aspect-video rounded-md overflow-hidden border border-neutral-200 mt-2">
                      <a
                        href={`${import.meta.env.VITE_R2_PUBLIC_URL}/${selectedComplaint.resolutionImageUuid}.webp`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block size-full"
                      >
                        <img
                          src={`${import.meta.env.VITE_R2_PUBLIC_URL}/${selectedComplaint.resolutionImageUuid}.webp`}
                          alt="Proof of resolution"
                          className="size-full object-cover"
                        />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Discussion Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="size-4" /> Discussion Thread
                </h4>

                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {!selectedComplaint.comments || selectedComplaint.comments.length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-400 italic">
                      No discussions recorded. Add a note below to update the citizen.
                    </div>
                  ) : (
                    selectedComplaint.comments.map((comment) => {
                      const isNew = selectedComplaint.officerLastViewedAt && 
                        new Date(comment.createdAt) > new Date(selectedComplaint.officerLastViewedAt);
                      return (
                        <div
                          key={comment.id}
                          className={`flex flex-col gap-1 p-3 rounded-lg border text-sm relative ${
                            comment.authorRole === "OFFICER"
                              ? "bg-primary/5 border-primary/10 ml-6"
                              : "bg-white border-neutral-200 mr-6"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-semibold">
                            <span className={comment.authorRole === "OFFICER" ? "text-primary" : "text-neutral-700"}>
                              {comment.authorName} ({comment.authorRole})
                              {isNew && (
                                <span className="ml-2 bg-success text-white text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-wide">
                                  New
                                </span>
                              )}
                            </span>
                            <span className="text-neutral-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-neutral-700 font-medium leading-normal mt-0.5">{comment.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Comment Input (Active assignments only) */}
                {selectedComplaint.status === "IN_PROGRESS" && (
                  <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
                    <Input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Post a follow-up or status clarification..."
                      disabled={commentLoading}
                      required
                      className="flex-grow"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={commentLoading || !newComment.trim()}
                      className="px-4 cursor-pointer"
                    >
                      {commentLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-neutral-200 bg-neutral-50/50 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Grievance Modal */}
      {selectedComplaint && activeModal === "resolve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-neutral-900/40 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-neutral-200 max-w-lg w-full flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex items-start justify-between bg-success/5">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Resolve Grievance</h3>
                <p className="text-xs text-neutral-500 mt-1 truncate max-w-sm">
                  {selectedComplaint.title}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-success rounded p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Resolution Remarks</label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Describe how this issue was resolved..."
                    rows={4}
                    required
                    disabled={statusLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Proof of Resolution Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setResolutionFile(e.target.files[0]);
                        setModalError("");
                      }
                    }}
                    required
                    disabled={statusLoading}
                    className="text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-success/10 file:text-success hover:file:bg-success/20 cursor-pointer w-full"
                  />
                  {resolutionFile && (
                    <span className="text-xs font-semibold text-neutral-700 block mt-1">
                      Selected: {resolutionFile.name} ({(resolutionFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>

                {modalError && (
                  <div className="text-xs text-error font-medium flex items-center gap-1">
                    <AlertCircle className="size-3.5" />
                    {modalError}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-neutral-200 bg-neutral-50/50 flex justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
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

      {/* Reject Grievance Modal */}
      {selectedComplaint && activeModal === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-neutral-900/40 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-neutral-200 max-w-lg w-full flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex items-start justify-between bg-error/5">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Reject Grievance</h3>
                <p className="text-xs text-neutral-500 mt-1 truncate max-w-sm">
                  {selectedComplaint.title}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-error rounded p-1 cursor-pointer"
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
                    <AlertCircle className="size-3.5" />
                    {modalError}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-neutral-200 bg-neutral-50/50 flex justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
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

export default OfficerDashboardPage;
