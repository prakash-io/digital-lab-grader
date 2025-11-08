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
import { runCodeInSandbox, compareOutputs } from "../utils/sandbox.js";
import {
  analyzeComplexity,
  calculateCorrectnessScore,
  calculateEfficiencyScore,
  calculateCodeQualityScore,
  calculateTotalScore,
} from "../utils/scoring.js";
import { createOrUpdateGrade } from "../utils/dataStorage.js";

// Fallback function to process submission synchronously (when Redis is not available)
async function processSubmissionSynchronously(submission, data) {
  try {
    updateSubmission(submission.id, {
      status: "processing",
    });

    // Fetch assignment
    const assignment = getAssignmentById(data.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Run public test cases
    const publicTestResults = [];
    const publicTestCases = assignment.publicTestCases || [];
    
    for (let i = 0; i < publicTestCases.length; i++) {
      const testCase = publicTestCases[i];
      const result = await runCodeInSandbox({
        code: data.code,
        language: data.language,
        input: testCase.input,
        timeLimit: assignment.timeLimit,
        memoryLimit: assignment.memoryLimit,
      });

      const passed = result.success && compareOutputs(result.stdout, testCase.expectedOutput);

      publicTestResults.push({
        testCaseIndex: i,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.stdout,
        passed,
        executionTime: result.executionTime,
        stderr: result.stderr,
        exitCode: result.exitCode,
        scale: testCase.scale || 1,
      });
    }

    // Run hidden test cases
    const hiddenTestResults = [];
    const hiddenTestCases = assignment.hiddenTestCases || [];
    
    for (let i = 0; i < hiddenTestCases.length; i++) {
      const testCase = hiddenTestCases[i];
      const result = await runCodeInSandbox({
        code: data.code,
        language: data.language,
        input: testCase.input,
        timeLimit: assignment.timeLimit,
        memoryLimit: assignment.memoryLimit,
      });

      const passed = result.success && compareOutputs(result.stdout, testCase.expectedOutput);

      hiddenTestResults.push({
        testCaseIndex: i,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.stdout,
        passed,
        executionTime: result.executionTime,
        stderr: result.stderr,
        exitCode: result.exitCode,
        scale: testCase.scale || 1,
      });
    }

    // Analyze complexity
    const allTestResults = [...publicTestResults, ...hiddenTestResults];
    const complexity = analyzeComplexity(allTestResults);

    // Calculate scores
    const correctnessScore = calculateCorrectnessScore(publicTestResults, hiddenTestResults);
    const efficiencyScore = calculateEfficiencyScore(complexity, allTestResults, null);
    const codeQuality = calculateCodeQualityScore(data.code, data.language);
    const totalScore = calculateTotalScore(correctnessScore, efficiencyScore.score, codeQuality.score);

    // Prepare results
    const results = {
      publicTestResults,
      hiddenTestResults,
      complexity,
      scores: {
        correctness: correctnessScore,
        efficiency: efficiencyScore,
        codeQuality: codeQuality.score,
        total: totalScore,
      },
      feedback: {
        correctness: `Passed ${publicTestResults.filter((r) => r.passed).length}/${publicTestResults.length} public tests and ${hiddenTestResults.filter((r) => r.passed).length}/${hiddenTestResults.length} hidden tests`,
        efficiency: `Complexity: ${complexity}. Efficiency score based on algorithm analysis.`,
        codeQuality: codeQuality.feedback.join("; "),
      },
      status: "completed",
      gradedAt: new Date().toISOString(),
    };

    // Calculate average runtime
    const avgRuntime = allTestResults.length > 0
      ? allTestResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) / allTestResults.length
      : 0;

    // Update submission with results
    updateSubmission(submission.id, {
      status: "graded",
      results,
      runtime: avgRuntime,
      graded: true,
      grade: totalScore * 10, // Convert to 0-100 scale
    });

    // Create or update grade
    createOrUpdateGrade({
      assignmentId: data.assignmentId,
      submissionId: submission.id,
      studentId: data.studentId,
      grade: totalScore * 10, // Convert to 0-100 scale
      runtime: avgRuntime,
      teacherId: assignment.teacherId,
      feedback: JSON.stringify(results.feedback),
    });
  } catch (error) {
    console.error("Synchronous processing error:", error);
    updateSubmission(submission.id, {
      status: "error",
      error: error.message,
      graded: false,
    });
    throw error;
  }
}

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
      const { isQueueReady } = await import("../utils/jobQueue.js");
      
      if (submissionQueue && typeof submissionQueue.add === "function" && isQueueReady()) {
        try {
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
        } catch (queueError) {
          // Handle connection closed or other queue errors
          if (queueError.message && queueError.message.includes("Connection is closed")) {
            console.error("Redis connection closed. Processing submission synchronously as fallback.");
            // Fallback: Process submission synchronously
            await processSubmissionSynchronously(submission, data);
          } else {
            throw queueError;
          }
        }
      } else {
        // If Redis is not available, process synchronously as fallback
        console.warn("Redis queue not available. Processing submission synchronously as fallback.");
        await processSubmissionSynchronously(submission, data);
      }
    } catch (queueError) {
      console.error("Error adding job to queue:", queueError);
      // Fallback: Try to process synchronously
      try {
        await processSubmissionSynchronously(submission, data);
      } catch (syncError) {
        // If synchronous processing also fails, mark as error
        updateSubmission(submission.id, {
          status: "error",
          error: syncError.message || "Failed to process submission. Please try again.",
        });
      }
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

