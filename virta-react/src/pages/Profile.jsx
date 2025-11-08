import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconInfoCircle,
  IconShoppingBag,
  IconTrophy,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
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

// Ripple Background Component
const RippleBackground = () => {
  const containerRef = useRef(null);
  const [cells, setCells] = useState([]);
  const [clickedCell, setClickedCell] = useState(null);
  const cellSize = 56;

  useEffect(() => {
    const calculateGrid = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const cols = Math.ceil(viewportWidth / cellSize) + 2;
      const rows = Math.ceil(viewportHeight / cellSize) + 2;
      
      const newCells = [];
      for (let i = 0; i < rows * cols; i++) {
        newCells.push({
          id: i,
          row: Math.floor(i / cols),
          col: i % cols,
        });
      }
      setCells(newCells);
    };

    calculateGrid();
    window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid);
  }, [cellSize]);

  const handleCellClick = (row, col) => {
    setClickedCell({ row, col });
    setTimeout(() => setClickedCell(null), 1000);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to top, transparent 0%, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.7) 60%, rgba(0, 0, 0, 0.9) 80%, black 100%)",
        WebkitMaskImage:
          "linear-gradient(to top, transparent 0%, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.7) 60%, rgba(0, 0, 0, 0.9) 80%, black 100%)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-screen h-screen grid overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(window.innerWidth / cellSize) + 2}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${Math.ceil(window.innerHeight / cellSize) + 2}, ${cellSize}px)`,
          pointerEvents: "none",
        }}
      >
        {cells.map((cell) => {
          const distance = clickedCell
            ? Math.hypot(clickedCell.row - cell.row, clickedCell.col - cell.col)
            : null;
          const delay = distance ? Math.max(0, distance * 55) : 0;
          const duration = distance ? 200 + distance * 80 : 0;
          
          // Check if cell is in sidebar area (first ~350px on desktop to account for expanded sidebar)
          const cellX = cell.col * cellSize;
          const isInSidebarArea = cellX < 350;

          return (
            <div
              key={cell.id}
              className={cn(
                "w-14 h-14 border border-purple-400/20 dark:border-purple-400/30 bg-purple-200/5 dark:bg-purple-300/10 opacity-30 dark:opacity-40 transition-opacity",
                !isInSidebarArea && "hover:opacity-60 dark:hover:opacity-80 cursor-pointer"
              )}
              onClick={!isInSidebarArea ? () => handleCellClick(cell.row, cell.col) : undefined}
              style={{
                pointerEvents: isInSidebarArea ? "none" : "auto",
                ...(clickedCell && distance !== null
                  ? {
                      animation: `cell-ripple ${duration}ms ease-out ${delay}ms`,
                      animationFillMode: "none",
                    }
                  : {}),
              }}
            />
          );
        })}
      </div>
      <style>{`
        @keyframes cell-ripple {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

export default function Profile() {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [purchasedAvatars, setPurchasedAvatars] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signup");
    }
  }, [isAuthenticated, navigate]);

  // Load purchased avatars from localStorage
  useEffect(() => {
    if (user?.id) {
      const userData = localStorage.getItem(`userData_${user.id}`);
      if (userData) {
        const data = JSON.parse(userData);
        setPurchasedAvatars(data.purchasedAvatars || []);
      }
    }
  }, [user?.id, user?.purchasedAvatars]);

  useEffect(() => {
    // Initialize form values when user data is available or edit mode is enabled
    if (user && isEditing) {
      const name = user?.name || (user?.username ? (() => {
        const parts = user.username.split(/[0-9]/);
        const namePart = parts[0];
        return namePart.charAt(0).toUpperCase() + namePart.slice(1);
      })() : "User");
      setEditedName(name);
      setEditedPhone(user?.phone || "");
      setEditedAddress(user?.address || "");
    }
  }, [user, isEditing]);

  const handleLogout = () => {
    logout();
    navigate("/signup");
  };

  // Get user initials
  const getInitials = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get full name from username (for display)
  const getFullName = () => {
    if (user?.name) {
      return user.name;
    }
    if (user?.username) {
      const parts = user.username.split(/[0-9]/);
      const name = parts[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return user?.username || "User";
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(getFullName());
    setEditedPhone(user?.phone || "");
    setEditedAddress(user?.address || "");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(getFullName());
    setEditedPhone(user?.phone || "");
    setEditedAddress(user?.address || "");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update user in context/localStorage
      const updatedUser = {
        ...user,
        name: editedName.trim(),
        phone: editedPhone.trim() || undefined,
        address: editedAddress.trim() || undefined,
      };

      // If updateUser function exists in context, use it
      if (updateUser) {
        await updateUser(updatedUser);
      } else {
        // Otherwise, update localStorage directly
        const token = localStorage.getItem("token");
        if (token) {
          // Update user in localStorage for now
          // In a real app, this would be an API call
          const userData = { ...updatedUser };
          // Note: In production, you'd call an API endpoint to update the user
          console.log("Updating user:", userData);
        }
      }

      // Update the user state by refreshing from context
      // The context should handle this, but we'll force a re-render
      setIsEditing(false);
      
      // Show success message
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Determine dashboard route based on user type
  const dashboardRoute = user?.userType === 'instructor' ? '/instructor-dashboard' : '/dashboard';
  
  const links = [
    {
      label: "Dashboard",
      href: dashboardRoute,
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

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col overflow-hidden bg-gray-100 md:flex-row dark:bg-neutral-800",
        "h-screen relative"
      )}
      style={{ willChange: "transform, opacity" }}
    >
      <RippleBackground />
      
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

      <div className="flex flex-1 relative z-10">
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          {/* Header section */}
          <div className="bg-neutral-100 dark:bg-neutral-800/70 px-4 pt-4 pb-4 md:px-6 md:pt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(user?.userType === 'instructor' ? '/instructor-dashboard' : '/dashboard')}
                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Go back"
              >
                <IconArrowLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </button>
              <IconUser className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                Profile
              </h1>
            </div>
          </div>
          <div className="max-w-3xl mx-auto w-full px-4 py-6 md:px-6 md:py-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-purple-50/80 dark:bg-purple-900/15 backdrop-blur-xl border-2 border-purple-300/50 dark:border-purple-500/30 rounded-3xl p-6 md:p-10 shadow-2xl"
              style={{
                boxShadow: "0 8px 32px rgba(130, 80, 255, 0.2)",
              }}
            >
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-10 pb-8 border-b border-purple-200/50 dark:border-white/10">
                <div className="flex-shrink-0">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 dark:from-purple-500 dark:to-purple-700 flex items-center justify-center border-4 border-purple-200/50 dark:border-white/20 shadow-2xl">
                    <span className="text-4xl md:text-5xl font-bold text-white">
                      {getInitials()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-100 mb-2 bg-transparent border-b-2 border-purple-400 dark:border-purple-500 focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 w-full max-w-md"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 flex-wrap mb-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-100">
                        {getFullName()}
                      </h1>
                      {purchasedAvatars.length > 0 && (
                        <div className="flex gap-1.5 items-center">
                          {purchasedAvatars.map((avatarId) => {
                            const avatar = avatars.find(a => a.id === avatarId);
                            return avatar ? (
                              <img
                                key={avatarId}
                                src={avatar.img}
                                alt={avatar.name}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-purple-400/50 dark:border-purple-500/50 flex-shrink-0 shadow-lg"
                                title={avatar.name}
                              />
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-lg text-purple-700 dark:text-purple-300 mb-2">
                    {user?.userType === 'instructor' ? 'Teacher' : 'Student'}
                  </p>
                  <p className="text-base text-purple-600 dark:text-purple-400">
                    Username: {user?.username || "N/A"}
                  </p>
                </div>
              </div>

              {/* Profile Content */}
              <div className="mb-8">
                {/* Personal Information Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-purple-800 dark:text-purple-200 mb-4 pb-3 border-b-2 border-purple-300/30 dark:border-purple-500/30">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {isEditing ? (
                      <>
                        <div className="col-span-1">
                          <label className="block text-sm text-purple-600 dark:text-purple-400 font-medium mb-2 uppercase tracking-wide">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-purple-300 dark:border-purple-500/50 bg-white dark:bg-neutral-800 text-purple-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter your name"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm text-purple-600 dark:text-purple-400 font-medium mb-2 uppercase tracking-wide">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-purple-300 dark:border-purple-500/50 bg-white dark:bg-neutral-800 text-purple-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <InfoItem
                          icon={<IconUser className="w-5 h-5" />}
                          label="Name"
                          value={getFullName()}
                        />
                        <InfoItem
                          icon={<IconUser className="w-5 h-5" />}
                          label="Username"
                          value={user?.username || "N/A"}
                        />
                        <InfoItem
                          icon={<IconMail className="w-5 h-5" />}
                          label="Email ID"
                          value={user?.email || `${user?.username || "user"}@example.com`}
                        />
                        <InfoItem
                          icon={<IconPhone className="w-5 h-5" />}
                          label="Phone Number"
                          value={user?.phone || "Not provided"}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Address Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-purple-800 dark:text-purple-200 mb-4 pb-3 border-b-2 border-purple-300/30 dark:border-purple-500/30">
                    Address
                  </h2>
                  {isEditing ? (
                    <div>
                      <label className="block text-sm text-purple-600 dark:text-purple-400 font-medium mb-2 uppercase tracking-wide">
                        Residential Address
                      </label>
                      <textarea
                        value={editedAddress}
                        onChange={(e) => setEditedAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-purple-300 dark:border-purple-500/50 bg-white dark:bg-neutral-800 text-purple-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Enter your residential address"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <InfoItem
                      icon={<IconMapPin className="w-5 h-5" />}
                      label="Residential Address"
                      value={user?.address || "Not provided"}
                      fullWidth
                    />
                  )}
                </div>

                {/* Guardian Information Section */}
                {user?.guardian && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-purple-800 dark:text-purple-200 mb-4 pb-3 border-b-2 border-purple-300/30 dark:border-purple-500/30">
                      Guardian Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InfoItem
                        icon={<IconUser className="w-5 h-5" />}
                        label="Guardian's Name"
                        value={user.guardian.name || "Not provided"}
                      />
                      <InfoItem
                        icon={<IconPhone className="w-5 h-5" />}
                        label="Guardian's Phone"
                        value={user.guardian.phone || "Not provided"}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-purple-200/50 dark:border-white/10">
                {isEditing ? (
                  <>
                    <button
                      className="flex-1 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <IconCheck className="w-5 h-5" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </div>
                    </button>
                    <button
                      className="flex-1 px-6 py-3.5 bg-white dark:bg-white/10 hover:bg-purple-50 dark:hover:bg-white/15 text-purple-700 dark:text-purple-200 font-semibold rounded-xl border border-purple-300 dark:border-white/20 hover:border-purple-400 dark:hover:border-white/30 transition-all duration-300 hover:transform hover:-translate-y-0.5"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <IconX className="w-5 h-5" />
                        Cancel
                      </div>
                    </button>
                  </>
                ) : (
                  <button
                    className="flex-1 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={handleEdit}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <IconEdit className="w-5 h-5" />
                      Edit Profile
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, value, fullWidth = false }) => {
  return (
    <div
      className={cn(
        "p-4 bg-white/60 dark:bg-white/5 border border-purple-200/50 dark:border-white/10 rounded-xl hover:bg-white dark:hover:bg-white/8 hover:border-purple-300 dark:hover:border-white/15 transition-all duration-300 hover:transform hover:-translate-y-0.5 shadow-sm",
        fullWidth && "col-span-1 md:col-span-2"
      )}
    >
      <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium mb-2 uppercase tracking-wide">
        <span className="text-purple-500 dark:text-purple-400">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-base text-purple-900 dark:text-purple-100 font-medium">
        {value}
      </div>
    </div>
  );
};

