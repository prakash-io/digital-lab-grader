import { BackgroundRippleEffect } from "../components/BackgroundRippleEffect";
import { Highlight } from "../components/HeroHighlight";
import { AnimatedEnterButton } from "../components/AnimatedEnterButton";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-50 font-sans dark:bg-black">
      <BackgroundRippleEffect />

      <main className="relative z-[5] mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Welcome to <Highlight>VirTA</Highlight>
        </h1>
        <p className="mb-8 max-w-xl text-lg font-medium text-zinc-700 dark:text-zinc-300">
          Your Virtual Teaching Assistant for an enhanced learning experience.
        </p>
        <div className="flex items-center justify-center">
          <AnimatedEnterButton />
        </div>
      </main>
    </div>
  );
}

