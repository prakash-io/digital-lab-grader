import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { IconArrowRight } from "@tabler/icons-react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-6 py-10 max-w-7xl mx-auto w-full",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          href={item?.link}
          key={item?.link}
          className="relative group block p-3 h-full w-full"
        >
          <Card icon={item.icon}>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </a>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
  icon,
}: {
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-6 overflow-hidden bg-black border-2 border-purple-500/50 dark:border-purple-400/50 group-hover:border-purple-500 dark:group-hover:border-purple-400 relative z-20 min-h-[280px] transition-colors duration-200",
        className
      )}
    >
      <div className="relative z-50 flex flex-col h-full">
        {icon && (
          <div className="mb-4 text-zinc-100 group-hover:text-white transition-colors">
            {icon}
          </div>
        )}
        <div className="flex-1">{children}</div>
        <div className="mt-6 flex items-center text-zinc-400 group-hover:text-zinc-300 transition-colors">
          <span className="text-sm font-medium">Learn more</span>
          <motion.span
            className="ml-2"
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <IconArrowRight className="w-5 h-5" />
          </motion.span>
        </div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-zinc-100 font-bold tracking-wide text-xl mb-3", className)}>
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "text-zinc-400 tracking-wide leading-relaxed text-base",
        className
      )}
    >
      {children}
    </p>
  );
};

