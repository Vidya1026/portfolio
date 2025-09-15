"use client";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = MotionProps & { className?: string; children: React.ReactNode; delay?: number };

export function FadeIn({ className, children, delay = 0, ...rest }: Props) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}