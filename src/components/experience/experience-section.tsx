"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { ExperienceItem } from "./experience-item";

const items = [
  {
    org: "Your Company / Project",
    role: "Full-Stack Engineer",
    start: "2024",
    end: "Present",
    bullets: [
      "Built React/Next frontends and Java/Spring backends with clean, testable code.",
      "Implemented RAG features (Gemini + pgvector) to ground answers in docs.",
      "Optimized performance: reduced TTFB by 35% and page weight by 28%.",
    ],
  },
  {
    org: "Client / Internship",
    role: "Software Engineer",
    start: "2023",
    end: "2024",
    bullets: [
      "Delivered real-time dashboards with WebSockets + Redis pub/sub.",
      "Cut load time by ~60% using smart caching and image optimization.",
      "Led UI polish: micro-interactions, scroll scenes, and accessibility passes.",
    ],
  },
];

export default function ExperienceSection() {
  return (
    <section className="relative z-10 isolate py-16 md:py-24">
      <div className="container relative">
        <FadeIn>
          <div className="mx-auto max-w-4xl text-center relative">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              <span className="gradient-text drop-shadow-[0_0_12px_rgba(167,139,250,0.65)]">
                Experience
              </span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Professional roles and projects highlighted with futuristic design.
            </p>
            {/* glowing divider */}
            <div className="mx-auto mt-6 h-px w-48 md:w-64 bg-gradient-to-r from-transparent via-violet-500/70 to-transparent rounded-full animate-pulse" />
            <div className="mx-auto mt-2 h-[2px] w-32 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rounded-full" />
          </div>
        </FadeIn>

        {/* ambient background blobs (CSS-only, defined in globals.css) */}
        <div aria-hidden className="exp-bg pointer-events-none absolute inset-0 -z-10">
          <div className="exp-blob exp-blob--left" />
          <div className="exp-blob exp-blob--right" />
        </div>

        <div className="mt-10 relative pl-10 sm:pl-14">
          {/* vertical timeline glow (CSS defined in globals.css) */}
          <div aria-hidden className="exp-line pointer-events-none absolute left-4 sm:left-6 top-0 bottom-0 -z-10" />
          <div aria-hidden className="exp-line-cap exp-line-cap--top pointer-events-none absolute left-4 sm:left-6 -top-6 h-6 w-px -z-10" />
          <div aria-hidden className="exp-line-cap exp-line-cap--bottom pointer-events-none absolute left-4 sm:left-6 -bottom-6 h-6 w-px -z-10" />
          <div className="space-y-6">
            {items.map((it, idx) => (
              <ExperienceItem key={idx} {...it} last={idx === items.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}