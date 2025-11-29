import { cn } from "@/lib/utils";

interface EnhancedBadgeProps {
  text: string;
  className?: string;
}

export const EnhancedBadge = ({ text, className }: EnhancedBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        "bg-primary/10 text-primary",
        "dark:bg-primary/20 dark:text-primary",
        className
      )}
    >
      {text}
    </span>
  );
};
