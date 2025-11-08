import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import assignmentRoutes from "./routes/assignments.js";
import submissionRoutes from "./routes/submissions.js";
import announcementRoutes from "./routes/announcements.js";
import notificationRoutes from "./routes/notifications.js";
import gradeRoutes from "./routes/grades.js";
import runPublicRoutes from "./routes/runPublic.js";
import leaderboardRoutes from "./routes/leaderboard.js";

// Try to start worker (requires Redis) - use dynamic import
import("./workers/submissionWorker.js").catch((err) => {
  console.warn("⚠️  Worker not started (Redis may not be available):", err.message);
  console.warn("   To enable auto-grading, install and start Redis:");
  console.warn("   macOS: brew install redis && redis-server");
  console.warn("   Linux: sudo apt-get install redis-server && redis-server");
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "VirTA Backend API is running",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      assignments: "/api/assignments",
      submissions: "/api/submissions",
      announcements: "/api/announcements",
      notifications: "/api/notifications",
      grades: "/api/grades",
      runPublic: "/api/run-public",
      leaderboard: "/api/leaderboard"
    }
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/run-public", runPublicRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "VirTA Backend API is running" });
});

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join room for student updates
  socket.on("join-student-room", (studentId) => {
    socket.join(`student-${studentId}`);
    console.log(`Student ${studentId} joined room`);
  });

  // Join room for teacher updates
  socket.on("join-teacher-room", (teacherId) => {
    socket.join(`teacher-${teacherId}`);
    console.log(`Teacher ${teacherId} joined room`);
  });

  // Join room for all students (for announcements)
  socket.on("join-all-students", () => {
    socket.join("all-students");
    console.log("Client joined all-students room");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Export io for use in routes
app.locals.io = io;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server is ready`);
});

