import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { mkdirSync } from "fs";
import { readUsers } from "./users.js";

const DATA_DIR = join(__dirname, "../data");

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// File paths
const ASSIGNMENTS_FILE = join(DATA_DIR, "assignments.json");
const SUBMISSIONS_FILE = join(DATA_DIR, "submissions.json");
const ANNOUNCEMENTS_FILE = join(DATA_DIR, "announcements.json");
const NOTIFICATIONS_FILE = join(DATA_DIR, "notifications.json");
const GRADES_FILE = join(DATA_DIR, "grades.json");

// Initialize files if they don't exist
const initFile = (filePath, defaultValue = []) => {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
};

initFile(ASSIGNMENTS_FILE);
initFile(SUBMISSIONS_FILE);
initFile(ANNOUNCEMENTS_FILE);
initFile(NOTIFICATIONS_FILE);
initFile(GRADES_FILE);

// Assignments
export function readAssignments() {
  try {
    const data = readFileSync(ASSIGNMENTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading assignments:", error);
    return [];
  }
}

export function saveAssignments(assignments) {
  try {
    writeFileSync(ASSIGNMENTS_FILE, JSON.stringify(assignments, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving assignments:", error);
    return false;
  }
}

export function createAssignment(assignment) {
  const assignments = readAssignments();
  assignments.push(assignment);
  return saveAssignments(assignments);
}

export function getAssignmentById(id) {
  const assignments = readAssignments();
  return assignments.find((a) => a.id === id);
}

export function getAssignmentsByTeacher(teacherId) {
  const assignments = readAssignments();
  return assignments.filter((a) => a.teacherId === teacherId);
}

export function updateAssignment(id, updates) {
  const assignments = readAssignments();
  const index = assignments.findIndex((a) => a.id === id);
  if (index !== -1) {
    assignments[index] = { ...assignments[index], ...updates, updatedAt: new Date().toISOString() };
    return saveAssignments(assignments);
  }
  return false;
}

// Submissions
export function readSubmissions() {
  try {
    const data = readFileSync(SUBMISSIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading submissions:", error);
    return [];
  }
}

export function saveSubmissions(submissions) {
  try {
    writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving submissions:", error);
    return false;
  }
}

export function createSubmission(submission) {
  const submissions = readSubmissions();
  submissions.push(submission);
  return saveSubmissions(submissions);
}

export function getSubmissionsByAssignment(assignmentId) {
  const submissions = readSubmissions();
  return submissions.filter((s) => s.assignmentId === assignmentId);
}

export function getSubmissionsByStudent(studentId) {
  const submissions = readSubmissions();
  return submissions.filter((s) => s.studentId === studentId);
}

export function getSubmissionById(id) {
  const submissions = readSubmissions();
  return submissions.find((s) => s.id === id);
}

export function updateSubmission(id, updates) {
  const submissions = readSubmissions();
  const index = submissions.findIndex((s) => s.id === id);
  if (index !== -1) {
    submissions[index] = { ...submissions[index], ...updates, updatedAt: new Date().toISOString() };
    return saveSubmissions(submissions);
  }
  return false;
}

// Announcements
export function readAnnouncements() {
  try {
    const data = readFileSync(ANNOUNCEMENTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading announcements:", error);
    return [];
  }
}

export function saveAnnouncements(announcements) {
  try {
    writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving announcements:", error);
    return false;
  }
}

export function createAnnouncement(announcement) {
  const announcements = readAnnouncements();
  announcements.push(announcement);
  return saveAnnouncements(announcements);
}

export function getAnnouncements() {
  return readAnnouncements().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Notifications
export function readNotifications() {
  try {
    const data = readFileSync(NOTIFICATIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading notifications:", error);
    return [];
  }
}

export function saveNotifications(notifications) {
  try {
    writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving notifications:", error);
    return false;
  }
}

export function createNotification(notification) {
  const notifications = readNotifications();
  notifications.push(notification);
  return saveNotifications(notifications);
}

export function getNotificationsByUserId(userId) {
  const notifications = readNotifications();
  return notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function markNotificationAsRead(notificationId) {
  const notifications = readNotifications();
  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index !== -1) {
    notifications[index].read = true;
    return saveNotifications(notifications);
  }
  return false;
}

export function markAllNotificationsAsRead(userId) {
  const notifications = readNotifications();
  notifications.forEach((n) => {
    if (n.userId === userId && !n.read) {
      n.read = true;
    }
  });
  return saveNotifications(notifications);
}

// Grades
export function readGrades() {
  try {
    const data = readFileSync(GRADES_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading grades:", error);
    return [];
  }
}

export function saveGrades(grades) {
  try {
    writeFileSync(GRADES_FILE, JSON.stringify(grades, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving grades:", error);
    return false;
  }
}

export function createOrUpdateGrade(grade) {
  const grades = readGrades();
  const index = grades.findIndex(
    (g) => g.submissionId === grade.submissionId && g.assignmentId === grade.assignmentId
  );
  if (index !== -1) {
    grades[index] = { ...grades[index], ...grade };
  } else {
    grades.push(grade);
  }
  return saveGrades(grades);
}

export function getGradesByAssignment(assignmentId) {
  const grades = readGrades();
  return grades.filter((g) => g.assignmentId === assignmentId);
}

export function getGradesByStudent(studentId) {
  const grades = readGrades();
  return grades.filter((g) => g.studentId === studentId);
}

// Leaderboard - Update user score for an assignment
export function updateUserScoreForAssignment(studentId, assignmentId, score) {
  const users = readUsers();
  const userIndex = users.findIndex((u) => u.id === studentId);
  
  if (userIndex === -1) {
    console.warn(`User ${studentId} not found for score update`);
    return false;
  }

  // Initialize assignmentScores if it doesn't exist
  if (!users[userIndex].assignmentScores) {
    users[userIndex].assignmentScores = {};
  }

  // Get previous score for this assignment (if any)
  const previousScore = users[userIndex].assignmentScores[assignmentId] || 0;
  
  // Replace old score with new score (don't add, replace)
  users[userIndex].assignmentScores[assignmentId] = score;

  // Recalculate total score
  const assignmentScores = Object.values(users[userIndex].assignmentScores);
  users[userIndex].score = assignmentScores.reduce((sum, s) => sum + (s || 0), 0);

  // Save updated users - we need to use the same file path as users.js
  const USERS_FILE = join(__dirname, "../data/users.json");
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  console.log(`Updated score for user ${studentId}: Assignment ${assignmentId} = ${score} (was ${previousScore}), Total = ${users[userIndex].score}`);
  
  return true;
}

// Leaderboard - Get all users with scores
export function getLeaderboard() {
  const users = readUsers();
  
  // Filter only students and sort by score (descending)
  const students = users
    .filter((u) => u.userType === "student" || !u.userType)
    .map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      score: u.score || 0,
      assignmentScores: u.assignmentScores || {},
    }))
    .sort((a, b) => b.score - a.score)
    .map((student, index) => ({
      ...student,
      rank: index + 1,
    }));
  
  return students;
}

