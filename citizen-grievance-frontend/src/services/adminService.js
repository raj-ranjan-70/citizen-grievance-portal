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

export const adminService = {
  createOfficer: async (data) => {
    const response = await api.post("/v1/admin/officers", data);
    return response.data.data;
  },

  getComplaints: async () => {
    const response = await api.get("/v1/admin/complaints");
    const list = response.data.data || [];
    return list.map(mapComplaintStatus);
  },

  getOfficers: async () => {
    const response = await api.get("/v1/admin/officers");
    return response.data.data;
  },

  assignComplaint: async (complaintId, officerId) => {
    const response = await api.put(`/v1/admin/complaints/${complaintId}/assign`, { officerId });
    return mapComplaintStatus(response.data.data);
  }
};

export default adminService;
