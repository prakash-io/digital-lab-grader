import { z } from "zod";

// Test case schema
export const testCaseSchema = z.object({
  input: z.string().min(1, "Input is required"),
  expectedOutput: z.string().min(1, "Expected output is required"),
  isPublic: z.boolean().optional().default(false),
  scale: z.union([z.number().int().positive(), z.string().transform(val => {
    const num = parseInt(val);
    return isNaN(num) || num <= 0 ? 1 : num;
  })]).optional().default(1), // For complexity analysis (e.g., input size)
});

// Assignment schema
export const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  languages: z.array(z.enum(["python", "javascript", "java", "cpp", "c"])).min(1, "At least one language is required"),
  timeLimit: z.number().int().positive().default(5000), // milliseconds
  memoryLimit: z.number().int().positive().default(256), // MB
  ioSpec: z.object({
    inputFormat: z.string().optional(),
    outputFormat: z.string().optional(),
    constraints: z.string().optional(),
  }).optional(),
  constraints: z.string().optional(),
  publicTestCases: z.array(testCaseSchema).min(1, "At least one public test case is required"),
  hiddenTestCases: z.array(testCaseSchema).min(0).default([]),
  teacherId: z.string().min(1, "Teacher ID is required"),
  teacherName: z.string().optional(),
  dueDate: z.union([
    z.string().datetime(),
    z.string().transform(val => {
      if (!val || val.trim() === "") return null;
      try {
        // Try to parse and convert to ISO string
        const date = new Date(val);
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
      } catch {
        return null;
      }
    }),
    z.null()
  ]).optional().nullable(),
});

// Submission schema
export const submissionSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  language: z.enum(["python", "javascript", "java", "cpp", "c"]),
});

// Run public tests schema
export const runPublicTestsSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  code: z.string().min(1, "Code is required"),
  language: z.enum(["python", "javascript", "java", "cpp", "c"]),
});

