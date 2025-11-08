import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconFileText,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";
import { submissionService, gradeService, assignmentService } from "../services/apiService";

const Logo = () => {
  return (
    <Link
      to="/instructor-dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white hover:opacity-80 transition-opacity"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white text-xl tracking-wider"
      >
        VirTA
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      to="/instructor-dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white hover:opacity-80 transition-opacity"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </Link>
  );
};

export default function TeacherGrades() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== "instructor") {
      navigate("/signup");
    } else {
      loadAssignments();
    }
  }, [isAuthenticated, user, navigate]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentService.getAssignmentsByTeacher(user.id);
      setAssignments(response.assignments || []);
    } catch (err) {
      console.error("Error loading assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId) => {
    try {
      setLoading(true);
      const response = await submissionService.getSubmissionsByAssignment(assignmentId);
      setSubmissions(response.submissions || []);
    } catch (err) {
      console.error("Error loading submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId, grade, runtime) => {
    try {
      setLoading(true);
      await gradeService.createOrUpdateGrade({
        assignmentId: selectedAssignment.id,
        submissionId,
        studentId: submissions.find((s) => s.id === submissionId)?.studentId,
        grade,
        runtime,
        teacherId: user.id,
      });
      await loadSubmissions(selectedAssignment.id);
      alert("Grade saved successfully!");
    } catch (err) {
      alert("Error saving grade: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/signup");
  };

  const links = [
    {
      label: "Dashboard",
      href: "/instructor-dashboard",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Grades",
      href: "/teacher-grades",
      icon: (
        <IconFileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handleLogout,
    },
  ];

  if (!isAuthenticated || user?.userType !== "instructor") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col overflow-hidden bg-gray-100 md:flex-row dark:bg-neutral-800",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} onClick={link.onClick} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <div className="bg-neutral-100 dark:bg-neutral-800/70 px-4 pt-4 pb-4 md:px-6 md:pt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/instructor-dashboard")}
                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <IconArrowLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </button>
              <IconFileText className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                Grades
              </h1>
            </div>
          </div>

          <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 md:p-10">
            {!selectedAssignment ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">
                  Select an Assignment to Grade
                </h2>
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-white dark:bg-neutral-800 rounded-lg border border-purple-200 dark:border-purple-800 p-6 cursor-pointer hover:border-purple-400 transition-colors"
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      loadSubmissions(assignment.id);
                    }}
                  >
                    <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                      {assignment.title}
                    </h3>
                    <p className="text-purple-600 dark:text-purple-400">
                      {assignment.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300">
                    {selectedAssignment.title} - Submissions
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedAssignment(null);
                      setSubmissions([]);
                    }}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Back
                  </button>
                </div>

                {submissions.map((submission) => (
                  <GradeSubmissionCard
                    key={submission.id}
                    submission={submission}
                    onGrade={handleGradeSubmission}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GradeSubmissionCard({ submission, onGrade }) {
  const [grade, setGrade] = useState("");
  const [runtime, setRuntime] = useState(submission.runtime || "");
  const [showGradeForm, setShowGradeForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (grade && runtime) {
      onGrade(submission.id, parseFloat(grade), parseFloat(runtime));
      setShowGradeForm(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300">
            {submission.studentName}
          </h3>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            Submitted: {new Date(submission.submittedAt).toLocaleString()}
          </p>
          {submission.runtime && (
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Runtime: {submission.runtime}ms
            </p>
          )}
        </div>
        <button
          onClick={() => setShowGradeForm(!showGradeForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          {showGradeForm ? "Cancel" : "Grade"}
        </button>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Code:</h4>
        <pre className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg text-sm text-purple-900 dark:text-purple-100 overflow-x-auto">
          {submission.code}
        </pre>
      </div>

      {showGradeForm && (
        <form onSubmit={handleSubmit} className="space-y-3 mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Runtime (ms)
            </label>
            <input
              type="number"
              value={runtime}
              onChange={(e) => setRuntime(e.target.value)}
              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Grade (0-100)
            </label>
            <input
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Save Grade
          </button>
        </form>
      )}
    </div>
  );
}

