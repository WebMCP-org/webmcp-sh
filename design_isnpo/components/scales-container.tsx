"use client";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useRef } from "react";
import { Scale } from "./scale";
import { cn } from "@/lib/utils";

const springConfig = {
  stiffness: 300,
  damping: 30,
};

export const ScalesContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const translateX = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / rect.width;
    const y = (e.clientY - centerY) / rect.height;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  return (
    <motion.div
      ref={ref}
      className={cn("relative h-full w-full", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Scale className="rounded-2xl" />
      <motion.div
        style={{
          translateX,
          translateY,
        }}
        className="relative z-30"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
