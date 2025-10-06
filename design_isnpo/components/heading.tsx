import React from "react";
import { cn } from "@/lib/utils";

export const Heading = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h1
      className={cn(
        "text-center text-3xl font-medium tracking-tight text-black md:text-4xl lg:text-6xl dark:text-white",
        className,
      )}
    >
      {children}
    </h1>
  );
};
