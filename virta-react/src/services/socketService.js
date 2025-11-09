import { io } from "socket.io-client";

// Socket.IO connection URL - uses environment variable or falls back to localhost
const getSocketUrl = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (socketUrl && socketUrl.trim()) {
    return socketUrl.trim().replace(/\/$/, '');
  }
  // Fallback to API URL if Socket URL not set
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.trim()) {
    return apiUrl.trim().replace(/\/$/, '');
  }
  return "http://localhost:3001";
};

const SOCKET_URL = getSocketUrl();

let socket = null;

export const socketService = {
  connect() {
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ["websocket"],
      });
    }
    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  joinStudentRoom(studentId) {
    if (socket) {
      socket.emit("join-student-room", studentId);
    }
  },

  joinTeacherRoom(teacherId) {
    if (socket) {
      socket.emit("join-teacher-room", teacherId);
    }
  },

  joinAllStudents() {
    if (socket) {
      socket.emit("join-all-students");
    }
  },

  onNewAssignment(callback) {
    if (socket) {
      socket.on("new-assignment", callback);
    }
  },

  onNewAnnouncement(callback) {
    if (socket) {
      socket.on("new-announcement", callback);
    }
  },

  onNewNotification(callback) {
    if (socket) {
      socket.on("new-notification", callback);
    }
  },

  off(event, callback) {
    if (socket) {
      socket.off(event, callback);
    }
  },
};

