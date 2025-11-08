import express from "express";
import rateLimit from "express-rate-limit";
import { runPublicTestsSchema } from "../utils/validation.js";
import { getAssignmentById } from "../utils/dataStorage.js";
import { runCodeInSandbox, compareOutputs } from "../utils/sandbox.js";

const router = express.Router();

// Rate limiting: 10 requests per minute per IP
const runPublicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Run public tests only
router.post("/", runPublicLimiter, async (req, res) => {
  try {
    // Validate request
    const validationResult = runPublicTestsSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors,
      });
    }

    const { assignmentId, code, language } = validationResult.data;

    // Get assignment
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if language is allowed (handle backward compatibility)
    let allowedLanguages = assignment.languages;
    if (!allowedLanguages || !Array.isArray(allowedLanguages)) {
      // Default to python if no languages specified (old format)
      allowedLanguages = ["python"];
    }

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `Language ${language} is not allowed for this assignment. Allowed languages: ${allowedLanguages.join(", ")}`,
      });
    }

    // Check if public test cases exist (handle backward compatibility)
    let publicTestCases = assignment.publicTestCases;
    
    // If old format (testCases array), convert to publicTestCases
    if (!publicTestCases && assignment.testCases && Array.isArray(assignment.testCases)) {
      publicTestCases = assignment.testCases.map(tc => ({
        input: tc.input || "",
        expectedOutput: tc.expectedOutput || "",
        isPublic: true,
        scale: 1,
      }));
    }
    
    if (!publicTestCases || !Array.isArray(publicTestCases) || publicTestCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Assignment has no public test cases",
      });
    }

    // Run only public test cases
    const results = [];
    for (const testCase of publicTestCases) {
      const sandboxResult = await runCodeInSandbox({
        code,
        language,
        input: testCase.input || "",
        timeLimit: assignment.timeLimit || 5000,
        memoryLimit: assignment.memoryLimit || 256,
      }).catch((error) => {
        console.error("Sandbox error for test case:", error);
        return {
          success: false,
          error: error.message,
          stdout: "",
          stderr: error.message,
          exitCode: -1,
          executionTime: 0,
        };
      });

      if (!sandboxResult.success) {
        results.push({
          input: testCase.input || "",
          expectedOutput: testCase.expectedOutput || "",
          actualOutput: "",
          passed: false,
          executionTime: 0,
          stderr: sandboxResult.error || sandboxResult.stderr || "Execution failed",
          exitCode: -1,
        });
        continue;
      }

      const passed = compareOutputs(
        sandboxResult.stdout || "",
        testCase.expectedOutput || ""
      );

      results.push({
        input: testCase.input || "",
        expectedOutput: testCase.expectedOutput || "",
        actualOutput: sandboxResult.stdout || "",
        passed,
        executionTime: sandboxResult.executionTime || 0,
        stderr: sandboxResult.stderr || "",
        exitCode: sandboxResult.exitCode || 0,
      });
    }

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    res.json({
      success: true,
      results,
      summary: {
        passed: passedCount,
        total: totalCount,
        passRate: totalCount > 0 ? passedCount / totalCount : 0,
      },
    });
  } catch (error) {
    console.error("Run public tests error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;

