import express from "express";
import {
  createSubmission,
  getSubmissionsByAssignment,
  getSubmissionsByStudent,
  getSubmissionById,
  updateSubmission,
} from "../utils/dataStorage.js";
import { submissionSchema } from "../utils/validation.js";
import { submissionQueue, setJobStatus } from "../utils/jobQueue.js";
import { getAssignmentById } from "../utils/dataStorage.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Create submission (Student) - Enqueue for grading
router.post("/", async (req, res) => {
  try {
    // Validate request
    const validationResult = submissionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors,
      });
    }

    const data = validationResult.data;

    // Verify assignment exists and language is allowed
    const assignment = getAssignmentById(data.assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Handle backward compatibility for old assignments
    let allowedLanguages = assignment.languages;
    if (!allowedLanguages || !Array.isArray(allowedLanguages)) {
      // Default to python if no languages specified (old format)
      allowedLanguages = ["python"];
    }

    if (!allowedLanguages.includes(data.language)) {
      return res.status(400).json({
        success: false,
        message: `Language ${data.language} is not allowed for this assignment. Allowed languages: ${allowedLanguages.join(", ")}`,
      });
    }

    // Create submission
    const submission = {
      id: uuidv4(),
      assignmentId: data.assignmentId,
      studentId: data.studentId,
      studentName: data.studentName || "Student",
      code: data.code,
      language: data.language,
      status: "pending", // pending -> processing -> graded/error
      submittedAt: new Date().toISOString(),
      results: null,
      error: null,
    };

    createSubmission(submission);

    // Update submission status to processing
    updateSubmission(submission.id, {
      status: "processing",
    });

    // Enqueue job for grading
    try {
      // Check if queue is available (Redis)
      if (submissionQueue && typeof submissionQueue.add === "function") {
        const job = await submissionQueue.add("grade-submission", {
          submissionId: submission.id,
          assignmentId: data.assignmentId,
          code: data.code,
          language: data.language,
          studentId: data.studentId,
        }, {
          jobId: submission.id,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        });

        // Set initial job status
        setJobStatus(submission.id, {
          status: "processing",
          jobId: job.id,
        });
      } else {
        // If Redis is not available, mark as error
        console.warn("Redis queue not available. Marking submission as error.");
        updateSubmission(submission.id, {
          status: "error",
          error: "Auto-grading is currently unavailable. Please ensure Redis is running.",
        });
      }
    } catch (queueError) {
      console.error("Error adding job to queue:", queueError);
      // If queue fails, mark submission as error
      updateSubmission(submission.id, {
        status: "error",
        error: queueError.message || "Failed to queue submission for grading. Please ensure Redis is running.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Submission created and queued for grading",
      submission: {
        id: submission.id,
        status: "pending",
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    console.error("Create submission error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get submissions by assignment (Teacher)
router.get("/assignment/:assignmentId", (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submissions = getSubmissionsByAssignment(assignmentId);

    res.json({
      success: true,
      submissions: submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get submissions by student
router.get("/student/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    const submissions = getSubmissionsByStudent(studentId);

    res.json({
      success: true,
      submissions: submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    });
  } catch (error) {
    console.error("Get student submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get submission by ID (for polling status)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const submission = getSubmissionById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Get job status from queue (if available)
    let jobStatus = "unknown";
    let progress = 0;

    if (submissionQueue && typeof submissionQueue.getJob === "function") {
      try {
        const job = await submissionQueue.getJob(id);
        if (job) {
          const state = await job.getState();
          jobStatus = state;
          progress = job.progress || 0;
        }
      } catch (queueError) {
        console.warn("Error getting job status:", queueError.message);
        // Continue with submission status from database
      }
    }

    // Prepare response
    const response = {
      id: submission.id,
      status: submission.status || jobStatus,
      submittedAt: submission.submittedAt,
      progress,
    };

    // Include results if graded
    if (submission.status === "graded" && submission.results) {
      response.results = submission.results;
      // Don't expose hidden test case details to students
      if (submission.results.hiddenTestResults) {
        response.results.hiddenTestResults = submission.results.hiddenTestResults.map((test) => ({
          passed: test.passed,
          executionTime: test.executionTime,
          // Don't include input/output details for hidden tests
        }));
      }
    }

    // Include error if failed
    if (submission.status === "error" || submission.error) {
      response.error = submission.error;
    }

    res.json({
      success: true,
      submission: response,
    });
  } catch (error) {
    console.error("Get submission error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update submission (e.g., update runtime)
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = updateSubmission(id, updates);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.json({
      success: true,
      message: "Submission updated successfully",
      submission: getSubmissionById(id),
    });
  } catch (error) {
    console.error("Update submission error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;

