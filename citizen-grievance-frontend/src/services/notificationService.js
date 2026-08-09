import api from "./api";

export const notificationService = {
  getUnreadNotifications: async () => {
    const response = await api.get("/v1/notifications/unread");
    return response.data?.data || [];
  },

  markAsRead: async (id) => {
    const response = await api.put(`/v1/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/v1/notifications/read-all");
    return response.data;
  }
};

export default notificationService;
