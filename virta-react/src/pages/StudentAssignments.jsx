import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconInfoCircle,
  IconShoppingBag,
  IconTrophy,
  IconFileText,
  IconCode,
  IconBell,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";
import { assignmentService } from "../services/apiService";
import { socketService } from "../services/socketService";
import { avatars } from "../utils/avatars";
import { NotificationButton } from "../components/NotificationButton";

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

export default function StudentAssignments() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signup");
    } else {
      loadAssignments();
      const socket = socketService.connect();
      socketService.joinAllStudents();
      socketService.joinStudentRoom(user.id);

      socket.on("new-assignment", (assignment) => {
        setAssignments((prev) => [assignment, ...prev]);
        alert(`New assignment: ${assignment.title}`);
      });

      socket.on("assignment-updated", (assignment) => {
        setAssignments((prev) =>
          prev.map((a) => (a.id === assignment.id ? assignment : a))
        );
      });

          return () => {
            socketService.off("new-assignment");
            socketService.off("assignment-updated");
            socketService.disconnect();
          };
    }
  }, [isAuthenticated, user, navigate]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentService.getAssignments("student");
      setAssignments(response.assignments || []);
    } catch (err) {
      console.error("Error loading assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInCodeEditor = (assignment) => {
    // Navigate to code editor with assignment data
    navigate("/code-editor", {
      state: { assignment },
    });
  };

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
      label: "Assignments",
      href: "/student-assignments",
      icon: (
        <IconFileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
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

  if (!isAuthenticated) {
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
            
            {/* Notification Button */}
            <div className="mt-4 px-2">
              <NotificationButton />
            </div>
          </div>
          <UserProfileLink user={user} />
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <div className="bg-neutral-100 dark:bg-neutral-800/70 px-4 pt-4 pb-4 md:px-6 md:pt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <IconArrowLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </button>
              <IconFileText className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                Assignments
              </h1>
            </div>
          </div>

          <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 md:p-10">
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="text-center py-12 text-purple-600 dark:text-purple-400">
                  No assignments available yet.
                </div>
              ) : (
                assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-white dark:bg-neutral-800 rounded-lg border border-purple-200 dark:border-purple-800 p-6 relative"
                  >
                    {/* Deadline in top right corner */}
                    {assignment.dueDate && (
                      <div className="absolute top-4 right-4">
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
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pr-32">
                      {assignment.title}
                    </h3>
                    <div className="text-gray-700 dark:text-white mb-4 whitespace-pre-wrap">
                      {assignment.description}
                    </div>
                    {(assignment.ioSpec?.inputFormat || assignment.ioSpec?.outputFormat || assignment.constraints) && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        {assignment.ioSpec?.inputFormat && (
                          <div className="mb-2">
                            <strong className="text-sm text-gray-900 dark:text-white">Input Format:</strong>
                            <div className="text-sm text-gray-800 dark:text-white mt-1 whitespace-pre-wrap">{assignment.ioSpec.inputFormat}</div>
                          </div>
                        )}
                        {assignment.ioSpec?.outputFormat && (
                          <div className="mb-2">
                            <strong className="text-sm text-gray-900 dark:text-white">Output Format:</strong>
                            <div className="text-sm text-gray-800 dark:text-white mt-1 whitespace-pre-wrap">{assignment.ioSpec.outputFormat}</div>
                          </div>
                        )}
                        {assignment.constraints && (
                          <div>
                            <strong className="text-sm text-gray-900 dark:text-white">Constraints:</strong>
                            <div className="text-sm text-gray-800 dark:text-white mt-1 whitespace-pre-wrap">{assignment.constraints}</div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Public Test Cases:
                      </h4>
                      {assignment.publicTestCases?.map((testCase, index) => (
                        <div
                          key={index}
                          className="mb-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800"
                        >
                          <div className="text-sm text-gray-800 dark:text-white mb-1">
                            <strong>Input:</strong>
                            <pre className="mt-1 p-2 bg-white dark:bg-neutral-700 rounded text-xs whitespace-pre-wrap font-mono">{testCase.input}</pre>
                          </div>
                          <div className="text-sm text-gray-800 dark:text-white">
                            <strong>Expected Output:</strong>
                            <pre className="mt-1 p-2 bg-white dark:bg-neutral-700 rounded text-xs whitespace-pre-wrap font-mono">{testCase.expectedOutput}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-purple-500 dark:text-purple-400">
                        Languages: {assignment.languages?.join(", ") || "N/A"} | Public Tests: {assignment.publicTestCases?.length || 0}
                      </div>
                      <button
                        onClick={() => handleOpenInCodeEditor(assignment)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <IconCode className="w-5 h-5" />
                        Open in Code Editor
                      </button>
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

