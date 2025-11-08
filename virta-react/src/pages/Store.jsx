import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconInfoCircle,
  IconShoppingBag,
  IconTrophy,
  IconUser,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { avatars, getUserData, saveUserData } from "../utils/avatars";

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

const rarityColors = {
  common: "border-gray-400 text-gray-700 dark:text-gray-400",
  rare: "border-blue-400 text-blue-300 dark:text-blue-400",
  epic: "border-purple-400 text-purple-700 dark:text-purple-400",
  legendary: "border-yellow-400 text-yellow-700 dark:text-yellow-400",
};

const rarityBgColors = {
  common: "bg-gray-500/20 border-gray-400/30",
  rare: "bg-blue-500/20 border-blue-400/30",
  epic: "bg-purple-500/20 border-purple-400/30",
  legendary: "bg-yellow-500/20 border-yellow-400/30",
};

export default function Store() {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [coins, setCoins] = useState(10000);
  const [purchasedAvatars, setPurchasedAvatars] = useState([]);
  const [filter, setFilter] = useState("all");
  const [notification, setNotification] = useState({ message: "", show: false });

  // Load user data from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const userData = getUserData(user.id);
      setCoins(userData.coins || 10000);
      setPurchasedAvatars(userData.purchasedAvatars || []);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signup");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ message: "", show: false });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const handleLogout = () => {
    logout();
    navigate("/signup");
  };

  const filteredAvatars = (filter === "all" 
    ? avatars 
    : avatars.filter(avatar => avatar.rarity === filter)
  ).sort((a, b) => a.price - b.price);

  const buyAvatar = (avatar) => {
    if (!user?.id) return;

    // Check if already purchased
    if (purchasedAvatars.includes(avatar.id)) {
      setNotification({ 
        message: `ℹ️ You already own ${avatar.name}!`, 
        show: true 
      });
      return;
    }

    // Check if enough coins
    if (coins < avatar.price) {
      setNotification({ 
        message: `❌ Not enough coins to buy ${avatar.name}!`, 
        show: true 
      });
      return;
    }

    // Purchase avatar
    const newCoins = coins - avatar.price;
    const newPurchasedAvatars = [...purchasedAvatars, avatar.id];
    
    // Update state
    setCoins(newCoins);
    setPurchasedAvatars(newPurchasedAvatars);

    // Save to localStorage
    const userData = {
      coins: newCoins,
      purchasedAvatars: newPurchasedAvatars,
    };
    saveUserData(user.id, userData);

    // Update user context with purchased avatars
    if (updateUser) {
      updateUser({
        ...user,
        purchasedAvatars: newPurchasedAvatars,
        coins: newCoins,
      });
    }

    setNotification({ 
      message: `✅ You bought ${avatar.name} for ${avatar.price} coins!`, 
      show: true 
    });
  };

  const isAvatarPurchased = (avatarId) => {
    return purchasedAvatars.includes(avatarId);
  };

  if (!isAuthenticated) {
    return null;
  }

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
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Go back"
              >
                <IconArrowLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </button>
              <IconShoppingBag className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                Avatar Shop
              </h1>
            </div>
            
            {/* Header Card with Coins */}
            <div className="bg-purple-200/15 dark:bg-purple-900/15 backdrop-blur-xl border-2 border-purple-300/30 dark:border-purple-500/30 rounded-2xl p-3 md:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-purple-800 dark:text-purple-200 mb-1">
                    Customize your profile with unique avatars
                  </h2>
                  <p className="text-xs md:text-sm text-purple-600 dark:text-purple-400">
                    Choose from a variety of avatars to personalize your profile
                  </p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 bg-purple-300/20 dark:bg-purple-700/30 px-3 md:px-4 py-2 md:py-3 rounded-xl border border-purple-400/30 dark:border-purple-500/30 shrink-0">
                  <span className="text-xl md:text-2xl">🪙</span>
                  <div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 opacity-80">
                      Your Coins
                    </div>
                    <div className="text-lg md:text-xl lg:text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {coins.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body section */}
          <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-4 md:p-6 lg:p-10">
            <div className="max-w-6xl mx-auto w-full">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-6 md:mb-8">
                {["all", "common", "rare", "epic", "legendary"].map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => setFilter(rarity)}
                    className={cn(
                      "px-3 md:px-4 lg:px-5 py-1.5 md:py-2 rounded-lg font-medium transition-all duration-300 capitalize text-xs md:text-sm",
                      filter === rarity
                        ? "bg-purple-500/50 dark:bg-purple-600/50 border-2 border-purple-400 dark:border-purple-500 text-white"
                        : "bg-purple-200/20 dark:bg-purple-900/20 border border-purple-300/40 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 hover:bg-purple-300/30 dark:hover:bg-purple-800/30"
                    )}
                  >
                    {rarity}
                  </button>
                ))}
              </div>

              {/* Avatar Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                <AnimatePresence mode="wait">
                  {filteredAvatars.map((avatar, index) => {
                    const isPurchased = isAvatarPurchased(avatar.id);
                    const canAfford = coins >= avatar.price;
                    
                    return (
                      <motion.div
                        key={avatar.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "bg-white dark:bg-neutral-800/50 border-2 rounded-xl p-3 md:p-4 text-center transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl",
                          rarityBgColors[avatar.rarity],
                          isPurchased && "ring-2 ring-purple-400 dark:ring-purple-500",
                          "hover:border-purple-400 dark:hover:border-purple-500"
                        )}
                      >
                        <div className="mb-2 md:mb-3 flex justify-center relative">
                          {isPurchased && (
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <img
                            src={avatar.img}
                            alt={avatar.name}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-purple-400/40 dark:border-purple-500/40"
                          />
                        </div>
                        <h3 className="text-sm md:text-base font-semibold text-purple-800 dark:text-purple-200 mb-1 md:mb-2 line-clamp-1">
                          {avatar.name}
                        </h3>
                        <p className={cn(
                          "text-xs font-medium mb-2 md:mb-3 border rounded-full px-2 py-1 inline-block",
                          rarityColors[avatar.rarity]
                        )}>
                          {avatar.rarity.toUpperCase()}
                        </p>
                        <p className="text-xs md:text-sm font-medium text-purple-700 dark:text-purple-300 mb-2 md:mb-3">
                          🪙 {avatar.price.toLocaleString()}
                        </p>
                        <button
                          onClick={() => buyAvatar(avatar)}
                          disabled={isPurchased || !canAfford}
                          className={cn(
                            "w-full py-2 px-3 md:px-4 rounded-lg font-medium transition-all duration-300 text-sm md:text-base",
                            isPurchased
                              ? "bg-green-600 text-white cursor-default"
                              : canAfford
                              ? "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg"
                              : "bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          )}
                        >
                          {isPurchased ? "Owned" : "Buy"}
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-purple-500/30 dark:bg-purple-900/50 border-2 border-purple-400/40 dark:border-purple-500/40 backdrop-blur-xl rounded-xl px-4 py-3 md:px-6 md:py-4 shadow-2xl z-50 max-w-[90vw] md:max-w-none"
          >
            <p className="text-white dark:text-purple-100 font-medium text-sm md:text-base">
              {notification.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

