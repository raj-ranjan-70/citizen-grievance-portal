/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { notificationService } from "@/services/notificationService";

export const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  const fetchUnread = async () => {
    try {
      const data = await notificationService.getUnreadNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    if (!user) {
      setTimeout(() => setNotifications([]), 0);
      return;
    }

    setTimeout(() => {
      fetchUnread();
    }, 0);

    const apiBase = import.meta.env.VITE_API_BASE_URL || "/api/v1";
    const getAbsoluteURL = (path) => {
      if (path.startsWith("http")) return path;
      return `${window.location.origin}${path}`;
    };
    const streamURL = `${getAbsoluteURL(apiBase)}/notifications/subscribe`;

    const eventSource = new EventSource(streamURL, { withCredentials: true });

    eventSource.addEventListener("notification", (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        setNotifications((prev) => [newNotification, ...prev]);

        // Dispatch a custom event on window for live sync across views
        const customEvent = new CustomEvent("live-notification", { detail: newNotification });
        window.dispatchEvent(customEvent);
      } catch (err) {
        console.error("Failed to parse push notification message", err);
      }
    });

    eventSource.addEventListener("init", (event) => {
      console.log("SSE connection initialized:", event.data);
    });

    eventSource.onerror = (err) => {
      console.error("SSE connection error occurred", err);
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, fetchUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};
