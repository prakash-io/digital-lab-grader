import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconShoppingBag,
  IconTrophy,
  IconChartLine,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";
import { avatars } from "../utils/avatars";

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

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    navigate("/signup");
    return null;
  }

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

  // Sample leaderboard data
  const leaderboardData = [
    { rank: 1, username: "CodeMaster", score: 9850, badge: "🥇" },
    { rank: 2, username: "AlgorithmWizard", score: 9720, badge: "🥈" },
    { rank: 3, username: "DataStructPro", score: 9650, badge: "🥉" },
    { rank: 4, username: "Prakash123", score: 9420, badge: "⭐" },
    { rank: 5, username: "PythonNinja", score: 9380, badge: "⭐" },
    { rank: 6, username: "JavaExpert", score: 9250, badge: "⭐" },
    { rank: 7, username: "CppChampion", score: 9120, badge: "⭐" },
    { rank: 8, username: "ReactGuru", score: 8980, badge: "⭐" },
    { rank: 9, username: "NodeMaster", score: 8850, badge: "⭐" },
    { rank: 10, username: "DockerDev", score: 8720, badge: "⭐" },
  ];

  // Always calculate statistics from leaderboard data
  const totalStudents = leaderboardData.length;
  const totalScore = leaderboardData.reduce((sum, entry) => sum + entry.score, 0);
  const averageScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;
  const topScore = leaderboardData.length > 0 ? Math.max(...leaderboardData.map(entry => entry.score)) : 0;

  // Check if current user is in the leaderboard
  const currentUserRank = leaderboardData.findIndex(
    (entry) => entry.username.toLowerCase() === user?.username?.toLowerCase()
  );

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
              <IconTrophy className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                Leaderboard
              </h1>
            </div>
          </div>

          {/* Body section */}
          <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              {/* Current User Rank Card */}
              {currentUserRank >= 0 && (
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/20 dark:to-pink-500/20 border-2 border-purple-400 dark:border-purple-500/50 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-300 mb-1">
                        Your Rank
                      </p>
                      <h2 className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                        #{currentUserRank + 1}
                      </h2>
                      <p className="text-lg text-neutral-800 dark:text-neutral-300 mt-1">
                        {leaderboardData[currentUserRank].username}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-purple-600 dark:text-purple-300 mb-1">
                        Score
                      </p>
                      <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                        {leaderboardData[currentUserRank].score.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard Table */}
              <div className="bg-white dark:bg-neutral-800/50 border-2 border-purple-300 dark:border-purple-500/50 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-neutral-800/70">
                  <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    Top Performers
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-200 dark:border-purple-500/30 bg-purple-50/50 dark:bg-neutral-800/30">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700 dark:text-purple-300">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700 dark:text-purple-300">
                          User
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-purple-700 dark:text-purple-300">
                          Score
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700 dark:text-purple-300">
                          Badge
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((entry, index) => {
                        const isCurrentUser =
                          entry.username.toLowerCase() ===
                          user?.username?.toLowerCase();
                        return (
                          <motion.tr
                            key={entry.rank}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "border-b border-purple-100 dark:border-purple-500/20 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors",
                              isCurrentUser &&
                                "bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/50"
                            )}
                          >
                            <td className="px-6 py-4">
                              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                                #{entry.rank}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={cn(
                                  "text-lg font-medium",
                                  isCurrentUser
                                    ? "text-purple-700 dark:text-purple-300"
                                    : "text-neutral-800 dark:text-neutral-300"
                                )}
                              >
                                {entry.username}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                                {entry.score.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-2xl">{entry.badge}</span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stats Section */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-neutral-800/50 border-2 border-purple-300 dark:border-purple-500/50 rounded-2xl p-6 text-center shadow-lg">
                  <IconTrophy className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {totalStudents}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Total Students
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-800/50 border-2 border-purple-300 dark:border-purple-500/50 rounded-2xl p-6 text-center shadow-lg">
                  <IconChartLine className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {averageScore.toLocaleString()}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Average Score
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-800/50 border-2 border-purple-300 dark:border-purple-500/50 rounded-2xl p-6 text-center shadow-lg">
                  <IconTrophy className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {topScore.toLocaleString()}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Top Score
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

