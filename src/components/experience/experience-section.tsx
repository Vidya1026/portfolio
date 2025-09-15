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
    <section className="relative py-16 md:py-24">
      <div className="container">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">Experience</span>
          </h2>
        </FadeIn>

        <div className="mt-8 space-y-6 relative">
          {items.map((it, idx) => (
            <ExperienceItem key={idx} {...it} last={idx === items.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}