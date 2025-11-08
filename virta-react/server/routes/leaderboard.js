import express from "express";
import { getLeaderboard } from "../utils/dataStorage.js";

const router = express.Router();

// Get leaderboard
router.get("/", (req, res) => {
  try {
    const leaderboard = getLeaderboard();
    
    // Calculate statistics
    const totalStudents = leaderboard.length;
    const totalScore = leaderboard.reduce((sum, entry) => sum + entry.score, 0);
    const averageScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;
    const topScore = leaderboard.length > 0 ? Math.max(...leaderboard.map((entry) => entry.score)) : 0;

    res.json({
      success: true,
      leaderboard,
      statistics: {
        totalStudents,
        averageScore,
        topScore,
      },
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;

