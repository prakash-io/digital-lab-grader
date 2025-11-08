import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or system preference
    const stored = localStorage.getItem("theme");
    if (stored) {
      return stored === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Apply theme to document immediately without delay
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    // Update state immediately for instant UI update
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Apply theme immediately without waiting for React state update
    // This ensures instant theme switch without lag
    const html = document.documentElement;
    if (newIsDark) {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-2.5 sm:p-3 rounded-full bg-white dark:bg-zinc-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-zinc-200 dark:border-zinc-700"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{ width: '44px', height: '44px' }}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Sun Icon - shows in dark mode (to switch to light) */}
        <svg
          className={`absolute w-5 h-5 text-yellow-500 transition-all duration-300 ${
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        
        {/* Moon Icon - shows in light mode (to switch to dark) */}
        <svg
          className={`absolute w-5 h-5 text-blue-400 transition-all duration-300 ${
            isDark ? "opacity-0 -rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>
    </button>
  );
}

