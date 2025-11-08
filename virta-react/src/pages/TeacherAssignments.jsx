import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconInfoCircle,
  IconClipboardCheck,
  IconPlus,
  IconX,
  IconEdit,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";
import { assignmentService } from "../services/apiService";
import { socketService } from "../services/socketService";

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

export default function TeacherAssignments() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [languages, setLanguages] = useState(["python"]);
  const [timeLimit, setTimeLimit] = useState(5000);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [constraints, setConstraints] = useState("");
  const [publicTestCases, setPublicTestCases] = useState([{ input: "", expectedOutput: "", isPublic: true, scale: 1 }]);
  const [hiddenTestCases, setHiddenTestCases] = useState([{ input: "", expectedOutput: "", isPublic: false, scale: 1 }]);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== "instructor") {
      navigate("/signup");
    } else {
      loadAssignments();
      const socket = socketService.connect();
      socketService.joinTeacherRoom(user.id);

      socket.on("new-assignment", (assignment) => {
        setAssignments((prev) => [assignment, ...prev]);
      });

      return () => {
        socketService.off("new-assignment");
      };
    }
  }, [isAuthenticated, user, navigate]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentService.getAssignmentsByTeacher(user.id);
      setAssignments(response.assignments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLanguages(["python"]);
    setTimeLimit(5000);
    setMemoryLimit(256);
    setInputFormat("");
    setOutputFormat("");
    setConstraints("");
    setPublicTestCases([{ input: "", expectedOutput: "", isPublic: true, scale: 1 }]);
    setHiddenTestCases([{ input: "", expectedOutput: "", isPublic: false, scale: 1 }]);
    setDueDate("");
    setEditingAssignmentId(null);
    setShowCreateForm(false);
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignmentId(assignment.id);
    setTitle(assignment.title || "");
    setDescription(assignment.description || "");
    setLanguages(assignment.languages || ["python"]);
    setTimeLimit(assignment.timeLimit || 5000);
    setMemoryLimit(assignment.memoryLimit || 256);
    setInputFormat(assignment.ioSpec?.inputFormat || "");
    setOutputFormat(assignment.ioSpec?.outputFormat || "");
    setConstraints(assignment.constraints || "");
    setPublicTestCases(
      assignment.publicTestCases && assignment.publicTestCases.length > 0
        ? assignment.publicTestCases.map(tc => ({ ...tc, isPublic: true }))
        : [{ input: "", expectedOutput: "", isPublic: true, scale: 1 }]
    );
    setHiddenTestCases(
      assignment.hiddenTestCases && assignment.hiddenTestCases.length > 0
        ? assignment.hiddenTestCases.map(tc => ({ ...tc, isPublic: false }))
        : [{ input: "", expectedOutput: "", isPublic: false, scale: 1 }]
    );
    setDueDate(assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : "");
    setShowCreateForm(true);
    setError("");
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setError("");

    // Filter out empty test cases
    const validPublicTestCases = publicTestCases
      .filter(tc => tc.input && tc.input.trim() && tc.expectedOutput && tc.expectedOutput.trim())
      .map(tc => ({
        input: tc.input.trim(),
        expectedOutput: tc.expectedOutput.trim(),
        isPublic: true,
        scale: tc.scale && !isNaN(tc.scale) ? parseInt(tc.scale) : 1,
      }));

    const validHiddenTestCases = hiddenTestCases
      .filter(tc => tc.input && tc.input.trim() && tc.expectedOutput && tc.expectedOutput.trim())
      .map(tc => ({
        input: tc.input.trim(),
        expectedOutput: tc.expectedOutput.trim(),
        isPublic: false,
        scale: tc.scale && !isNaN(tc.scale) ? parseInt(tc.scale) : 1,
      }));

    // Validate required fields
    if (!title || !title.trim()) {
      setError("Title is required");
      return;
    }

    if (!description || !description.trim()) {
      setError("Description is required");
      return;
    }

    if (languages.length === 0) {
      setError("At least one language must be selected");
      return;
    }

    if (validPublicTestCases.length === 0) {
      setError("At least one public test case with valid input and expected output is required");
      return;
    }

    try {
      setLoading(true);
      
      const assignmentData = {
        title: title.trim(),
        description: description.trim(),
        languages,
        timeLimit: parseInt(timeLimit) || 5000,
        memoryLimit: parseInt(memoryLimit) || 256,
        ioSpec: {
          inputFormat: inputFormat?.trim() || undefined,
          outputFormat: outputFormat?.trim() || undefined,
          constraints: constraints?.trim() || undefined,
        },
        constraints: constraints?.trim() || "",
        publicTestCases: validPublicTestCases,
        hiddenTestCases: validHiddenTestCases,
        teacherId: user.id,
        teacherName: user.username || user.name || "Teacher",
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };
      
      if (editingAssignmentId) {
        // Update existing assignment
        await assignmentService.updateAssignment(editingAssignmentId, assignmentData);
      } else {
        // Create new assignment
        await assignmentService.createAssignment(assignmentData);
      }

      resetForm();
      await loadAssignments();
    } catch (err) {
      console.error("Assignment error:", err);
      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(e => `${e.path}: ${e.message}`).join(", ");
        setError(`Validation error: ${errorMessages}`);
      } else {
        setError(err.response?.data?.message || err.message || `Failed to ${editingAssignmentId ? "update" : "create"} assignment`);
      }
    } finally {
      setLoading(false);
    }
  };

  const addPublicTestCase = () => {
    setPublicTestCases([...publicTestCases, { input: "", expectedOutput: "", isPublic: true, scale: 1 }]);
  };

  const removePublicTestCase = (index) => {
    setPublicTestCases(publicTestCases.filter((_, i) => i !== index));
  };

  const updatePublicTestCase = (index, field, value) => {
    const updated = [...publicTestCases];
    if (field === "scale") {
      updated[index][field] = typeof value === "number" ? value : (parseInt(value) || 1);
    } else {
      updated[index][field] = value;
    }
    setPublicTestCases(updated);
  };

  const addHiddenTestCase = () => {
    setHiddenTestCases([...hiddenTestCases, { input: "", expectedOutput: "", isPublic: false, scale: 1 }]);
  };

  const removeHiddenTestCase = (index) => {
    setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== index));
  };

  const updateHiddenTestCase = (index, field, value) => {
    const updated = [...hiddenTestCases];
    if (field === "scale") {
      updated[index][field] = typeof value === "number" ? value : (parseInt(value) || 1);
    } else {
      updated[index][field] = value;
    }
    setHiddenTestCases(updated);
  };

  const toggleLanguage = (lang) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
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
      label: "Assignments",
      href: "#",
      icon: (
        <IconClipboardCheck className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "About Us",
      href: "/about",
      icon: (
        <IconInfoCircle className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
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
          <div className="bg-neutral-100 dark:bg-neutral-800/70 px-4 pt-16 pb-4 md:px-6 md:pt-20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/instructor-dashboard")}
                  className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <IconArrowLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </button>
                <IconClipboardCheck className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
                <h1 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                  Assignments
                </h1>
              </div>
              <button
                onClick={() => {
                  if (showCreateForm) {
                    resetForm();
                  } else {
                    setShowCreateForm(true);
                    setEditingAssignmentId(null);
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors w-full sm:w-auto shrink-0"
              >
                <IconPlus className="w-5 h-5" />
                <span className="whitespace-nowrap">{showCreateForm ? "Cancel" : "Create Assignment"}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 md:p-10">
            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-white dark:bg-neutral-800 rounded-lg border border-purple-200 dark:border-purple-800 p-6"
              >
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">
                  {editingAssignmentId ? "Edit Assignment" : "Create New Assignment"}
                </h2>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                        Languages
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["python", "javascript", "java", "cpp", "c"].map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={cn(
                              "px-3 py-1 rounded-lg text-sm transition-colors",
                              languages.includes(lang)
                                ? "bg-purple-600 text-white"
                                : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700"
                            )}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                        Time Limit (ms)
                      </label>
                      <input
                        type="number"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value) || 5000)}
                        min="1000"
                        max="30000"
                        className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                        Memory Limit (MB)
                      </label>
                      <input
                        type="number"
                        value={memoryLimit}
                        onChange={(e) => setMemoryLimit(parseInt(e.target.value) || 256)}
                        min="64"
                        max="1024"
                        className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                        Due Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                      Input Format (Optional)
                    </label>
                    <textarea
                      value={inputFormat}
                      onChange={(e) => setInputFormat(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
                      placeholder="Describe the input format..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                      Output Format (Optional)
                    </label>
                    <textarea
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
                      placeholder="Describe the output format..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                      Constraints (Optional)
                    </label>
                    <textarea
                      value={constraints}
                      onChange={(e) => setConstraints(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
                      placeholder="e.g., 1 ≤ n ≤ 10^5"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-300">
                        Public Test Cases (Visible to students)
                      </label>
                      <button
                        type="button"
                        onClick={addPublicTestCase}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Add Public Test Case
                      </button>
                    </div>
                    {publicTestCases.map((testCase, index) => (
                      <div key={index} className="mb-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            Public Test Case {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePublicTestCase(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-xs text-purple-600 dark:text-purple-400 mb-1">
                              Input
                            </label>
                            <textarea
                              value={testCase.input}
                              onChange={(e) => updatePublicTestCase(index, "input", e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-purple-600 dark:text-purple-400 mb-1">
                              Expected Output
                            </label>
                            <textarea
                              value={testCase.expectedOutput}
                              onChange={(e) => updatePublicTestCase(index, "expectedOutput", e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-purple-600 dark:text-purple-400 mb-1">
                            Scale (for complexity analysis)
                          </label>
                          <input
                            type="number"
                            value={testCase.scale || 1}
                            onChange={(e) => {
                              const value = e.target.value === "" ? 1 : parseInt(e.target.value) || 1;
                              updatePublicTestCase(index, "scale", value);
                            }}
                            min="1"
                            className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-300">
                        Hidden Test Cases (Not visible to students)
                      </label>
                      <button
                        type="button"
                        onClick={addHiddenTestCase}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Add Hidden Test Case
                      </button>
                    </div>
                    {hiddenTestCases.map((testCase, index) => (
                      <div key={index} className="mb-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            Hidden Test Case {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeHiddenTestCase(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-xs text-purple-600 dark:text-purple-400 mb-1">
                              Input
                            </label>
                            <textarea
                              value={testCase.input}
                              onChange={(e) => updateHiddenTestCase(index, "input", e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-purple-600 dark:text-purple-400 mb-1">
                              Expected Output
                            </label>
                            <textarea
                              value={testCase.expectedOutput}
                              onChange={(e) => updateHiddenTestCase(index, "expectedOutput", e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-purple-600 dark:text-purple-400 mb-1">
                            Scale (for complexity analysis)
                          </label>
                          <input
                            type="number"
                            value={testCase.scale || 1}
                            onChange={(e) => {
                              const value = e.target.value === "" ? 1 : parseInt(e.target.value) || 1;
                              updateHiddenTestCase(index, "scale", value);
                            }}
                            min="1"
                            className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading
                        ? editingAssignmentId
                          ? "Updating..."
                          : "Creating..."
                        : editingAssignmentId
                        ? "Update Assignment"
                        : "Create Assignment"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="text-center py-12 text-purple-600 dark:text-purple-400">
                  No assignments created yet. Create your first assignment!
                </div>
              ) : (
                assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    onClick={() => handleEditAssignment(assignment)}
                    className="bg-white dark:bg-neutral-800 rounded-lg border border-purple-200 dark:border-purple-800 p-6 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                          {assignment.title}
                        </h3>
                        <div className="text-purple-600 dark:text-purple-400 mb-4 line-clamp-2 whitespace-pre-wrap">
                          {assignment.description}
                        </div>
                        <div className="text-sm text-purple-500 dark:text-purple-500">
                          Created: {new Date(assignment.createdAt).toLocaleDateString()}
                          {assignment.dueDate && (
                            <span className="ml-4">
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex gap-4 text-sm text-purple-500 dark:text-purple-500">
                          <span>Languages: {assignment.languages?.join(", ") || "N/A"}</span>
                          <span>Time Limit: {assignment.timeLimit || 5000}ms</span>
                          <span>Memory: {assignment.memoryLimit || 256}MB</span>
                        </div>
                        <div className="mt-2 text-sm text-purple-500 dark:text-purple-500">
                          Public Tests: {assignment.publicTestCases?.length || 0} | Hidden Tests: {assignment.hiddenTestCases?.length || 0}
                        </div>
                      </div>
                      <div className="ml-4 text-purple-600 dark:text-purple-400 flex-shrink-0">
                        <IconEdit className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

