/**
 * Service to manage mock authentication API hooks for frontend development.
 * Simulates server response latency and stores/restores mock sessions in localStorage.
 */
export const authService = {
  login: async (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const email = credentials.email?.toLowerCase().trim();
        const password = credentials.password;

        if (email === "citizen@gov.in" && password === "password123") {
          const user = {
            id: 1,
            name: "Rahul Sharma",
            email: "citizen@gov.in",
            role: "citizen",
          };
          localStorage.setItem("mock_session_user", JSON.stringify(user));
          resolve(user);
        } else if (email === "officer@gov.in" && password === "password123") {
          const user = {
            id: 2,
            name: "Officer Verma",
            email: "officer@gov.in",
            role: "officer",
          };
          localStorage.setItem("mock_session_user", JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Invalid email or password."));
        }
      }, 1000); // 1s simulation lag
    });
  },

  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem("mock_session_user");
        resolve({ success: true });
      }, 500);
    });
  },

  getCurrentUser: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem("mock_session_user");
        resolve(stored ? JSON.parse(stored) : null);
      }, 300);
    });
  },
};
