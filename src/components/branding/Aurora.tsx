"use client";

import { cn } from "@/lib/utils";

export function Aurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-20 aurora-bg animate-aurora blur-2xl",
        className
      )}
    />
  );
}