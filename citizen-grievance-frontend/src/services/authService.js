import api from "./api";

/**
 * Service to manage authentication API hooks using the configured Axios client.
 * Connects directly to the Spring Boot session-based endpoints.
 */
export const authService = {
  login: async (credentials) => {
    const response = await api.post("/v1/auth/login", credentials);
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post("/v1/auth/signup", userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/v1/auth/logout");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/v1/auth/me");
    return response.data;
  },
};
