"use client";
import React, { useEffect, useState } from "react";
import { Container } from "./container";
import { DivideX } from "./divide";
import { Dot } from "./common/dots";
import { testimonials } from "@/constants/testimonials";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import { PixelatedCanvas } from "./pixelated-canvas";

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const selectedTestimonial = testimonials[currentIndex];

  const totalTestimonials = testimonials.length;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalTestimonials);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [totalTestimonials, currentIndex]);
  return (
    <>
      <Container className="border-divide border-x">
        <h2 className="pt-20 pb-10 text-center font-mono text-sm tracking-tight text-neutral-500 uppercase dark:text-neutral-400">
          Trusted by Fast Growing Startups
        </h2>
      </Container>
      <DivideX />
      <Container className="border-divide relative border-x">
        <Dot top left />
        <Dot top right />
        <Dot bottom left />
        <Dot bottom right />

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={selectedTestimonial.src}
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            className="divide-divide grid grid-cols-1 items-stretch divide-x bg-gray-100 md:h-[28rem] md:grid-cols-4 dark:bg-neutral-800"
          >
            <div className="col-span-4 flex flex-col gap-10 px-4 py-10 md:flex-row md:py-0 lg:col-span-3">
              <Image
                src={selectedTestimonial.avatar}
                alt={selectedTestimonial.name}
                width={400}
                height={400}
                className="m-4 hidden aspect-square rounded-xl object-cover md:block"
                draggable={false}
              />
              <div className="flex flex-col items-start justify-between gap-4 py-4 pr-8">
                <div>
                  <Image
                    src={selectedTestimonial.src}
                    alt={selectedTestimonial.company}
                    width={200}
                    height={200}
                    className={cn(
                      "object-contain dark:invert dark:filter",
                      selectedTestimonial.logoClassName,
                    )}
                    draggable={false}
                  />
                  <blockquote className="text-charcoal-900 mt-6 text-xl leading-relaxed dark:text-neutral-100">
                    &quot;{selectedTestimonial.quote}&quot;
                  </blockquote>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <Image
                    src={selectedTestimonial.avatar}
                    alt={selectedTestimonial.name}
                    width={400}
                    height={400}
                    className="aspect-square w-10 rounded-xl object-cover md:hidden"
                  />
                  <div>
                    <p className="text-charcoal-900 font-semibold dark:text-neutral-100">
                      {selectedTestimonial.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      {selectedTestimonial.position},{" "}
                      {selectedTestimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden flex-col justify-end px-4 pb-4 lg:col-span-1 lg:flex">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-charcoal-700 text-7xl font-semibold dark:text-neutral-100">
                    {selectedTestimonial.sideText}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-neutral-400">
                    {selectedTestimonial.sideSubText}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="border-divide grid grid-cols-2 border-t md:grid-cols-4">
          {testimonials.slice(0, 8).map((testimonial, index) => {
            return (
              <button
                key={testimonial.src + index}
                className={cn(
                  "border-divide group relative overflow-hidden",
                  "border-r md:border-r-0",
                  index % 2 === 0 ? "border-r" : "",
                  index < 6 ? "border-b md:border-b-0" : "",
                  "md:border-r-0",
                  index % 4 !== 3 ? "md:border-r" : "",
                  index < 4 ? "md:border-b" : "",
                )}
                onClick={() => {
                  setCurrentIndex(index);
                }}
              >
                {selectedTestimonial.src === testimonial.src && (
                  <PixelatedCanvas
                    key={testimonial.src + "index" + "canvas"}
                    isActive={true}
                    fillColor="var(--color-canvas)"
                    backgroundColor="var(--color-canvas-fill)"
                    size={2.5}
                    duration={2500}
                    className="absolute inset-0 scale-[1.01] opacity-20"
                  />
                )}
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={testimonial.src + index}
                    className="group flex min-h-32 items-center justify-center p-4 py-10 opacity-70 grayscale transition-all duration-500 hover:opacity-100"
                    initial={{
                      y: 80,
                      opacity: 0,
                    }}
                    animate={{
                      y: 0,
                      opacity: 0.7,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut",
                    }}
                    whileHover={{
                      opacity: 1,
                    }}
                  >
                    <motion.img
                      draggable={false}
                      src={testimonial.src}
                      alt={testimonial.company}
                      className={cn(
                        "h-8 w-auto object-contain transition-all duration-500 dark:invert dark:filter",
                        testimonial.logoClassName,
                      )}
                    />
                  </motion.div>
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </Container>
    </>
  );
};
