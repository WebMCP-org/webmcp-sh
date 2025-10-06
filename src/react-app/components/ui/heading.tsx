import { cn } from "@/lib/utils";
import React from "react";

export const Heading = ({
  children,
  className,
  as: Component = "h1",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) => {
  return (
    <Component
      className={cn(
        "bg-clip-text text-center text-4xl font-bold leading-tight text-transparent md:text-5xl lg:text-6xl",
        "[--base-color:var(--color-charcoal-900)] [--base-gradient-color:var(--color-neutral-700)]",
        "dark:[--base-color:var(--color-neutral-100)] dark:[--base-gradient-color:var(--color-neutral-300)]",
        "[background-image:linear-gradient(var(--base-color),var(--base-gradient-color))]",
        className
      )}
    >
      {children}
    </Component>
  );
};

export const SubHeading = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        "text-center text-base text-gray-600 dark:text-gray-300 sm:text-lg",
        className
      )}
    >
      {children}
    </p>
  );
};
