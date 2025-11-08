import express from "express";
import {
  createNotification,
  getNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  readNotifications,
} from "../utils/dataStorage.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Create notification
router.post("/", (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide userId, title, and message",
      });
    }

    const notification = {
      id: uuidv4(),
      userId,
      title,
      message,
      type: type || "info",
      read: false,
      createdAt: new Date().toISOString(),
    };

    createNotification(notification);

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get notifications by user ID
router.get("/user/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = getNotificationsByUserId(userId);

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Mark notification as read
router.put("/:id/read", (req, res) => {
  try {
    const { id } = req.params;
    const updated = markNotificationAsRead(id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Mark all notifications as read
router.put("/user/:userId/read-all", (req, res) => {
  try {
    const { userId } = req.params;
    markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;

