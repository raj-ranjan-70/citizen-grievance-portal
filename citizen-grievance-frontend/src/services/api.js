import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

/**
 * Global Axios instance configured for cookie-based Spring Boot authentication.
 * enabled withCredentials for JSESSIONID cross-origin exchanges.
 */
export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Global interceptors can be configured here if necessary (e.g. logouts on 401s)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns a 401 (Session Expired/Invalid), throw to auth wrappers
    return Promise.reject(error);
  }
);
export default api;
