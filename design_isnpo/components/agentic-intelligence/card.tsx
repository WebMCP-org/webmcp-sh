import React from "react";
import { cn } from "@/lib/utils";

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("p-4 md:p-8", className)}>{children}</div>;
};

export const CardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3
      className={cn(
        "text-charcoal-700 text-lg font-medium dark:text-neutral-100",
        className,
      )}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        "mt-2 text-base text-gray-600 dark:text-gray-300",
        className,
      )}
    >
      {children}
    </p>
  );
};
