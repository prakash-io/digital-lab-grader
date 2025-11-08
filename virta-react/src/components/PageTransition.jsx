import { motion } from "motion/react";
import { useLocation } from "react-router-dom";

export function PageTransition({ children }) {
  const location = useLocation();

  // Different animation styles based on route
  const getAnimation = (pathname) => {
    switch (pathname) {
      case "/dashboard":
        return {
          initial: { opacity: 0, x: -30 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 30 },
        };
      case "/code-editor":
        return {
          initial: { opacity: 0, x: 30 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -30 },
        };
      case "/signup":
        return {
          initial: { opacity: 0, scale: 0.98 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.98 },
        };
      default:
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
        };
    }
  };

  const animation = getAnimation(location.pathname);

  return (
    <motion.div
      key={location.pathname}
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1], // Custom easing for smoother feel
      }}
      style={{ width: "100%", height: "100%", willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

