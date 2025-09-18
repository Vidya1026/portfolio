"use client";
import { Button } from "@/components/ui/button";
import { Aurora } from "@/components/branding/Aurora";
import { FadeIn } from "@/components/motion/FadeIn";
import ProjectsSection from "@/components/projects/projects-section";
import ExperienceSection from "@/components/experience/experience-section";
import CertificationsSection from "@/components/certifications/certifications-section";
import Image from "next/image";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";

// --- Animated metrics (Years / Projects / Certifications) ---
function useCount(target: number, active: boolean, duration = 1200) {
  const [n, setN] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const step = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return n;
}

function MetricCard({ icon, target, label, suffix = "", delay = 0, className = "", accent = "violet" as "violet" | "emerald" | "sky" }: { icon: ReactNode; target: number; label: string; suffix?: string; delay?: number; className?: string; accent?: "violet" | "emerald" | "sky" }) {
  const [active, setActive] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const value = useCount(target, active);
  const accentBg = {
    violet: "from-violet-500/60 to-fuchsia-500/60",
    emerald: "from-emerald-500/60 to-teal-500/60",
    sky: "from-sky-500/60 to-cyan-500/60",
  }[accent];
  const orbBg = {
    violet: "bg-violet-500/20",
    emerald: "bg-emerald-500/20",
    sky: "bg-sky-500/20",
  }[accent];
  const numberGrad = {
    violet: "from-violet-200 to-fuchsia-200",
    emerald: "from-emerald-200 to-teal-200",
    sky: "from-sky-200 to-cyan-200",
  }[accent];
  useEffect(() => {
    const el = hostRef.current!;
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) setActive(true);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={hostRef}
      className={`group relative overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/10 px-4 py-2 md:px-5 md:py-2.5 backdrop-blur transition hover:-translate-y-0.5 hover:ring-white/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] will-change-transform ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} ${className}`}
      style={{ transitionDuration: "600ms", transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)", transitionDelay: `${delay}ms` }}
    >
      {/* glow orb */}
      <span aria-hidden className={`absolute -z-10 -left-6 -top-8 size-24 rounded-full ${orbBg} blur-2xl`} />
      {/* sheen */}
      <span className="pointer-events-none absolute inset-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 group-hover:translate-x-[120%]" />
      <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap">
        <span className={`inline-grid place-items-center size-7 md:size-8 rounded-md ring-1 ring-white/10 text-white/95 shadow-[0_0_24px_rgba(0,0,0,0.25)] bg-gradient-to-br ${accentBg}`}>
          {icon}
        </span>
        <span className={`text-lg md:text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${numberGrad}`}>
          {value}
          <span className="ml-0.5 text-base md:text-lg font-semibold text-white/80">{suffix}</span>
        </span>
        <span className="text-xs md:text-sm text-white/75">{label}</span>
      </div>
      {/* tiny sparkles */}
      <span aria-hidden className="absolute -right-2 top-1 size-2 rounded-full bg-white/70 blur-[1px] opacity-70 animate-ping" />
      <span aria-hidden className="absolute right-6 -bottom-2 size-1.5 rounded-full bg-white/60 opacity-60 animate-pulse" />
    </div>
  );
}

const SvgBriefcase = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[14px] md:size-[16px]">
    <path d="M9 7V6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1"/>
    <path d="M3 7h18v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z"/>
    <path d="M3 12h18"/>
  </svg>
);

const SvgApps = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[14px] md:size-[16px]">
    <rect x="4" y="4" width="7" height="7" rx="1.5"/>
    <rect x="13" y="4" width="7" height="7" rx="1.5"/>
    <rect x="4" y="13" width="7" height="7" rx="1.5"/>
    <rect x="13" y="13" width="7" height="7" rx="1.5"/>
  </svg>
);

const SvgCertificate = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[14px] md:size-[16px]">
    <circle cx="12" cy="9" r="4"/>
    <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/>
  </svg>
);

function MetricsBar() {
  return (
    <div className="mt-4 relative">
      {/* vertical connector aligned to all rows */}
      <div aria-hidden className="pointer-events-none absolute left-3 md:left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />

      <div className="relative flex flex-col gap-5">
        {/* Row 1 */}
        <div className="flex items-center">
          <span aria-hidden className="ml-2 mr-3 size-2 rounded-full bg-violet-400/90 shadow-[0_0_12px_rgba(139,92,246,.6)]" />
          <MetricCard icon={SvgBriefcase} target={3} label="Years" delay={0} accent="violet" className="ml-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
        </div>
        {/* Row 2 */}
        <div className="flex items-center">
          <span aria-hidden className="ml-2 mr-3 size-2 rounded-full bg-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,.6)]" />
          <MetricCard icon={SvgApps} target={8} label="Projects" suffix="+" delay={120} accent="emerald" className="ml-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
        </div>
        {/* Row 3 */}
        <div className="flex items-center">
          <span aria-hidden className="ml-2 mr-3 size-2 rounded-full bg-sky-400/90 shadow-[0_0_12px_rgba(56,189,248,.6)]" />
          <MetricCard icon={SvgCertificate} target={9} label="Certifications" suffix="+" delay={240} accent="sky" className="ml-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [showStrengths, setShowStrengths] = useState(true);
  const [settings, setSettings] = useState({
    hero_title: "",
    hero_tagline: "",
    metrics_years: "",
    metrics_projects: "",
    metrics_certs: "",
    skills: [] as string[],
    resume_url: "",
    contact_email: "",
    avatar_url: "",
  });
  const lastY = useRef(0);
  const tileRef = useRef<HTMLDivElement | null>(null);
  const onTileMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tileRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;   // 0..1
    const relY = (e.clientY - rect.top) / rect.height;   // 0..1
    const dx = relX - 0.5; // -0.5..0.5
    const dy = relY - 0.5; // -0.5..0.5
    // rotate a bit and translate slightly to feel magnetic
    el.style.setProperty('--rx', `${-(dy * 10)}deg`);
    el.style.setProperty('--ry', `${dx * 10}deg`);
    el.style.setProperty('--tx', `${dx * 8}px`);
    el.style.setProperty('--ty', `${dy * 8}px`);
  };
  const onTileLeave = () => {
    const el = tileRef.current; if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--tx', '0px');
    el.style.setProperty('--ty', '0px');
  };

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

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        setSettings({
          hero_title: data.hero_title ?? "",
          hero_tagline: data.hero_tagline ?? "",
          metrics_years: data.metrics_years ?? "",
          metrics_projects: data.metrics_projects ?? "",
          metrics_certs: data.metrics_certs ?? "",
          skills: Array.isArray(data.skills) ? data.skills : [],
          resume_url: data.resume_url ?? "",
          contact_email: data.contact_email ?? "",
          avatar_url: data.avatar_url ?? "",
        });
      }
    })();
  }, []);

  function parseMetric(input: string | undefined, fallbackNum: number, fallbackSuffix = "") {
    const s = (input || "").trim();
    let num = fallbackNum;
    let suffix = fallbackSuffix;
    if (s) {
      const m = s.match(/^(\d+)/);
      if (m) num = parseInt(m[1], 10);
      if (/\+$/.test(s)) suffix = "+";
    }
    return { num, suffix };
  }

  const mYears = parseMetric(settings.metrics_years, 3);
  const mProjects = parseMetric(settings.metrics_projects, 8, "+");
  const mCerts = parseMetric(settings.metrics_certs, 9, "+");

  // Optional profile image from env (drop a file in /public and set URL)
  const profileUrl = settings.avatar_url || process.env.NEXT_PUBLIC_PROFILE_URL;

  const ribbonItems = (settings.skills && settings.skills.length > 0
    ? settings.skills
    : [
        "Next.js", "React", "TypeScript", "Tailwind", "LangChain", "RAG",
        "Postgres", "Redis", "Spring Boot", "WebSockets", "Docker",
        "GCP", "AWS", "Terraform", "Prisma", "FastAPI"
      ]
  );

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
                {settings.hero_title || "Bhargava — Full-Stack • AI/RAG"}
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {settings.hero_tagline || "Clean React/Next frontends. Resilient Java/Spring backends. RAG systems that ship."}
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex items-center justify-center gap-3">
                {settings.resume_url ? (
                  <Button asChild size="lg" className="group relative overflow-hidden rounded-xl btn-green-glow px-6 py-3 font-semibold">
                    <a href={settings.resume_url} target="_blank" rel="noreferrer noopener">
                      <span className="relative z-10">View Resume</span>
                      <span className="pointer-events-none absolute inset-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 group-hover:translate-x-[120%]" />
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" className="group relative overflow-hidden rounded-xl btn-green-glow px-6 py-3 font-semibold">
                    <span className="relative z-10">View Resume</span>
                    <span className="pointer-events-none absolute inset-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 group-hover:translate-x-[120%]" />
                  </Button>
                )}

                <Button
                  variant="secondary"
                  asChild
                  size="lg"
                  className="group relative overflow-hidden rounded-xl bg-transparent border border-violet-400/60 text-violet-200 hover:bg-violet-500/15 px-6 py-3 font-semibold shadow-[0_0_0_1px_rgba(139,92,246,0.55),0_0_24px_rgba(139,92,246,0.35)] hover:shadow-[0_0_0_1px_rgba(167,139,250,0.8),0_0_36px_rgba(167,139,250,0.55)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
                >
                  <a href={`mailto:${settings.contact_email || 'hello@example.com'}`} className="relative z-10 inline-flex items-center gap-2">
                    <span className="i-tabler-mail text-[18px]" />
                    Email Me
                    <span className="pointer-events-none absolute inset-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 group-hover:translate-x-[120%]" />
                  </a>
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={0.25}>
              <div className="mx-auto mt-10 w-full max-w-5xl px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                  {/* GenAI & RAG */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/[0.06] p-7 md:p-8 min-h-[220px] md:min-h-[260px] flex items-start transition-all duration-300 hover:-translate-y-1 hover:ring-white/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                    <div className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 w-40 md:w-56 h-40 md:h-56 rounded-full bg-violet-500/10 blur-2xl group-hover:bg-violet-500/20 transition-colors" />
                    <div className="relative z-10 flex gap-4">
                      <span className="inline-grid place-items-center size-12 rounded-xl bg-violet-500/30 ring-1 ring-white/10 text-xl">🧠</span>
                      <div className="text-left max-w-[240px] md:max-w-[300px] lg:max-w-[320px]">
                        <div className="text-lg md:text-xl font-semibold text-white/90">GenAI & RAG</div>
                        <p className="mt-1 text-sm md:text-base text-white/70 leading-snug md:leading-normal">Grounded answers with your data. Retrieval‑Augmented Generation that boosts search accuracy.</p>
                      </div>
                    </div>
                    <span className="pointer-events-none absolute inset-0 translate-x-[-60%] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[120%] transition duration-700" />
                  </div>

                  {/* Full‑Stack */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/[0.06] p-7 md:p-8 min-h-[220px] md:min-h-[260px] flex items-start transition-all duration-300 hover:-translate-y-1 hover:ring-white/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                    <div className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 w-40 md:w-56 h-40 md:h-56 rounded-full bg-fuchsia-500/10 blur-2xl group-hover:bg-fuchsia-500/20 transition-colors" />
                    <div className="relative z-10 flex gap-4">
                      <span className="inline-grid place-items-center size-12 rounded-xl bg-violet-500/30 ring-1 ring-white/10 text-xl">🚀</span>
                      <div className="text-left max-w-[240px] md:max-w-[300px] lg:max-w-[320px]">
                        <div className="text-lg md:text-xl font-semibold text-white/90">Full‑Stack</div>
                        <p className="mt-1 text-sm md:text-base text-white/70 leading-snug md:leading-normal">React/Next frontends with resilient Java/Spring Boot services and real‑time UX.</p>
                      </div>
                    </div>
                    <span className="pointer-events-none absolute inset-0 translate-x-[-60%] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[120%] transition duration-700" />
                  </div>

                  {/* Cloud & CI/CD */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/[0.06] p-7 md:p-8 min-h-[220px] md:min-h-[260px] flex items-start transition-all duration-300 hover:-translate-y-1 hover:ring-white/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                    <div className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 w-40 md:w-56 h-40 md:h-56 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                    <div className="relative z-10 flex gap-4">
                      <span className="inline-grid place-items-center size-12 rounded-xl bg-violet-500/30 ring-1 ring-white/10 text-xl">⚡</span>
                      <div className="text-left max-w-[240px] md:max-w-[300px] lg:max-w-[320px]">
                        <div className="text-lg md:text-xl font-semibold text-white/90">Cloud & CI/CD</div>
                        <p className="mt-1 text-sm md:text-base text-white/70 leading-snug md:leading-normal">Dockerized deployments and automated pipelines on AWS & GCP with Terraform.</p>
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
            <div
              ref={tileRef}
              onMouseMove={onTileMove}
              onMouseLeave={onTileLeave}
              className="relative w-[300px] h-[320px] md:w-[360px] md:h-[390px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transform-gpu will-change-transform transition-transform duration-300"
              style={{ transform: 'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translate3d(var(--tx, 0px), var(--ty, 0px), 0)' }}
            >
              <span aria-hidden className="pointer-events-none absolute -inset-6 rounded-[24px] bg-gradient-to-r from-violet-500/10 via-transparent to-emerald-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
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
            </div>
            <div className="mt-3 md:mt-4">
              <div className="mt-4 relative">
                <div aria-hidden className="pointer-events-none absolute left-3 md:left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
                <div className="relative flex flex-col gap-5">
                  <div className="flex items-center">
                    <span aria-hidden className="ml-2 mr-3 size-2 rounded-full bg-violet-400/90 shadow-[0_0_12px_rgba(139,92,246,.6)]" />
                    <MetricCard icon={SvgBriefcase} target={mYears.num} label="Years" delay={0} accent="violet" className="ml-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
                  </div>
                  <div className="flex items-center">
                    <span aria-hidden className="ml-2 mr-3 size-2 rounded-full bg-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,.6)]" />
                    <MetricCard icon={SvgApps} target={mProjects.num} label="Projects" suffix={mProjects.suffix} delay={120} accent="emerald" className="ml-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
                  </div>
                  <div className="flex items-center">
                    <span aria-hidden className="ml-2 mr-3 size-2 rounded-full bg-sky-400/90 shadow-[0_0_12px_rgba(56,189,248,.6)]" />
                    <MetricCard icon={SvgCertificate} target={mCerts.num} label="Certifications" suffix={mCerts.suffix} delay={240} accent="sky" className="ml-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
                  </div>
                </div>
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
          z-index: 1;
          isolation: isolate;
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
          z-index: -1;
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
          z-index: -1;
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
        /* metric pills subtle entrance when the right column scrolls into view */
        @keyframes metric-pop {
          0% { transform: translateY(6px) scale(.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}