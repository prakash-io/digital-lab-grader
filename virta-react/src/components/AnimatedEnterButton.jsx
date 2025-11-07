import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HoverBorderGradient } from "./HoverBorderGradient";

export function AnimatedEnterButton() {
  const [showOptions, setShowOptions] = useState(false);
  
  // Track two-finger touch state
  const twoTouchStartY = useRef(null);
  const twoTouchStartTime = useRef(null);
  const lastWheelTime = useRef(0);
  const wheelDeltaSum = useRef(0);
  const wheelTimeout = useRef(null);

  const SWIPE_THRESHOLD = 80;
  const WHEEL_THRESHOLD = 100;

  useEffect(() => {
    if (showOptions) return;

    // Handle two-finger touch swipe (mobile)
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const avgY = (touch1.clientY + touch2.clientY) / 2;
        twoTouchStartY.current = avgY;
        twoTouchStartTime.current = Date.now();
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && twoTouchStartY.current !== null) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const avgY = (touch1.clientY + touch2.clientY) / 2;
        const deltaY = twoTouchStartY.current - avgY;
        
        if (deltaY > SWIPE_THRESHOLD) {
          setShowOptions(true);
          twoTouchStartY.current = null;
          twoTouchStartTime.current = null;
        }
      }
    };

    const handleTouchEnd = () => {
      twoTouchStartY.current = null;
      twoTouchStartTime.current = null;
    };

    // Handle trackpad two-finger swipe (desktop)
    const handleWheel = (e) => {
      if (e.deltaMode === 0 && e.deltaY > 0) {
        const now = Date.now();
        
        if (now - lastWheelTime.current > 300) {
          wheelDeltaSum.current = 0;
        }
        
        lastWheelTime.current = now;
        wheelDeltaSum.current += e.deltaY;
        
        if (wheelTimeout.current) {
          clearTimeout(wheelTimeout.current);
        }
        
        if (wheelDeltaSum.current > WHEEL_THRESHOLD) {
          setShowOptions(true);
          wheelDeltaSum.current = 0;
        } else {
          wheelTimeout.current = setTimeout(() => {
            wheelDeltaSum.current = 0;
          }, 200);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("wheel", handleWheel);
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }
    };
  }, [showOptions]);

  const handleOptionClick = (e) => {
    e.preventDefault();
    window.location.href = "/signup";
  };

  return (
    <>
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-[10]"
            onClick={() => setShowOptions(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-4 relative z-[15]">
        <AnimatePresence mode="wait">
          {!showOptions ? (
            <motion.div
              key="waiting-state"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Swipe up with two fingers to continue
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="option-cards"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="group"
              >
                <HoverBorderGradient
                  as="a"
                  href="/signup.html"
                  onClick={handleOptionClick}
                  containerClassName="rounded-2xl"
                  className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-8 py-6 text-base font-semibold flex flex-col items-center gap-3 relative overflow-hidden min-w-[220px] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="text-2xl mb-1">🏛️</div>
                  <span>University Login</span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Access as institution
                  </span>
                </HoverBorderGradient>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="group"
              >
                <HoverBorderGradient
                  as="a"
                  href="/signup.html"
                  onClick={handleOptionClick}
                  containerClassName="rounded-2xl"
                  className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-8 py-6 text-base font-semibold flex flex-col items-center gap-3 relative overflow-hidden min-w-[220px] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="text-2xl mb-1">🎓</div>
                  <span>Student Login</span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Access as student
                  </span>
                </HoverBorderGradient>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

