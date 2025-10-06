import { cn } from "@/lib/utils";
import React from "react";

export const Container = <T extends React.ElementType = "div">({
  children,
  className,
  as,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  as?: T;
} & Omit<React.ComponentProps<T>, "children" | "className" | "as">) => {
  const Component = as || "div";

  return (
    <Component
      {...props}
      className={cn("mx-auto w-full max-w-7xl", className)}
    >
      {children}
    </Component>
  );
};
