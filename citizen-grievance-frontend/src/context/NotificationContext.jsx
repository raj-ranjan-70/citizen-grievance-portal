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
    const streamURL = `${getAbsoluteURL(apiBase)}/v1/notifications/subscribe`;

    const eventSource = new EventSource(streamURL, { withCredentials: true });

    eventSource.addEventListener("notification", (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        
        // Extract currently viewed complaint ID from pathname
        const path = window.location.pathname;
        const matches = path.match(/\/(citizen|officer)\/complaints\/([a-f0-9-]+)/i);
        const openComplaintId = matches ? matches[2] : null;

        if (newNotification.relatedComplaintId && newNotification.relatedComplaintId === openComplaintId) {
          // Dispatch live-sync event so page updates silently
          const customEvent = new CustomEvent("live-notification", { detail: newNotification });
          window.dispatchEvent(customEvent);

          // Mark it read in the background immediately on the server
          notificationService.markAsRead(newNotification.id).catch(console.error);
        } else {
          // Standard flow: add to unread list and dispatch event
          setNotifications((prev) => [newNotification, ...prev]);
          const customEvent = new CustomEvent("live-notification", { detail: newNotification });
          window.dispatchEvent(customEvent);
        }
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

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications([]);
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, markAllAsRead, fetchUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};
