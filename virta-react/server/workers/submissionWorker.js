import { Worker } from "bullmq";
import { redisConnection, isRedisAvailable } from "../utils/jobQueue.js";
import { runCodeInSandbox, normalizeOutput, compareOutputs } from "../utils/sandbox.js";
import {
  analyzeComplexity,
  calculateCorrectnessScore,
  calculateEfficiencyScore,
  calculateCodeQualityScore,
  calculateTotalScore,
} from "../utils/scoring.js";
import { getAssignmentById } from "../utils/dataStorage.js";
import { updateSubmission, getSubmissionById } from "../utils/dataStorage.js";
import { createOrUpdateGrade, updateUserScoreForAssignment } from "../utils/dataStorage.js";

// Check Redis availability
const redisAvailable = isRedisAvailable();

// Create worker to process submissions (only if Redis is available)
export const submissionWorker = redisAvailable ? new Worker(
  "submissions",
  async (job) => {
    const { submissionId, assignmentId, code, language, studentId } = job.data;

    try {
      // Update job status
      job.updateProgress(10);

      // Fetch assignment
      const assignment = getAssignmentById(assignmentId);
      if (!assignment) {
        throw new Error("Assignment not found");
      }

      job.updateProgress(20);

      // Run public test cases
      const publicTestResults = [];
      for (let i = 0; i < assignment.publicTestCases.length; i++) {
        const testCase = assignment.publicTestCases[i];
        const result = await runCodeInSandbox({
          code,
          language,
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

        job.updateProgress(20 + (i + 1) * (30 / assignment.publicTestCases.length));
      }

      // Run hidden test cases
      const hiddenTestResults = [];
      const hiddenTestCases = assignment.hiddenTestCases || [];
      
      for (let i = 0; i < hiddenTestCases.length; i++) {
        const testCase = hiddenTestCases[i];
        const result = await runCodeInSandbox({
          code,
          language,
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

        const progressStep = hiddenTestCases.length > 0 ? 30 / hiddenTestCases.length : 0;
        job.updateProgress(50 + (i + 1) * progressStep);
      }

      job.updateProgress(80);

      // Analyze complexity
      const allTestResults = [...publicTestResults, ...hiddenTestResults];
      const complexity = analyzeComplexity(allTestResults);

      // Calculate scores
      const correctnessScore = calculateCorrectnessScore(publicTestResults, hiddenTestResults);
      const efficiencyScore = calculateEfficiencyScore(complexity, allTestResults, null);
      const codeQuality = calculateCodeQualityScore(code, language);
      const totalScore = calculateTotalScore(correctnessScore, efficiencyScore.score, codeQuality.score);

      job.updateProgress(90);

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
      updateSubmission(submissionId, {
        status: "graded",
        results,
        runtime: avgRuntime,
        graded: true,
        grade: totalScore * 10, // Convert to 0-100 scale
      });

      // Create or update grade
      const gradeScore = totalScore * 10; // Convert to 0-100 scale
      createOrUpdateGrade({
        assignmentId,
        submissionId,
        studentId,
        grade: gradeScore,
        runtime: avgRuntime,
        teacherId: assignment.teacherId,
        feedback: JSON.stringify(results.feedback),
      });

      // Update user score in leaderboard (replace old score if exists)
      updateUserScoreForAssignment(studentId, assignmentId, gradeScore);

      job.updateProgress(100);

      return results;
    } catch (error) {
      console.error("Worker error:", error);
      
      // Update submission with error
      updateSubmission(submissionId, {
        status: "error",
        error: error.message,
        graded: false,
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3, // Process up to 3 submissions concurrently
  }
) : null;

// Handle worker events (only if worker exists)
if (submissionWorker) {
  submissionWorker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed`);
    setJobStatus(job.id, {
      status: "completed",
      result,
    });
  });

  submissionWorker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
    setJobStatus(job.id, {
      status: "failed",
      error: err.message,
    });
  });

  submissionWorker.on("progress", (job, progress) => {
    setJobStatus(job.id, {
      status: "processing",
      progress,
    });
  });

  console.log("✅ Submission worker started");
} else {
  console.warn("⚠️  Submission worker not started (Redis not available)");
}

