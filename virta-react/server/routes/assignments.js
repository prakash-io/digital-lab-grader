import express from "express";
import {
  createAssignment,
  getAssignmentById,
  getAssignmentsByTeacher,
  readAssignments,
  updateAssignment,
} from "../utils/dataStorage.js";
import { assignmentSchema } from "../utils/validation.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Create assignment (Teacher only)
router.post("/", (req, res) => {
  try {
    // Validate with Zod
    const validationResult = assignmentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.errors);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const data = validationResult.data;

    const assignment = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      languages: data.languages,
      timeLimit: data.timeLimit,
      memoryLimit: data.memoryLimit,
      ioSpec: data.ioSpec || {},
      constraints: data.constraints || "",
      publicTestCases: data.publicTestCases,
      hiddenTestCases: data.hiddenTestCases || [],
      teacherId: data.teacherId,
      teacherName: data.teacherName || "Teacher",
      dueDate: data.dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createAssignment(assignment);

    // Emit to all students via WebSocket
    const io = req.app.locals.io;
    if (io) {
      // Don't send hidden test cases to students
      const studentAssignment = {
        ...assignment,
        hiddenTestCases: [], // Hide hidden test cases
      };
      io.to("all-students").emit("new-assignment", studentAssignment);
    }

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all assignments (role-aware: students don't get hidden test cases)
router.get("/", (req, res) => {
  try {
    const userRole = req.query.role || "student"; // Default to student
    const assignments = readAssignments();
    
    // If student, remove hidden test cases
    const filteredAssignments = assignments.map((assignment) => {
      if (userRole === "student") {
        return {
          ...assignment,
          hiddenTestCases: [], // Hide hidden test cases from students
        };
      }
      return assignment;
    });

    res.json({
      success: true,
      assignments: filteredAssignments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get assignment by ID (role-aware)
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.query.role || "student";
    const assignment = getAssignmentById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // If student, remove hidden test cases
    const filteredAssignment = userRole === "student"
      ? { ...assignment, hiddenTestCases: [] }
      : assignment;

    res.json({
      success: true,
      assignment: filteredAssignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get assignments by teacher
router.get("/teacher/:teacherId", (req, res) => {
  try {
    const { teacherId } = req.params;
    const assignments = getAssignmentsByTeacher(teacherId);

    res.json({
      success: true,
      assignments: assignments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (error) {
    console.error("Get teacher assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update assignment (Teacher only)
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if assignment exists
    const existingAssignment = getAssignmentById(id);
    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Validate with Zod (but make id optional for update)
    const validationResult = assignmentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.errors);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const data = validationResult.data;

    // Update assignment (preserve id and createdAt)
    const updatedAssignment = {
      ...existingAssignment,
      title: data.title,
      description: data.description,
      languages: data.languages,
      timeLimit: data.timeLimit,
      memoryLimit: data.memoryLimit,
      ioSpec: data.ioSpec || {},
      constraints: data.constraints || "",
      publicTestCases: data.publicTestCases,
      hiddenTestCases: data.hiddenTestCases || [],
      dueDate: data.dueDate || null,
      updatedAt: new Date().toISOString(),
    };

    const success = updateAssignment(id, updatedAssignment);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        message: "Failed to update assignment",
      });
    }

    // Emit update to all students via WebSocket
    const io = req.app.locals.io;
    if (io) {
      // Don't send hidden test cases to students
      const studentAssignment = {
        ...updatedAssignment,
        hiddenTestCases: [], // Hide hidden test cases
      };
      io.to("all-students").emit("assignment-updated", studentAssignment);
    }

    res.json({
      success: true,
      message: "Assignment updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;

