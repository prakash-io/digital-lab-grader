import { Link } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import { BackgroundRippleEffect } from "../components/BackgroundRippleEffect";
import { LoginSignupForm } from "../components/LoginSignupForm";

export default function SignupPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-50 font-sans dark:bg-black">
      <BackgroundRippleEffect />

      {/* Back button to home - positioned relative to page */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 shadow-sm"
      >
        <IconArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <main className="relative z-[5] mx-auto flex min-h-screen w-full flex-col items-center justify-center px-6">
        <div className="relative w-full flex justify-center items-center">
          <LoginSignupForm />
        </div>
      </main>
    </div>
  );
}

