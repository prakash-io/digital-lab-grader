import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import { Card, CardTitle, CardDescription } from "../components/ui/card-hover-effect";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconInfoCircle,
  IconShoppingBag,
  IconCode,
  IconFileText,
  IconTrophy,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { avatars } from "../utils/avatars";
import { submissionService, runPublicService } from "../services/apiService";

const UserProfileLink = ({ user }) => {
  const [purchasedAvatars, setPurchasedAvatars] = useState([]);
  
  useEffect(() => {
    if (user?.id) {
      const userData = localStorage.getItem(`userData_${user.id}`);
      if (userData) {
        const data = JSON.parse(userData);
        setPurchasedAvatars(data.purchasedAvatars || []);
      }
    }
  }, [user?.id, user?.purchasedAvatars]);

  return (
    <div>
      <SidebarLink
        link={{
          label: (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="truncate max-w-[120px]">{user?.username || "User"}</span>
              {purchasedAvatars.length > 0 && (
                <div className="flex gap-0.5 items-center">
                  {purchasedAvatars.slice(0, 2).map((avatarId) => {
                    const avatar = avatars.find(a => a.id === avatarId);
                    return avatar ? (
                      <img
                        key={avatarId}
                        src={avatar.img}
                        alt={avatar.name}
                        className="w-4 h-4 rounded-full border border-purple-400/50 flex-shrink-0"
                        title={avatar.name}
                      />
                    ) : null;
                  })}
                  {purchasedAvatars.length > 2 && (
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 flex-shrink-0">
                      +{purchasedAvatars.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          ),
          href: "/profile",
          icon: (
            <div className="h-7 w-7 shrink-0 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          ),
        }}
      />
    </div>
  );
};

const Logo = () => {
  return (
    <Link
      to="/dashboard"
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
      to="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white hover:opacity-80 transition-opacity"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </Link>
  );
};

export default function CodeEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState('print("Hello World!")');
  const [output, setOutput] = useState("Your result will appear here...");
  const [isRunningPublicTests, setIsRunningPublicTests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [runtime, setRuntime] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [gradingResults, setGradingResults] = useState(null);
  const [publicTestResults, setPublicTestResults] = useState(null);

  useEffect(() => {
    // Get assignment from route state
    if (location.state?.assignment) {
      setAssignment(location.state.assignment);
      // Set default language if assignment has languages
      if (location.state.assignment.languages && location.state.assignment.languages.length > 0) {
        setLanguage(location.state.assignment.languages[0]);
      }
    }
  }, [location]);

  // Poll submission status
  useEffect(() => {
    if (!submissionId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await submissionService.getSubmission(submissionId);
        setSubmissionStatus(response.submission);

        if (response.submission.status === "graded" && response.submission.results) {
          setGradingResults(response.submission.results);
          setIsSubmitting(false);
          clearInterval(pollInterval);
        } else if (response.submission.status === "error") {
          setIsSubmitting(false);
          setOutput(`Error: ${response.submission.error || "Grading failed"}`);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Error polling submission:", err);
        // Don't clear the interval on error - might be temporary network issue
        // Only clear if it's an auth error (401)
        if (err.message && err.message.includes("401")) {
          setIsSubmitting(false);
          setOutput("Error: Authentication failed. Please refresh the page.");
          clearInterval(pollInterval);
        }
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [submissionId]);

  const handleLogout = () => {
    logout();
    navigate("/signup");
  };

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Leaderboard",
      href: "/leaderboard",
      icon: (
        <IconTrophy className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Store",
      href: "/store",
      icon: (
        <IconShoppingBag className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
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

  // Run button removed - users should use "Test Public" or "Submit" instead

  const handleRunPublicTests = async () => {
    if (!assignment) {
      setOutput("Error: No assignment selected. Please open an assignment from the Assignments page.");
      return;
    }

    setIsRunningPublicTests(true);
    // Don't clear grading results when running public tests
    // Keep the existing output or add test results below it
    const previousOutput = output;
    setOutput("Running public tests...");

    try {
      const response = await runPublicService.runPublicTests(assignment.id, code, language);
      setPublicTestResults(response.results);

      const summary = response.summary;
      const resultsText = response.results.map((result, index) => {
        const status = result.passed ? "✅ PASSED" : "❌ FAILED";
        return `Test Case ${index + 1}: ${status}\n  Input: ${result.input}\n  Expected: ${result.expectedOutput}\n  Got: ${result.actualOutput}\n  Time: ${result.executionTime}ms${result.stderr ? `\n  Error: ${result.stderr}` : ""}`;
      }).join("\n\n");

      // If there are grading results, show them first, then test results
      if (gradingResults) {
        setOutput(
          `--- Grading Results (from previous submission) ---\n\n` +
          `Total Score: ${(gradingResults.scores?.total !== null && gradingResults.scores?.total !== undefined) 
            ? gradingResults.scores.total.toFixed(2) 
            : (gradingResults.scores?.correctness !== undefined && 
                gradingResults.scores?.efficiency !== undefined && 
                gradingResults.scores?.codeQuality !== undefined
                ? (gradingResults.scores.correctness + 
                   (typeof gradingResults.scores.efficiency === 'object' 
                     ? gradingResults.scores.efficiency.score 
                     : gradingResults.scores.efficiency) + 
                   gradingResults.scores.codeQuality).toFixed(2)
                : "0")
          }/10\n` +
          `Correctness: ${gradingResults.scores?.correctness?.toFixed(2) || "0"}/6\n` +
          `Efficiency: ${(typeof gradingResults.scores?.efficiency === 'object' 
            ? gradingResults.scores.efficiency.score?.toFixed(2)
            : gradingResults.scores?.efficiency?.toFixed(2)) || "0"}/3\n` +
          `Code Quality: ${gradingResults.scores?.codeQuality?.toFixed(2) || "0"}/1\n\n` +
          `--- Public Test Results (current run) ---\n\n` +
          `Passed: ${summary.passed}/${summary.total} (${(summary.passRate * 100).toFixed(1)}%)\n\n` +
          resultsText
        );
      } else {
        setOutput(
          `--- Public Test Results ---\n\n` +
          `Passed: ${summary.passed}/${summary.total} (${(summary.passRate * 100).toFixed(1)}%)\n\n` +
          resultsText
        );
      }
    } catch (err) {
      // On error, restore previous output if it had grading results
      if (gradingResults) {
        setOutput(`Error: ${err.message}\n\n--- Grading Results (from previous submission) ---\n\n` +
          `Total Score: ${(gradingResults.scores?.total !== null && gradingResults.scores?.total !== undefined) 
            ? gradingResults.scores.total.toFixed(2) 
            : (gradingResults.scores?.correctness !== undefined && 
                gradingResults.scores?.efficiency !== undefined && 
                gradingResults.scores?.codeQuality !== undefined
                ? (gradingResults.scores.correctness + 
                   (typeof gradingResults.scores.efficiency === 'object' 
                     ? gradingResults.scores.efficiency.score 
                     : gradingResults.scores.efficiency) + 
                   gradingResults.scores.codeQuality).toFixed(2)
                : "0")
          }/10`);
      } else {
        setOutput("Error: " + err.message);
      }
    } finally {
      setIsRunningPublicTests(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignment) {
      setOutput("Error: No assignment selected. Please open an assignment from the Assignments page.");
      return;
    }

    if (!user || !user.id) {
      setOutput("Error: User not authenticated. Please refresh the page and try again.");
      return;
    }

    setIsSubmitting(true);
    setGradingResults(null);
    setSubmissionStatus(null);
    setOutput("Submitting your code for auto-grading...");

    try {
      const response = await submissionService.createSubmission({
        assignmentId: assignment.id,
        studentId: user.id,
        studentName: user.username,
        code,
        language,
      });

      // Check if response has results (synchronous processing)
      if (response.submission && response.submission.status === "graded" && response.submission.results) {
        // Submission was graded immediately (synchronous processing)
        setGradingResults(response.submission.results);
        setSubmissionStatus({ status: "graded", progress: 100 });
        setOutput("✅ Code submitted and graded successfully!");
        setIsSubmitting(false);
      } else {
        // Submission is being processed asynchronously
        setSubmissionId(response.submission.id);
        setSubmissionStatus({ status: response.submission.status || "pending", progress: 0 });
        setOutput("✅ Code submitted successfully! Grading in progress...");
      }
    } catch (err) {
      console.error("Submission error:", err);
      // Don't navigate away on error - just show error message
      setOutput(`Error: ${err.message || "Failed to submit code. Please try again."}`);
      setIsSubmitting(false);
      
      // Check if it's an auth error
      if (err.message && (err.message.includes("401") || err.message.includes("Unauthorized"))) {
        setOutput("Error: Authentication failed. Please refresh the page and log in again.");
      }
    }
  };

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col overflow-hidden bg-gray-100 md:flex-row dark:bg-neutral-800",
        "h-screen"
      )}
      style={{ willChange: "transform, opacity" }}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}

            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  onClick={link.onClick}
                />
              ))}
            </div>
          </div>

          <UserProfileLink user={user} />
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          {/* Header section */}
          <div className="bg-neutral-100 dark:bg-neutral-800/70 px-4 pt-4 pb-4 md:px-6 md:pt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Go back"
              >
                <IconArrowLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </button>
              <IconCode className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                Code Editor
              </h1>
            </div>
          </div>

          {/* Body section with cards */}
          <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto w-full">
              {/* Question Panel Card */}
              <div className="relative group block p-3 h-full w-full">
                <Card icon={<IconFileText className="w-12 h-12" />} showLearnMore={false}>
                  <div className="relative">
                    {/* Deadline in top right corner */}
                    {assignment?.dueDate && (
                      <div className="absolute top-0 right-0">
                        <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-lg">
                          <div className="text-xs font-medium text-purple-700 dark:text-purple-300">
                            Deadline
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400">
                            {new Date(assignment.dueDate).toLocaleDateString()} {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <CardTitle className="pr-32 text-gray-900 dark:text-white">
                      {assignment ? assignment.title : "Question Panel"}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    <div className="question-content">
                      {assignment ? (
                        <>
                          <div className="mb-3 text-base text-gray-800 dark:text-white whitespace-pre-wrap">{assignment.description}</div>
                          {assignment.publicTestCases && assignment.publicTestCases.length > 0 && (
                            <div className="mb-3">
                              <p className="font-semibold mb-2 text-gray-900 dark:text-white">Public Test Cases:</p>
                              {assignment.publicTestCases.map((testCase, index) => (
                                <div
                                  key={index}
                                  className="mb-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800"
                                >
                                  <div className="text-sm text-gray-800 dark:text-white mb-1">
                                    <strong>Input:</strong>
                                    <pre className="mt-1 p-2 bg-neutral-200 dark:bg-zinc-800 rounded text-xs whitespace-pre-wrap font-mono text-gray-900 dark:text-white">
                                      {testCase.input}
                                    </pre>
                                  </div>
                                  <div className="text-sm text-gray-800 dark:text-white">
                                    <strong>Expected Output:</strong>
                                    <pre className="mt-1 p-2 bg-neutral-200 dark:bg-zinc-800 rounded text-xs whitespace-pre-wrap font-mono text-gray-900 dark:text-white">
                                      {testCase.expectedOutput}
                                    </pre>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="mb-3 text-gray-800 dark:text-white">
                            Implement a function that returns the <strong>n<sup>th</sup> Fibonacci number</strong>.
                          </p>
                          <p className="mb-2 text-gray-800 dark:text-white">Requirements:</p>
                          <ul className="list-disc list-inside mb-3 space-y-1 text-gray-800 dark:text-white">
                            <li>Handle <code className="bg-neutral-200 dark:bg-zinc-800 px-1 rounded text-gray-900 dark:text-white">n</code> up to <code className="bg-neutral-200 dark:bg-zinc-800 px-1 rounded text-gray-900 dark:text-white">10<sup>5</sup></code> efficiently</li>
                            <li>Support Python, C, or C++</li>
                          </ul>
                          <p className="text-gray-800 dark:text-white"><em>Example:</em> <code className="bg-neutral-200 dark:bg-zinc-800 px-1 rounded text-gray-900 dark:text-white">fib(7) = 13</code></p>
                          <p className="mt-4 text-sm text-purple-600 dark:text-purple-400">
                            💡 To work on an assignment, go to the Assignments page and click "Open in Code Editor"
                          </p>
                        </>
                      )}
                    </div>
                  </CardDescription>
                </Card>
              </div>

              {/* Editor Panel Card */}
              <div className="relative group block p-3 h-full w-full">
                <Card icon={<IconCode className="w-12 h-12" />} showLearnMore={false}>
                  <CardTitle>Editor Panel</CardTitle>
                  <CardDescription>
                    <div className="editor-content space-y-4">
                      {/* Controls */}
                      <div className="flex gap-2 flex-wrap">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="bg-white dark:bg-zinc-800 text-neutral-900 dark:text-zinc-100 border border-neutral-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-500"
                          disabled={!assignment}
                        >
                          {assignment?.languages ? (
                            assignment.languages.map((lang) => (
                              <option key={lang} value={lang}>
                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="python">Python</option>
                              <option value="javascript">JavaScript</option>
                              <option value="java">Java</option>
                              <option value="cpp">C++</option>
                              <option value="c">C</option>
                            </>
                          )}
                        </select>
                        <button
                          onClick={handleRunPublicTests}
                          disabled={isSubmitting || isRunningPublicTests || !assignment}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                          {isRunningPublicTests ? "⏳ Testing..." : "🧪 Test Public"}
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting || isRunningPublicTests || !assignment}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                          {isSubmitting ? "⏳ Submitting..." : "📤 Submit"}
                        </button>
                      </div>

                      {/* Code Editor */}
                      <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Write your code here..."
                        className="w-full h-48 bg-neutral-50 dark:bg-zinc-900 text-neutral-900 dark:text-zinc-100 border border-neutral-300 dark:border-zinc-700 rounded-lg p-3 font-mono text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 resize-y"
                        style={{ fontFamily: "Fira Code, Courier New, monospace" }}
                      />

                      {/* Submission Status */}
                      {submissionStatus && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Submission Status: {submissionStatus.status}
                            </span>
                            {submissionStatus.progress !== undefined && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {submissionStatus.progress}%
                              </span>
                            )}
                          </div>
                          {submissionStatus.progress !== undefined && (
                            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                              <div
                                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${submissionStatus.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Grading Results */}
                      {gradingResults && (
                        <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h4 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-3">
                            📊 Grading Results
                          </h4>
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">Total Score:</span>
                              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {(gradingResults.scores?.total !== null && gradingResults.scores?.total !== undefined) 
                                  ? gradingResults.scores.total.toFixed(2) 
                                  : (gradingResults.scores?.correctness !== undefined && 
                                      gradingResults.scores?.efficiency !== undefined && 
                                      gradingResults.scores?.codeQuality !== undefined
                                      ? (gradingResults.scores.correctness + 
                                         (typeof gradingResults.scores.efficiency === 'object' 
                                           ? gradingResults.scores.efficiency.score 
                                           : gradingResults.scores.efficiency) + 
                                         gradingResults.scores.codeQuality).toFixed(2)
                                      : "0")
                                }/10
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">Correctness:</span>
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                {gradingResults.scores?.correctness?.toFixed(2) || "0"}/6
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">Efficiency:</span>
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                {(typeof gradingResults.scores?.efficiency === 'object' 
                                  ? gradingResults.scores.efficiency.score?.toFixed(2)
                                  : gradingResults.scores?.efficiency?.toFixed(2)) || "0"}/3
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">Code Quality:</span>
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                {gradingResults.scores?.codeQuality?.toFixed(2) || "0"}/1
                              </span>
                            </div>
                            {gradingResults.complexity && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Complexity:</span>
                                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                  {gradingResults.complexity}
                                </span>
                              </div>
                            )}
                          </div>
                          {gradingResults.feedback && (
                            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                <strong>Feedback:</strong>
                              </p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                {gradingResults.feedback.correctness}
                              </p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                {gradingResults.feedback.efficiency}
                              </p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                {gradingResults.feedback.codeQuality}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Output */}
                      <div>
                        <h4 className="text-neutral-700 dark:text-zinc-300 font-semibold mb-2 text-sm">Output:</h4>
                        <pre className="bg-neutral-50 dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-700 rounded-lg p-3 text-xs text-neutral-800 dark:text-zinc-300 font-mono overflow-auto max-h-48 whitespace-pre-wrap">
                          {output}
                        </pre>
                      </div>
                    </div>
                  </CardDescription>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
