import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/apiService";
import { socketService } from "../services/socketService";
import { IconBell } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export function NotificationButton() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      const socket = socketService.connect();
      socketService.joinStudentRoom(user.id);

      socket.on("new-notification", (notification) => {
        loadNotifications();
      });

      return () => {
        socketService.off("new-notification");
      };
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications(user.id);
      setNotifications(response.notifications || []);
      setUnreadCount(response.notifications.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user.id);
      loadNotifications();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        <IconBell className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-purple-200 dark:border-purple-800 z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-4 border-b border-purple-200 dark:border-purple-800 flex items-center justify-between">
              <h3 className="font-bold text-purple-700 dark:text-purple-300">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="divide-y divide-purple-200 dark:divide-purple-800">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-purple-600 dark:text-purple-400 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors",
                      !notification.read && "bg-purple-100/50 dark:bg-purple-900/30"
                    )}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          !notification.read ? "bg-purple-600" : "bg-transparent"
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-purple-700 dark:text-purple-300 text-sm">
                          {notification.title}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                          {notification.message}
                        </div>
                        <div className="text-xs text-purple-500 dark:text-purple-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

