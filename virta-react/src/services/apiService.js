// Base API URL - uses environment variable or falls back to localhost
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.trim()) {
    const cleanUrl = apiUrl.trim().replace(/\/$/, '');
    return `${cleanUrl}/api`;
  }
  return "http://localhost:3001/api";
};

const API_BASE_URL = getApiBaseUrl();

// Assignments
export const assignmentService = {
  async createAssignment(assignmentData) {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assignmentData),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "Failed to create assignment");
      error.response = { data };
      throw error;
    }
    return data;
  },

  async getAssignments(role = "student") {
    const response = await fetch(`${API_BASE_URL}/assignments?role=${role}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get assignments");
    }
    return data;
  },

  async getAssignment(id, role = "student") {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}?role=${role}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get assignment");
    }
    return data;
  },

  async getAssignmentsByTeacher(teacherId) {
    const response = await fetch(`${API_BASE_URL}/assignments/teacher/${teacherId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get teacher assignments");
    }
    return data;
  },

  async updateAssignment(id, assignmentData) {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assignmentData),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "Failed to update assignment");
      error.response = { data };
      throw error;
    }
    return data;
  },
};

// Submissions
export const submissionService = {
  async createSubmission(submissionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();
      if (!response.ok) {
        // Provide more detailed error messages
        const errorMessage = data.message || data.error || "Failed to create submission";
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }
      return data;
    } catch (err) {
      // Re-throw with more context if it's a network error
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        throw new Error("Network error: Could not connect to server. Please check your connection.");
      }
      throw err;
    }
  },

  async getSubmission(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${id}`);
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.message || data.error || "Failed to get submission";
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }
      return data;
    } catch (err) {
      // Re-throw with more context if it's a network error
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        throw new Error("Network error: Could not connect to server. Please check your connection.");
      }
      throw err;
    }
  },

  async getSubmissionsByAssignment(assignmentId) {
    const response = await fetch(`${API_BASE_URL}/submissions/assignment/${assignmentId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get submissions");
    }
    return data;
  },

  async getSubmissionsByStudent(studentId) {
    const response = await fetch(`${API_BASE_URL}/submissions/student/${studentId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get student submissions");
    }
    return data;
  },

  async updateSubmission(id, updates) {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update submission");
    }
    return data;
  },
};

// Announcements
export const announcementService = {
  async createAnnouncement(announcementData) {
    const response = await fetch(`${API_BASE_URL}/announcements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(announcementData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create announcement");
    }
    return data;
  },

  async getAnnouncements() {
    const response = await fetch(`${API_BASE_URL}/announcements`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get announcements");
    }
    return data;
  },
};

// Notifications
export const notificationService = {
  async getNotifications(userId) {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get notifications");
    }
    return data;
  },

  async markAsRead(notificationId) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: "PUT",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to mark notification as read");
    }
    return data;
  },

  async markAllAsRead(userId) {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/read-all`, {
      method: "PUT",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to mark all notifications as read");
    }
    return data;
  },
};

// Run Public Tests
export const runPublicService = {
  async runPublicTests(assignmentId, code, language) {
    const response = await fetch(`${API_BASE_URL}/run-public`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assignmentId, code, language }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to run public tests");
    }
    return data;
  },
};

// Grades
export const gradeService = {
  async createOrUpdateGrade(gradeData) {
    const response = await fetch(`${API_BASE_URL}/grades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gradeData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to save grade");
    }
    return data;
  },

  async getGradesByAssignment(assignmentId) {
    const response = await fetch(`${API_BASE_URL}/grades/assignment/${assignmentId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get grades");
    }
    return data;
  },

  async getGradesByStudent(studentId) {
    const response = await fetch(`${API_BASE_URL}/grades/student/${studentId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get student grades");
    }
    return data;
  },
};

// Leaderboard
export const leaderboardService = {
  async getLeaderboard() {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to get leaderboard");
      }
      return data;
    } catch (err) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        throw new Error("Network error: Could not connect to server. Please check your connection.");
      }
      throw err;
    }
  },
};

