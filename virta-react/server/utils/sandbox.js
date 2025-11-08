// Sandbox execution utilities for running code securely
// This uses Piston API as a sandbox solution

export async function runCodeInSandbox({ code, language, input, timeLimit, memoryLimit }) {
  try {
    const startTime = Date.now();
    
    // Map language names to Piston language identifiers
    const languageMap = {
      python: "python",
      javascript: "javascript",
      java: "java",
      cpp: "cpp",
      c: "c",
    };

    const pistonLanguage = languageMap[language] || language;

    // Map language to file extension for Piston API
    const fileExtensionMap = {
      python: "py",
      javascript: "js",
      java: "java",
      cpp: "cpp",
      c: "c",
    };

    const fileExtension = fileExtensionMap[language] || "txt";
    // Java requires Main.java, other languages use main.{ext}
    const fileName = language === "java" ? "Main.java" : `main.${fileExtension}`;

    // Prepare files array - ONLY the source code, NOT stdin
    // Piston API expects files with proper extensions
    const files = [
      {
        name: fileName,
        content: code,
      },
    ];

    let response;
    const timeout = (timeLimit || 5000) + 10000; // Add 10s buffer
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: pistonLanguage,
          version: "*",
          files: files,
          stdin: input || "",
          compile_timeout: Math.min(timeLimit || 10000, 10000),
          run_timeout: timeLimit || 5000,
          compile_memory_limit: (memoryLimit || 256) * 1024 * 1024, // Convert MB to bytes
          run_memory_limit: (memoryLimit || 256) * 1024 * 1024,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError" || fetchError.name === "TimeoutError") {
        throw new Error("Code execution timed out");
      }
      throw new Error(`Failed to connect to sandbox: ${fetchError.message}`);
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Sandbox execution failed: ${response.status} ${errorText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(`Failed to parse sandbox response: ${parseError.message}`);
    }

    return {
      success: true,
      stdout: data.run?.stdout || "",
      stderr: data.run?.stderr || "",
      exitCode: data.run?.code || 0,
      executionTime: executionTime,
      compileTime: data.compile?.time || 0,
      runTime: data.run?.time || 0,
      memory: data.run?.memory || 0,
    };
  } catch (error) {
    console.error("Sandbox execution error:", error);
    return {
      success: false,
      error: error.message,
      stdout: "",
      stderr: error.message,
      exitCode: -1,
      executionTime: 0,
    };
  }
}

// Normalize output for comparison
export function normalizeOutput(output) {
  if (!output) return "";
  return output
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n+/g, "\n")
    .trim();
}

// Compare outputs
export function compareOutputs(actual, expected) {
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);
  return normalizedActual === normalizedExpected;
}

