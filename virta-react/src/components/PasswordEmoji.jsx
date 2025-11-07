import { motion, AnimatePresence } from "motion/react";

export function PasswordEmoji({ isTyping, isWrong = false }) {
  const getEmoji = () => {
    if (isWrong) return "😤";
    if (isTyping) return "🙈";
    return "🐵";
  };

  const getEmojiKey = () => {
    if (isWrong) return "wrong";
    if (isTyping) return "closed";
    return "open";
  };

  return (
    <div className="password-emoji-container">
      <motion.div
        className="emoji-face"
        animate={{
          scale: isWrong ? [1, 1.2, 1.1, 1.2, 1] : isTyping ? [1, 1.1, 1] : 1,
          rotate: isWrong ? [0, -5, 5, -5, 0] : 0,
        }}
        transition={{
          duration: isWrong ? 0.5 : 0.3,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={getEmojiKey()}
            className="emoji-text"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            {getEmoji()}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

