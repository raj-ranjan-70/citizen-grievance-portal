import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

/**
 * Reusable hook to consume global authentication and session context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
