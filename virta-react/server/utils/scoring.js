// Scoring utilities for auto-grading

// Complexity bands and their points
const COMPLEXITY_BANDS = {
  "O(1)": 3.0,
  "O(log n)": 2.7,
  "O(n)": 2.2,
  "O(n log n)": 1.6,
  "O(n²)": 0.8,
  "O(n³)": 0.3,
  "O(2^n)": 0.1,
  "O(n!)": 0.0,
};

// Analyze complexity based on runtime data
export function analyzeComplexity(testResults) {
  // Simple heuristic: analyze how runtime scales with input size
  // This is a simplified version - in production, you'd use more sophisticated analysis
  
  if (!testResults || testResults.length < 2) {
    return "O(n)"; // Default
  }

  // Sort by input scale
  const sorted = testResults
    .filter((t) => t.scale && t.executionTime)
    .sort((a, b) => a.scale - b.scale);

  if (sorted.length < 2) {
    return "O(n)";
  }

  // Calculate growth rate
  const scales = sorted.map((t) => t.scale);
  const times = sorted.map((t) => t.executionTime);

  // Simple analysis: check if it's constant, logarithmic, linear, or quadratic
  const firstScale = scales[0];
  const lastScale = scales[scales.length - 1];
  const firstTime = times[0];
  const lastTime = times[times.length - 1];

  const scaleRatio = lastScale / firstScale;
  const timeRatio = lastTime / firstTime;

  if (timeRatio < 1.2) {
    return "O(1)";
  } else if (timeRatio < Math.log(scaleRatio) * 1.5) {
    return "O(log n)";
  } else if (timeRatio < scaleRatio * 1.5) {
    return "O(n)";
  } else if (timeRatio < scaleRatio * Math.log(scaleRatio) * 1.5) {
    return "O(n log n)";
  } else if (timeRatio < scaleRatio * scaleRatio * 1.5) {
    return "O(n²)";
  } else {
    return "O(n³)";
  }
}

// Calculate correctness score (0-6)
export function calculateCorrectnessScore(publicResults, hiddenResults) {
  const publicPassRate = publicResults.length > 0
    ? publicResults.filter((r) => r.passed).length / publicResults.length
    : 0;

  const hiddenPassRate = hiddenResults.length > 0
    ? hiddenResults.filter((r) => r.passed).length / hiddenResults.length
    : 0;

  // Weighted: 30% public, 70% hidden
  const weightedPassRate = 0.3 * publicPassRate + 0.7 * hiddenPassRate;
  return 6 * weightedPassRate;
}

// Calculate efficiency score (0-3)
export function calculateEfficiencyScore(complexity, testResults, baseRuntime) {
  // Get complexity band points
  const complexityPoints = COMPLEXITY_BANDS[complexity] || 0.5;

  // Calculate runtime factor
  // If we have a base runtime, compare against it
  let runtimeFactor = 1.0;
  if (baseRuntime && testResults.length > 0) {
    const avgRuntime = testResults.reduce((sum, t) => sum + (t.executionTime || 0), 0) / testResults.length;
    const ratio = baseRuntime / avgRuntime;
    runtimeFactor = Math.max(0.6, Math.min(1.0, ratio));
  }

  // If less than 80% tests pass, cap efficiency at 50%
  const passRate = testResults.filter((r) => r.passed).length / testResults.length;
  if (passRate < 0.8) {
    runtimeFactor = Math.min(runtimeFactor, 0.5);
  }

  return complexityPoints * runtimeFactor;
}

// Calculate code quality score (0-1)
export function calculateCodeQualityScore(code, language) {
  let score = 1.0;
  const feedback = [];

  // Check for obvious issues
  const codeLower = code.toLowerCase();

  // Check for infinite loops (simple heuristic)
  if (language === "python") {
    if (codeLower.includes("while true:") && !codeLower.includes("break")) {
      score -= 0.3;
      feedback.push("Potential infinite loop detected");
    }
  } else if (language === "javascript") {
    if (codeLower.includes("while(true)") && !codeLower.includes("break")) {
      score -= 0.3;
      feedback.push("Potential infinite loop detected");
    }
  }

  // Check for busy-wait patterns
  if (codeLower.includes("while") && codeLower.includes("time.sleep") && !codeLower.includes("break")) {
    score -= 0.2;
    feedback.push("Potential busy-wait pattern");
  }

  // Check code structure (basic checks)
  const lines = code.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length < 3) {
    score -= 0.2;
    feedback.push("Code seems too short");
  }

  // Check for reasonable naming (basic check)
  if (codeLower.includes("var1") || codeLower.includes("temp") || codeLower.includes("x =")) {
    score -= 0.1;
    feedback.push("Consider using more descriptive variable names");
  }

  // Check for dead code (very basic)
  if (codeLower.includes("def ") || codeLower.includes("function ")) {
    // Check if functions are called
    const functions = code.match(/(?:def|function)\s+(\w+)/g) || [];
    functions.forEach((func) => {
      const funcName = func.match(/(?:def|function)\s+(\w+)/)[1];
      if (!code.includes(`${funcName}(`)) {
        score -= 0.1;
        feedback.push(`Function ${funcName} is defined but not called`);
      }
    });
  }

  return {
    score: Math.max(0, Math.min(1.0, score)),
    feedback: feedback.length > 0 ? feedback : ["Code quality looks good"],
  };
}

// Calculate total score (0-10)
export function calculateTotalScore(correctness, efficiency, codeQuality) {
  return correctness + efficiency + codeQuality;
}

