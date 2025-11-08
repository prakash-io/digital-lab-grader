import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ThemeToggle } from "./components/ThemeToggle";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import TeacherAssignments from "./pages/TeacherAssignments";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherGrades from "./pages/TeacherGrades";
import StudentAssignments from "./pages/StudentAssignments";
import CodeEditor from "./pages/CodeEditor";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Store from "./pages/Store";
import About from "./pages/About";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/signup" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  // Different animation styles based on route - faster and smoother
  const getAnimation = (pathname) => {
    switch (pathname) {
      case "/dashboard":
      case "/instructor-dashboard":
        return {
          initial: { opacity: 0, x: -15 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 15 },
        };
      case "/code-editor":
        return {
          initial: { opacity: 0, x: 15 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -15 },
        };
      case "/leaderboard":
        return {
          initial: { opacity: 0, y: 15 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -15 },
        };
      case "/store":
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        };
      case "/profile":
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
        };
      case "/signup":
        return {
          initial: { opacity: 0, scale: 0.98 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.98 },
        };
      default:
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
        };
    }
  };

  const animation = getAnimation(location.pathname);

  return (
    <div style={{ 
      position: "relative", 
      width: "100%", 
      height: "100%", 
      backgroundColor: "#0f172a", 
      overflow: "hidden",
      minHeight: "100vh"
    }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={animation.initial}
          animate={animation.animate}
          exit={animation.exit}
          transition={{ 
            duration: 0.2, // Even faster animation (0.2s)
            ease: [0.4, 0, 0.2, 1] // Smooth but fast easing
          }}
          style={{ 
            width: "100%", 
            height: "100%",
            backgroundColor: "#0f172a",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor-dashboard"
              element={
                <ProtectedRoute>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-assignments"
              element={
                <ProtectedRoute>
                  <TeacherAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-students"
              element={
                <ProtectedRoute>
                  <TeacherStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-grades"
              element={
                <ProtectedRoute>
                  <TeacherGrades />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-assignments"
              element={
                <ProtectedRoute>
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/code-editor"
              element={
                <ProtectedRoute>
                  <CodeEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/store"
              element={
                <ProtectedRoute>
                  <Store />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeToggle />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
