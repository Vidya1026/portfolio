"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export default function SpotlightCard({ className, children }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);

  // track pointer & write CSS vars for the mask
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn(
        // base card
        "relative rounded-2xl border bg-card/60 backdrop-blur-xs z-10 isolate",
        "transition-transform duration-300 ease-out",
        "will-change-transform",
        className
      )}
      // subtle tilt
      onMouseEnter={(e) => {
        const el = ref.current;
        if (!el) return;
        el.animate([{ transform: "rotateX(0deg) rotateY(0deg)" }, { transform: "rotateX(2deg) rotateY(-2deg)" }], {
          duration: 200,
          fill: "forwards",
          easing: "ease-out",
        });
      }}
      onMouseLeave={(e) => {
        const el = ref.current;
        if (!el) return;
        el.animate([{ transform: "rotateX(0deg) rotateY(0deg)" }], {
          duration: 180,
          fill: "forwards",
          easing: "ease-out",
        });
      }}
    >
      {/* spotlight layer (mask follows cursor) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl -z-10 spotlight-mask"
        style={{
          background:
            "radial-gradient(180px 180px at var(--x) var(--y), rgba(167,139,250,0.20), transparent 60%)",
        }}
      />
      {/* glow edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl -z-10"
        style={{
          boxShadow:
            "0 0 0 1px hsl(var(--ring) / 0.25), inset 0 0 40px rgba(167,139,250,0.08)",
        }}
      />
      <div className="relative z-10 isolate p-5 md:p-6">{children}</div>
    </div>
  );
}