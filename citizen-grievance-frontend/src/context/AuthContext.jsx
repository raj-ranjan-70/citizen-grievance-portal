import React, { createContext, useState, useEffect } from "react";
import { authService } from "@/services/authService";

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
        setUser(currentUser);
      } catch (error) {
        // Safe to ignore on mount, user is unauthenticated or cookie is expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(credentials);
      setUser(loggedUser);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const registeredUser = await authService.signup(userData);
      setUser(registeredUser);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error("Failed to execute logout on server", error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
