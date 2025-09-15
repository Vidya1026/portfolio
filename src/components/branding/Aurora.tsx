"use client";
import { cn } from "@/lib/utils";

export function Aurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 aurora-bg",
        "animate-aurora blur-2xl"
      )}
    />
  );
}