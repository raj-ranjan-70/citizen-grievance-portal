import api from "./api";

/**
 * Helper function to map backend DB statuses to the frontend expectations.
 * - PENDING -> SUBMITTED (allows Editing/Deletion on frontend)
 * - ASSIGNED -> IN_PROGRESS
 */
const mapComplaintStatus = (complaint) => {
  if (!complaint) return complaint;
  return {
    ...complaint,
    status: complaint.status === "PENDING" ? "SUBMITTED" : 
            (complaint.status === "ASSIGNED" ? "IN_PROGRESS" : complaint.status)
  };
};

export const officerService = {
  getActiveComplaints: async () => {
    const response = await api.get("/v1/officer/complaints/active");
    const list = response.data.data || [];
    return list.map(mapComplaintStatus);
  },

  getComplaintHistory: async () => {
    const response = await api.get("/v1/officer/complaints/history");
    const list = response.data.data || [];
    return list.map(mapComplaintStatus);
  },

  updateComplaintStatus: async (complaintId, status) => {
    // Note: status from UI could be RESOLVED or REJECTED
    const response = await api.put(`/v1/officer/complaints/${complaintId}/status`, { status });
    return mapComplaintStatus(response.data.data);
  }
};

export default officerService;
