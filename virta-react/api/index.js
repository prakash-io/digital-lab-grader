import express from "express";
import cors from "cors";
import authRoutes from "../server/routes/auth.js";
import assignmentRoutes from "../server/routes/assignments.js";
import submissionRoutes from "../server/routes/submissions.js";
import announcementRoutes from "../server/routes/announcements.js";
import notificationRoutes from "../server/routes/notifications.js";
import gradeRoutes from "../server/routes/grades.js";
import runPublicRoutes from "../server/routes/runPublic.js";
import leaderboardRoutes from "../server/routes/leaderboard.js";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "VirTA Backend API is running on Vercel",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/run-public", runPublicRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

export default app;
