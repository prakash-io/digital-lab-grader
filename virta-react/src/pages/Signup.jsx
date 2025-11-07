import { BackgroundRippleEffect } from "../components/BackgroundRippleEffect";
import { LoginSignupForm } from "../components/LoginSignupForm";

export default function SignupPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-50 font-sans dark:bg-black">
      <BackgroundRippleEffect />

      <main className="relative z-[5] mx-auto flex min-h-screen w-full flex-col items-center justify-center px-6">
        <LoginSignupForm />
      </main>
    </div>
  );
}

