import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import { Card, CardTitle, CardDescription } from "../components/ui/card-hover-effect";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconInfoCircle,
  IconUsers,
  IconFileText,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
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

export default function InstructorDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signup");
    } else if (user?.userType !== 'instructor') {
      // Redirect students to their dashboard
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/signup");
  };

  // Get first name from username
  const getFirstName = () => {
    if (user?.username) {
      const firstPart = user.username.split(/[0-9]/)[0];
      return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
    }
    return user?.username || "Instructor";
  };

  if (!isAuthenticated || user?.userType !== 'instructor') {
    return null;
  }

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
      href: "/teacher-students",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Assignments",
      href: "/teacher-assignments",
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

  const dashboardCards = {
    students: {
      title: "Students",
      description:
        "View and manage your students. Monitor their progress, track attendance, and communicate with them.",
      link: "/teacher-students",
      icon: <IconUsers className="w-12 h-12" />,
    },
    assignments: {
      title: "Assignments",
      description:
        "Create and manage assignments. Set deadlines, review submissions, and provide feedback to students.",
      link: "/teacher-assignments",
      icon: <IconClipboardCheck className="w-12 h-12" />,
    },
    grades: {
      title: "Grades",
      description:
        "Grade student work, view grade distributions, and manage grade books for all your courses.",
      link: "/teacher-grades",
      icon: <IconFileText className="w-12 h-12" />,
    },
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

      <DashboardContent firstName={getFirstName()} cards={dashboardCards} />
    </div>
  );
}

const DashboardContent = ({ firstName, cards }) => {
  const renderCard = (cardData, isFullWidth = false) => {
    const isExternal = cardData?.link?.startsWith("http") || cardData?.link === "#";
    const Component = isExternal ? "a" : Link;
    const props = isExternal 
      ? { href: cardData?.link }
      : { to: cardData?.link };

    return (
      <Component
        {...props}
        className="relative group block p-3 h-full w-full"
      >
        <Card icon={cardData.icon}>
          <CardTitle>{cardData.title}</CardTitle>
          <CardDescription>{cardData.description}</CardDescription>
        </Card>
      </Component>
    );
  };

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        {/* Header section aligned with sidebar logo */}
        <div className="bg-neutral-100 dark:bg-neutral-800/70 px-4 pt-4 pb-6 md:px-10 md:pt-10">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-700 dark:text-purple-300">
            Welcome <span className="text-purple-600 dark:text-purple-400">{firstName}</span>!
          </h1>
        </div>

        {/* Body section with lighter background */}
        <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 md:p-10">
          <div className="max-w-7xl mx-auto w-full py-4">
            {/* First row - Students card full width */}
            <div className="mb-6">
              {renderCard(cards.students, true)}
            </div>
            
            {/* Second row - Assignments and Grades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderCard(cards.assignments)}
              {renderCard(cards.grades)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

