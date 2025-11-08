import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconShoppingBag,
  IconTrophy,
  IconInfoCircle,
  IconMail,
  IconPhone,
  IconMapPin,
  IconX,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
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

export default function About() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (you can integrate with a backend API here)
    alert("Thank you! Your message has been sent.");
    setFormData({ name: "", email: "", message: "" });
    setContactModalOpen(false);
  };

  if (!isAuthenticated) {
    navigate("/signup");
    return null;
  }

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
              <IconInfoCircle className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                About Us
              </h1>
            </div>
          </div>

          {/* Body section */}
          <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
              {/* Hero Section */}
              <div className="text-center py-8 md:py-12 mb-8 bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-900/20 dark:to-transparent rounded-lg">
                <h2 className="text-3xl md:text-4xl font-bold text-purple-700 dark:text-purple-300 mb-4">
                  About VirTA
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto px-4">
                  VirTA is a collaborative coding environment designed to empower developers, students, and creators to build and share interactive code experiences seamlessly.
                </p>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Our Mission */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">
                    Our Mission
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    We aim to make coding accessible, intuitive, and engaging for everyone — from beginners exploring their first HTML tags to professionals refining complex applications.
                  </p>
                </div>

                {/* Our Vision */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">
                    Our Vision
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    To redefine how people learn and collaborate through code — creating an ecosystem where ideas, creativity, and technology converge effortlessly.
                  </p>
                </div>

                {/* Our Values */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">
                    Our Values
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Transparency, curiosity, and innovation. We believe in open knowledge, shared growth, and the power of creative collaboration.
                  </p>
                </div>

                {/* Meet the Team */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">
                    Meet the Team
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    A passionate group of developers, designers, and educators committed to improving the coding experience — one line of code at a time.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-12 pt-8 border-t border-purple-200 dark:border-purple-800">
                <p className="text-gray-600 dark:text-gray-400">
                  Created with ❤️ by LoneWolf
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Contact Us Button */}
      <button
        onClick={() => setContactModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center gap-2 group"
        aria-label="Contact Us"
      >
        <IconMail className="w-6 h-6" />
        <span className="hidden md:inline-block font-semibold">Contact Us</span>
      </button>

      {/* Contact Modal */}
      <AnimatePresence>
        {contactModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setContactModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-neutral-800 px-6 py-4 border-b border-purple-200 dark:border-purple-800 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                Contact Us
              </h2>
              <button
                onClick={() => setContactModalOpen(false)}
                className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                aria-label="Close"
              >
                <IconX className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6 text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  We'd love to hear from you! Whether it's feedback, questions, or collaboration ideas — reach out below.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Form */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">
                    Get in Touch
                  </h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows="5"
                        placeholder="Your message..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-400 hover:to-pink-400 transition-all shadow-md"
                    >
                      Send Message
                    </button>
                  </form>
                </div>

                {/* Contact Information */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4 mb-4">
                    <div className="flex items-start gap-3">
                      <IconMail className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email:
                        </p>
                        <a
                          href="mailto:Prakash01022005@gmail.com"
                          className="text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          Prakash01022005@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <IconPhone className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone:
                        </p>
                        <a
                          href="tel:+917061603061"
                          className="text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          +91 7061603061
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <IconMapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Address:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Hostel square, IIIT Bhubaneswar
                          <br />
                          Bhubaneswar, India
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Google Maps */}
                  <div className="mt-4">
                    <iframe
                      src="https://maps.google.com/maps?q=IIIT%20Bhubaneswar&t=&z=13&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="200"
                      className="rounded-lg border border-purple-200 dark:border-purple-800"
                      style={{ border: "none" }}
                      loading="lazy"
                      title="IIIT Bhubaneswar Location"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-neutral-800 px-6 py-4 border-t border-purple-200 dark:border-purple-800 text-center rounded-b-2xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 Virta. All rights reserved.
              </p>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

