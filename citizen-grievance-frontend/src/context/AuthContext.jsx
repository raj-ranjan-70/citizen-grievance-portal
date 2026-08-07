/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { api } from "@/services/api";

export const AuthContext = createContext(undefined);

/**
 * Global authentication and session provider.
 * Runs check-session checks on mount to support server-side JSESSIONID.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser?.data || null);
      } catch {
        // Safe to ignore on mount, user is unauthenticated or cookie is expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    // Add interceptor to capture session expirations (401 response status)
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          setUser(null);
          // Redirect the browser to login if they are currently inside a protected dashboard route
          if (window.location.pathname.startsWith("/dashboard")) {
            window.location.href = "/login?expired=true";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (credentials) => {
    try {
      const loggedUser = await authService.login(credentials);
      const data = loggedUser?.data || null;
      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const registeredUser = await authService.signup(userData);
      const data = registeredUser?.data || null;
      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Failed to execute logout on server", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
