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

/**
 * Service to manage complaint API requests using the configured Axios client.
 * Connects directly to the Spring Boot complaint REST endpoints.
 */
export const complaintService = {
  createComplaint: async (data) => {
    const response = await api.post("/v1/complaints", data);
    return mapComplaintStatus(response.data.data);
  },

  getComplaints: async () => {
    const response = await api.get("/v1/complaints");
    const list = response.data.data || [];
    return list.map(mapComplaintStatus);
  },

  getComplaint: async (id) => {
    const response = await api.get(`/v1/complaints/${id}`);
    return mapComplaintStatus(response.data.data);
  },

  updateComplaint: async (id, data) => {
    const response = await api.put(`/v1/complaints/${id}`, data);
    return mapComplaintStatus(response.data.data);
  },

  deleteComplaint: async (id) => {
    const response = await api.delete(`/v1/complaints/${id}`);
    return response.data.data;
  },

  addComment: async (id, commentData) => {
    const response = await api.post(`/v1/complaints/${id}/comments`, commentData);
    return response.data.data;
  },

  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/v1/complaints/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return mapComplaintStatus(response.data.data);
  }
};

export default complaintService;
