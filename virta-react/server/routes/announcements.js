import express from "express";
import { createAnnouncement, getAnnouncements } from "../utils/dataStorage.js";
import { createNotification } from "../utils/dataStorage.js";
import { readUsers } from "../utils/users.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Create announcement (Teacher)
router.post("/", (req, res) => {
  try {
    const { title, message, teacherId, teacherName } = req.body;

    if (!title || !message || !teacherId) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, message, and teacherId",
      });
    }

    const announcement = {
      id: uuidv4(),
      title,
      message,
      teacherId,
      teacherName: teacherName || "Teacher",
      createdAt: new Date().toISOString(),
    };

    createAnnouncement(announcement);

    // Create notifications for all students
    const users = readUsers();
    const students = users.filter((u) => u.userType === "student" || !u.userType);
    
    students.forEach((student) => {
      createNotification({
        id: uuidv4(),
        userId: student.id,
        title: `New Announcement: ${title}`,
        message: message,
        type: "announcement",
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    // Emit to all students via WebSocket
    const io = req.app.locals.io;
    if (io) {
      io.to("all-students").emit("new-announcement", announcement);
      io.to("all-students").emit("new-notification", {
        title: `New Announcement: ${title}`,
        message: message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all announcements
router.get("/", (req, res) => {
  try {
    const announcements = getAnnouncements();
    res.json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;

