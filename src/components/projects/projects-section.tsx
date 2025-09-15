"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { ProjectCard } from "./project-card";

const sample = [
  {
    title: "AI-enabled Chess Robot",
    year: "2023",
    blurb:
      "SCARA arm plays chess against humans; Python plans moves via Stockfish and controls motors through Arduino.",
    tags: ["Python", "Arduino", "Stockfish", "OpenCV"],
    ctaCode: "https://github.com/your/repo",
  },
  {
    title: "Real-time Analytics Dashboard",
    year: "2024",
    blurb:
      "High-performance dashboard for monitoring business metrics with real-time updates and interactive visualizations.",
    tags: ["Next.js", "Spring Boot", "Redis", "WebSockets", "Recharts"],
    ctaLive: "#",
  },
  {
    title: "Agriculture Price Prediction",
    year: "2023",
    blurb:
      "End-to-end price prediction with preprocessing, model selection (R²), and a Streamlit UI for exploration.",
    tags: ["Python", "Pandas", "Scikit-learn", "Streamlit"],
    ctaCode: "#",
  },
];

export default function ProjectsSection() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="container">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">Featured Projects</span>
          </h2>
        </FadeIn>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sample.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.08}>
              <ProjectCard p={p} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}