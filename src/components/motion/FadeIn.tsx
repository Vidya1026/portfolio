"use client";
import { motion, type MotionProps, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = MotionProps & {
  className?: string;
  children: React.ReactNode;
  /** Delay in seconds */
  delay?: number;
};

/**
 * Lightweight fade-in that avoids jank:
 * - Shorter duration / smaller translate distance
 * - Triggers a bit earlier in the viewport
 * - Respects "prefers-reduced-motion"
 */
export function FadeIn({ className, children, delay = 0, ...rest }: Props) {
  const prefersReduced = useReducedMotion();

  const initial = prefersReduced ? { opacity: 0 } : { opacity: 0, y: 4 };
  const animate = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      className={cn(className)}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: prefersReduced ? 0.15 : 0.35, ease: "easeOut", delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}