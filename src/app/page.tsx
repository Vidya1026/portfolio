"use client";
import { Button } from "@/components/ui/button";
import { Aurora } from "@/components/branding/Aurora";
import { FadeIn } from "@/components/motion/FadeIn";
import ProjectsSection from "@/components/projects/projects-section";
import ExperienceSection from "@/components/experience/experience-section";
import CertificationsSection from "@/components/certifications/certifications-section";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [showStrengths, setShowStrengths] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      // hide panel when scrolling down, show when scrolling up
      if (y > lastY.current + 4) setShowStrengths(false);
      else if (y < lastY.current - 4) setShowStrengths(true);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Optional profile image from env (drop a file in /public and set URL)
  const profileUrl = process.env.NEXT_PUBLIC_PROFILE_URL;

  const ribbonItems = [
    "Next.js", "React", "TypeScript", "Tailwind", "LangChain", "RAG",
    "Postgres", "Redis", "Spring Boot", "WebSockets", "Docker",
    "GCP", "AWS", "Terraform", "Prisma", "FastAPI"
  ];

  return (
    <>
      <main id="home" className="relative min-h-[78vh] grid grid-cols-1 md:grid-cols-2 place-items-center md:items-start overflow-hidden bg-background section-anchor pt-10 md:pt-20">
        <Aurora />
        <div className="w-full">
          <section className="text-center space-y-4 pt-8 pb-16 mx-auto max-w-3xl">
            <FadeIn>
              <div className="mb-3 flex justify-center">
                <span className="pill-green blink inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full shadow-[0_0_0_1px_rgba(34,197,94,0.45),0_0_24px_rgba(34,197,94,0.45)] ring-1 ring-emerald-400/40">
                  <span className="text-emerald-300">⚡</span>
                  Open to work
                </span>
              </div>
              <h1 className="inline-block text-4xl md:text-6xl font-extrabold tracking-tight gradient-text leading-[1.15] pb-1">
                Bhargava — Full-Stack • AI/RAG
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Clean React/Next frontends. Resilient Java/Spring backends. RAG systems that ship.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="group relative overflow-hidden rounded-xl btn-green-glow px-6 py-3 font-semibold"
                >
                  <span className="relative z-10">View Resume</span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 group-hover:translate-x-[120%]" />
                </Button>

                <Button
                  variant="secondary"
                  asChild
                  size="lg"
                  className="group relative overflow-hidden rounded-xl bg-transparent border border-violet-400/60 text-violet-200 hover:bg-violet-500/15 px-6 py-3 font-semibold shadow-[0_0_0_1px_rgba(139,92,246,0.55),0_0_24px_rgba(139,92,246,0.35)] hover:shadow-[0_0_0_1px_rgba(167,139,250,0.8),0_0_36px_rgba(167,139,250,0.55)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
                >
                  <a href="mailto:hello@example.com" className="relative z-10 inline-flex items-center gap-2">
                    <span className="i-tabler-mail text-[18px]" />
                    Email Me
                    <span className="pointer-events-none absolute inset-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 group-hover:translate-x-[120%]" />
                  </a>
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={0.25}>
              <div className="mx-auto mt-10 w-full max-w-3xl px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                  {/* GenAI & RAG */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/[0.06] p-7 md:p-8 h-[190px] md:h-[220px] flex items-start transition-all duration-300 hover:-translate-y-1 hover:ring-white/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                    <div className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 w-40 md:w-56 h-40 md:h-56 rounded-full bg-violet-500/10 blur-2xl group-hover:bg-violet-500/20 transition-colors" />
                    <div className="relative z-10 flex gap-4">
                      <span className="inline-grid place-items-center size-12 rounded-xl bg-violet-500/30 ring-1 ring-white/10 text-xl">🧠</span>
                      <div className="text-left">
                        <div className="text-lg md:text-xl font-semibold text-white/90">GenAI & RAG</div>
                        <p className="mt-1 text-sm text-white/65 leading-snug">Grounded answers with your data. Retrieval‑Augmented Generation that boosts search accuracy.</p>
                      </div>
                    </div>
                    <span className="pointer-events-none absolute inset-0 translate-x-[-60%] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[120%] transition duration-700" />
                  </div>

                  {/* Full‑Stack */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/[0.06] p-7 md:p-8 h-[190px] md:h-[220px] flex items-start transition-all duration-300 hover:-translate-y-1 hover:ring-white/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                    <div className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 w-40 md:w-56 h-40 md:h-56 rounded-full bg-fuchsia-500/10 blur-2xl group-hover:bg-fuchsia-500/20 transition-colors" />
                    <div className="relative z-10 flex gap-4">
                      <span className="inline-grid place-items-center size-12 rounded-xl bg-violet-500/30 ring-1 ring-white/10 text-xl">🚀</span>
                      <div className="text-left">
                        <div className="text-lg md:text-xl font-semibold text-white/90">Full‑Stack</div>
                        <p className="mt-1 text-sm text-white/65 leading-snug">React/Next frontends with resilient Java/Spring Boot services and real‑time UX.</p>
                      </div>
                    </div>
                    <span className="pointer-events-none absolute inset-0 translate-x-[-60%] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[120%] transition duration-700" />
                  </div>

                  {/* Cloud & CI/CD */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/[0.06] p-7 md:p-8 h-[190px] md:h-[220px] flex items-start transition-all duration-300 hover:-translate-y-1 hover:ring-white/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                    <div className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 w-40 md:w-56 h-40 md:h-56 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                    <div className="relative z-10 flex gap-4">
                      <span className="inline-grid place-items-center size-12 rounded-xl bg-violet-500/30 ring-1 ring-white/10 text-xl">⚡</span>
                      <div className="text-left">
                        <div className="text-lg md:text-xl font-semibold text-white/90">Cloud & CI/CD</div>
                        <p className="mt-1 text-sm text-white/65 leading-snug">Dockerized deployments and automated pipelines on AWS & GCP with Terraform.</p>
                      </div>
                    </div>
                    <span className="pointer-events-none absolute inset-0 translate-x-[-60%] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[120%] transition duration-700" />
                  </div>
                </div>
              </div>
            </FadeIn>
            {/* Futuristic tech ribbon to softly fill the gap */}
            <div className="relative mt-28 md:mt-32 max-w-3xl mx-auto mb-6">
              {/* ambient glow */}
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-0 top-0 size-40 rounded-full bg-violet-500/15 blur-3xl" />
                <div className="absolute right-0 bottom-0 size-40 rounded-full bg-emerald-500/15 blur-3xl" />
              </div>

              {/* tiny robot that hops across the ribbon */}
              <span
                aria-hidden
                className="robot absolute -top-8 left-0 select-none pointer-events-none text-xl md:text-2xl"
              >
                🤖
              </span>

              <div className="group/ribbon relative overflow-hidden rounded-full ring-1 ring-white/10 bg-white/[0.04] backdrop-blur px-2 py-3 min-h-[44px] hover:ring-white/20 transition skills-ribbon">
                <ul className="marquee inline-flex gap-3 whitespace-nowrap will-change-transform">
                  {ribbonItems.concat(ribbonItems).map((label, idx) => (
                    <li
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/10 text-sm text-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:bg-white/[0.12] transition-colors"
                    >
                      <span className="inline-block size-1.5 rounded-full bg-gradient-to-r from-violet-400 to-emerald-400" />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
        <div className="flex justify-center items-center">
          <div className="relative">
            {/* Gradient tile */}
            <div className="relative w-[300px] h-[320px] md:w-[360px] md:h-[390px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_30%_20%,rgba(124,58,237,0.45),transparent_60%),radial-gradient(40%_60%_at_75%_70%,rgba(34,197,94,0.35),transparent_60%),linear-gradient(180deg,rgba(17,24,39,0.9),rgba(17,24,39,0.9))]" />
              {/* floating particles */}
              <span className="absolute top-8 left-1/3 size-2 rounded-full bg-emerald-300/90 animate-pulse" />
              <span className="absolute top-1/3 right-12 size-1.5 rounded-full bg-violet-300/80 animate-ping" />
              <span className="absolute bottom-8 left-10 size-1.5 rounded-full bg-sky-300/80 animate-ping" />
              {/* center avatar */}
              <div className="absolute inset-0 grid place-items-center">
                <div className="size-24 md:size-28 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 grid place-items-center overflow-hidden">
                  {profileUrl ? (
                    <Image src={profileUrl} alt="Profile" fill className="object-cover" />
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-white/90">B</span>
                  )}
                </div>
              </div>
              {/* role label */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/15 text-[13px] text-white/90 backdrop-blur-md">
                <span className="inline-block size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <span>AI Engineer</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Experience (moved above projects) */}
      <section id="experience" className="section-anchor pt-8">
        <div className="mx-auto w-full max-w-6xl section-gutter px-4 md:px-6">
          <FadeIn>
            <div className="card-hover rounded-2xl ring-1 ring-white/10 bg-gradient-to-r from-emerald-500/5 to-violet-500/5 transition-all duration-500 motion-safe:hover:translate-x-0.5 motion-safe:hover:-translate-y-0.5 hover:from-emerald-500/10 hover:to-violet-500/10">
              <ExperienceSection />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Projects — left-aligned grid of glowing cards */}
      <section id="projects" className="section-anchor pt-10">
        <div className="mx-auto w-full max-w-6xl section-gutter px-4 md:px-6">
          <FadeIn>
            <div className="projects-area">
              <ProjectsSection />
            </div>
          </FadeIn>
        </div>
      </section>

      <CertificationsSection />

      <footer className="mt-12 md:mt-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 text-center">
          <p className="text-sm text-white/55">
            © 2025 Gunapu Bhargava Sai Vardhan. All rights reserved.
          </p>
        </div>
      </footer>

      <section id="chat" className="section-anchor" />
      <style jsx global>{`
        /* Make inner project grid left‑aligned and stretch cards */
        .projects-area :where(.grid){
          justify-items: stretch;
        }
        /* Keep cards/grid left‑aligned but allow the section header to be centered */
        .projects-area .grid .section-title,
        .projects-area .grid h2{
          text-align: left;
          margin-left: 0;
        }

        /* Card base for anything resembling a project card */
        .projects-area :where(article, .project-card, .card, .project){
          border-radius: 20px;
          background: rgba(255,255,255,0.04);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.08),
            0 14px 44px rgba(0,0,0,0.50),
            inset 0 0 0 1px rgba(255,255,255,0.02);
          transition: transform .35s cubic-bezier(.2,.8,.2,1),
                      box-shadow .35s ease, background .35s ease;
          position: relative;
          overflow: hidden;
        }

        /* Subtle gradient wash + shimmer on hover */
        .projects-area :where(article, .project-card, .card, .project)::before{
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(80% 80% at 10% 0%, rgba(139,92,246,.16), transparent 60%),
            radial-gradient(80% 80% at 90% 100%, rgba(34,197,94,.14), transparent 60%);
          opacity: .65;
          pointer-events: none;
          transition: opacity .35s ease;
        }
        .projects-area :where(article, .project-card, .card, .project)::after{
          content:"";
          position:absolute;
          inset:-120% 0 auto 0;
          height: 220%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
          transform: translateX(-120%);
          transition: transform 1s ease;
          pointer-events: none;
        }

        /* Wiggle + lift + stronger glow on hover */
        .projects-area :where(article, .project-card, .card, .project):hover{
          transform: translateY(-8px) rotate(.3deg);
          box-shadow:
            0 0 0 1px rgba(167,139,250,0.55),
            0 24px 80px rgba(124,58,237,0.28),
            0 14px 44px rgba(34,197,94,0.2);
        }
        .projects-area :where(article, .project-card, .card, .project):hover::after{
          transform: translateX(120%);
        }

        /* tiny wiggle animation on focus-visible to aid keyboard users */
        @keyframes card-wiggle {
          0%   { transform: translateY(-8px) rotate(.25deg); }
          50%  { transform: translateY(-10px) rotate(-.2deg); }
          100% { transform: translateY(-8px) rotate(.25deg); }
        }
        .projects-area :where(article, .project-card, .card, .project):focus-visible{
          outline: none;
          animation: card-wiggle .65s ease-in-out;
          box-shadow:
            0 0 0 2px rgba(167,139,250,0.6),
            0 20px 60px rgba(124,58,237,0.35),
            0 14px 40px rgba(34,197,94,0.22);
        }
      `}</style>
      <style jsx>{`
        .marquee {
          animation: ribbon-scroll 28s linear infinite;
        }
        .group\/ribbon:hover .marquee {
          animation-play-state: paused;
        }
        .group\/ribbon:hover .robot {
          animation-play-state: paused;
        }
        @keyframes ribbon-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* keep the ribbon from crowding the content above */
        .skills-ribbon { box-shadow: 0 8px 40px rgba(0,0,0,.25); }

        /* Robot: moves left-to-right across the ribbon while hopping */
        .robot {
          animation:
            robot-move 28s steps(16, end) infinite,
            robot-hop 0.9s ease-in-out infinite alternate;
          filter: drop-shadow(0 6px 10px rgba(0,0,0,.35));
        }

        /* Match the ribbon scroll speed/duration so it feels synced */
        @keyframes robot-move {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(100% - 1.5rem)); }
        }

        @keyframes robot-hop {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}