import { cn } from "../../lib/utils";
import { motion } from "motion/react";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export const HoverEffect = ({ items, className }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-6 py-10 max-w-7xl mx-auto w-full",
        className
      )}
    >
      {items.map((item, idx) => {
        const isExternal = item?.link?.startsWith("http") || item?.link === "#";
        const Component = isExternal ? "a" : Link;
        const props = isExternal 
          ? { href: item?.link }
          : { to: item?.link };

        return (
          <Component
            {...props}
            key={item?.link || idx}
            className="relative group block p-3 h-full w-full"
          >
            <Card icon={item.icon}>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </Card>
          </Component>
        );
      })}
    </div>
  );
};

export const Card = ({ className, children, icon, showLearnMore = true }) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-6 overflow-hidden bg-white dark:bg-black border-2 border-purple-400 dark:border-purple-500/50 group-hover:border-purple-500 dark:group-hover:border-purple-400 relative z-20 min-h-[280px] transition-colors duration-200 shadow-lg",
        className
      )}
    >
      <div className="relative z-50 flex flex-col h-full">
        {icon && (
          <div className="mb-4 text-purple-600 dark:text-zinc-100 group-hover:text-purple-700 dark:group-hover:text-white transition-colors">
            {icon}
          </div>
        )}
        <div className="flex-1">{children}</div>
        {showLearnMore && (
          <div className="mt-6 flex items-center justify-end">
            <motion.div
              className="text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300"
              animate={{ 
                x: [0, 6, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ 
                x: 10,
                scale: 1.15,
                transition: { 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 15
                }
              }}
            >
              <IconArrowRight className="w-6 h-6" />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CardTitle = ({ className, children }) => {
  return (
    <h4 className={cn("text-neutral-900 dark:text-zinc-100 font-bold tracking-wide text-xl mb-3", className)}>
      {children}
    </h4>
  );
};

export const CardDescription = ({ className, children }) => {
  return (
    <div
      className={cn(
        "text-neutral-700 dark:text-zinc-400 tracking-wide leading-relaxed text-base",
        className
      )}
    >
      {children}
    </div>
  );
};

