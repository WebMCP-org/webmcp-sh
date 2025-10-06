"use client";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

export const Dot = ({
  top,
  left,
  right,
  bottom,
}: {
  top?: boolean;
  left?: boolean;
  right?: boolean;
  bottom?: boolean;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isNearMouse, setIsNearMouse] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (dotRef.current) {
      const dotRect = dotRef.current.getBoundingClientRect();
      const dotCenterX = dotRect.left + dotRect.width / 2;
      const dotCenterY = dotRect.top + dotRect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mousePosition.x - dotCenterX, 2) +
          Math.pow(mousePosition.y - dotCenterY, 2),
      );

      setIsNearMouse(distance <= 100);
    }
  }, [mousePosition]);

  const { theme } = useTheme();

  return (
    <motion.div
      ref={dotRef}
      className={cn(
        "absolute z-10 h-2 w-2",
        top && "top-0 xl:-top-1",
        left && "left-0 xl:-left-2",
        right && "right-0 xl:-right-2",
        bottom && "bottom-0 xl:-bottom-1",
      )}
      animate={{
        backgroundColor: isNearMouse
          ? "var(--color-brand)"
          : "var(--color-primary)",
        boxShadow: isNearMouse
          ? "0 0 20px var(--color-brand), 0 0 40px var(--color-brand)"
          : "none",
        scale: isNearMouse ? 1.5 : 1,
        borderRadius: isNearMouse ? "50%" : "0%",
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    />
  );
};
