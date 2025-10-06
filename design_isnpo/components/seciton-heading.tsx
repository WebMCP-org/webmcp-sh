import React from "react";
import { cn } from "@/lib/utils";

export const SectionHeading = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h2
      className={cn(
        "text-charcoal-700 text-center text-2xl font-medium tracking-tight md:text-3xl lg:text-4xl dark:text-neutral-100",
        className,
      )}
    >
      {children}
    </h2>
  );
};
