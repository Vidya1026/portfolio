"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { ProjectCard } from "./project-card";
// The shine/tilt effects rely on CSS keyframes in globals and will be added next

/**
 * NOTE:
 * - I enriched the sample data so each project can show a "Key Impact" list
 *   and CTA actions (live/code/case study) in the ProjectCard.
 * - Even if the current ProjectCard ignores some of these fields, keeping them
 *   here makes it easy to wire up once we open that file.
 * - The section layout now matches your reference: centered title + subheadline,
 *   a thin gradient divider, and a left‑aligned responsive grid underneath.
 * - Each card sits in a "glow wrapper" so we get a soft halo and subtle wiggle
 *   on hover without touching the card internals yet.
 */

type ProjectItem = {
  title: string;
  year: string;
  blurb: string;
  tags: string[];
  keyImpacts?: string[];
  ctaLive?: string;
  ctaCode?: string;
  ctaCase?: string;
};

const sample: ProjectItem[] = [
  {
    title: "AI-enabled Chess Robot",
    year: "2023",
    blurb:
      "SCARA arm plays chess against humans; Python plans moves via Stockfish and controls motors through Arduino.",
    tags: ["Python", "Arduino", "Stockfish", "OpenCV"],
    keyImpacts: [
      "Autonomous chess moves via Stockfish + motor control.",
      "Camera-based board detection; synchronized actuation."
    ],
    ctaCode: "https://github.com/your/repo",
    ctaCase: "#",
  },
  {
    title: "Real-time Analytics Dashboard",
    year: "2024",
    blurb:
      "High-performance dashboard for monitoring business metrics with real-time updates and interactive visualizations.",
    tags: ["Next.js", "Spring Boot", "Redis", "WebSockets", "Recharts"],
    keyImpacts: [
      "Sub‑100ms live update latency with WebSockets.",
      "Reduced page load time by ~60% through smart caching."
    ],
    ctaLive: "#",
    ctaCode: "#",
    ctaCase: "#",
  },
  {
    title: "Agriculture Price Prediction",
    year: "2023",
    blurb:
      "End-to-end price prediction with preprocessing, model selection (R²), and a Streamlit UI for exploration.",
    tags: ["Python", "Pandas", "Scikit-learn", "Streamlit"],
    keyImpacts: [
      "Reproducible ML pipeline; interactive explorer via Streamlit.",
      "Practical forecasting demo with clear model evaluation."
    ],
    ctaCode: "#",
    ctaCase: "#",
  },
];

export default function ProjectsSection() {
  return (
    <section className="relative z-10 isolate py-18 md:py-24">
      <div className="container">
        {/* Heading block */}
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              <span className="gradient-text">Featured Projects</span>
            </h2>

            <p className="mt-4 text-sm md:text-base text-muted-foreground">
              A selection of impactful projects showcasing full‑stack engineering and AI integration.
            </p>

            {/* Slim gradient divider like the reference */}
            <div className="mx-auto mt-6 h-px w-40 md:w-56 bg-gradient-to-r from-transparent via-violet-500/60 to-transparent rounded-full" />
            {/* ambient dots */}
            <div className="pointer-events-none mx-auto mt-2 h-[2px] w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          </div>
        </FadeIn>

        {/* Card grid */}
        <div className="relative z-10 isolate mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-stretch">
          {sample.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.08}>
              {/* Glow + wiggle wrapper without touching ProjectCard internals */}
              <div
                className="
                  group relative z-0
                  [--halo:theme(colors.violet.500/18)]
                  [--ring:conic-gradient(from_180deg,theme(colors.violet.500/.4),theme(colors.fuchsia.500/.35),theme(colors.cyan.400/.35),theme(colors.violet.500/.4))]
                  hover:animate-[wiggle_800ms_ease-in-out]
                  transition-transform duration-300 will-change-transform
                  hover:scale-[1.02] hover:-translate-y-1
                "
              >
                {/* animated gradient ring on hover */}
                {/* soft halo */}
                <div className="pointer-events-none absolute -inset-1.5 rounded-2xl bg-[radial-gradient(30%_40%_at_50%_0%,var(--halo),transparent_70%)] opacity-0 group-hover:opacity-80 transition-opacity duration-300 -z-10" />
                {/* card host (enforce minimum height so cards feel tall) */}
                <div className="relative z-10 isolate min-h-[460px] flex rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-[0.5px] overflow-hidden project-card">
                  {/* subtle sheen sweep (CSS-only, defined in globals.css) */}
                  <div aria-hidden className="card-sheen" />
                  {/* Pass enriched project object. ProjectCard can pick up any extra fields later. */}
                  <ProjectCard p={p as any} />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}