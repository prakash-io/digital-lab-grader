import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";

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

