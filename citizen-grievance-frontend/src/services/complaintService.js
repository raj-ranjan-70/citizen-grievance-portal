import api from "./api";

/**
 * Service to manage complaint API requests using the configured Axios client.
 * Connects directly to the Spring Boot complaint REST endpoints.
 */
export const complaintService = {
  createComplaint: async (data) => {
    const response = await api.post("/complaints", data);
    return response.data;
  },

  getComplaints: async () => {
    const response = await api.get("/complaints");
    return response.data;
  },

  getComplaint: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  updateComplaint: async (id, data) => {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data;
  },

  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },
};

export default complaintService;
