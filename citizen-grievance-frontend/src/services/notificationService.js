import api from "./api";

export const notificationService = {
  getUnreadNotifications: async () => {
    const response = await api.get("/notifications/unread");
    return response.data?.data || [];
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  }
};

export default notificationService;
