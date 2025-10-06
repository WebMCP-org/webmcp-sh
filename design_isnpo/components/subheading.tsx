import React from "react";
import { cn } from "@/lib/utils";

export const SubHeading = ({
  children,
  className,
  as: Component = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) => {
  return (
    <Component
      className={cn(
        "text-center text-sm font-medium tracking-tight text-gray-600 md:text-sm lg:text-base dark:text-gray-300",
        className,
      )}
    >
      {children}
    </Component>
  );
};
