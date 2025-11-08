import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconInfoCircle,
  IconUsers,
  IconTrophy,
  IconBell,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";
import { submissionService, gradeService, leaderboardService } from "../services/apiService";
import { announcementService } from "../services/apiService";
import { avatars } from "../utils/avatars";

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

export default function TeacherStudents() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== "instructor") {
      navigate("/signup");
    } else {
      loadLeaderboard();
    }
  }, [isAuthenticated, user, navigate]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardService.getLeaderboard();
      setLeaderboardData(response.leaderboard || []);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await announcementService.createAnnouncement({
        title: announcementTitle,
        message: announcementMessage,
        teacherId: user.id,
        teacherName: user.username,
      });
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      setShowAnnouncementForm(false);
      alert("Announcement sent to all students!");
    } catch (err) {
      alert("Error creating announcement: " + err.message);
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
      label: "Students",
      href: "#",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
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

  // Calculate stats
  // Calculate statistics from leaderboard data
  const totalStudents = leaderboardData.length;
  const totalScore = leaderboardData.reduce((sum, s) => sum + (s.score || 0), 0);
  const averageScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;
  const topScore = leaderboardData.length > 0 ? Math.max(...leaderboardData.map((s) => s.score || 0)) : 0;

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

          <UserProfileLink user={user} />
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <div className="bg-neutral-100 dark:bg-neutral-800/70 px-4 pt-4 pb-4 md:px-6 md:pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/instructor-dashboard")}
                  className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <IconArrowLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </button>
                <IconUsers className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
                <h1 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                  Students
                </h1>
              </div>
              <button
                onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <IconBell className="w-5 h-5" />
                Make Announcement
              </button>
            </div>

            {showAnnouncementForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-white dark:bg-neutral-800 rounded-lg border border-purple-200 dark:border-purple-800 p-4"
              >
                <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-3">
                  Create Announcement
                </h3>
                <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
                    required
                  />
                  <textarea
                    placeholder="Message"
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-neutral-700 text-purple-900 dark:text-purple-100"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAnnouncementForm(false)}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 md:p-10">
            {/* Leaderboard Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <IconTrophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  Leaderboard
                </h2>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Total Students</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {totalStudents}
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Average Score</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {averageScore.toFixed(1)}
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Top Score</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {topScore}
                  </div>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-purple-200 dark:border-purple-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-purple-100 dark:bg-purple-900/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-200 dark:divide-purple-800">
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="text-center py-8 text-gray-600 dark:text-gray-400">
                          Loading leaderboard...
                        </td>
                      </tr>
                    ) : leaderboardData.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-8 text-gray-600 dark:text-gray-400">
                          No students yet.
                        </td>
                      </tr>
                    ) : (
                      leaderboardData.map((student, index) => (
                        <motion.tr
                          key={student.id || student.username}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-700 dark:text-purple-300">
                            #{student.rank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 dark:text-purple-400">
                            {student.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-700 dark:text-purple-300">
                            {student.score || 0}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

