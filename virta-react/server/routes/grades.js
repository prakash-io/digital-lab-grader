import express from "express";
import {
  createOrUpdateGrade,
  getGradesByAssignment,
  getGradesByStudent,
} from "../utils/dataStorage.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Create or update grade (Teacher)
router.post("/", (req, res) => {
  try {
    const { assignmentId, submissionId, studentId, grade, runtime, teacherId, feedback } = req.body;

    if (!assignmentId || !submissionId || !studentId || grade === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide assignmentId, submissionId, studentId, and grade",
      });
    }

    const gradeData = {
      id: uuidv4(),
      assignmentId,
      submissionId,
      studentId,
      grade: parseFloat(grade),
      runtime: runtime || null,
      teacherId: teacherId || null,
      feedback: feedback || "",
      gradedAt: new Date().toISOString(),
    };

    createOrUpdateGrade(gradeData);

    res.status(201).json({
      success: true,
      message: "Grade saved successfully",
      grade: gradeData,
    });
  } catch (error) {
    console.error("Create grade error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get grades by assignment
router.get("/assignment/:assignmentId", (req, res) => {
  try {
    const { assignmentId } = req.params;
    const grades = getGradesByAssignment(assignmentId);

    res.json({
      success: true,
      grades,
    });
  } catch (error) {
    console.error("Get grades error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get grades by student
router.get("/student/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    const grades = getGradesByStudent(studentId);

    res.json({
      success: true,
      grades,
    });
  } catch (error) {
    console.error("Get student grades error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;

