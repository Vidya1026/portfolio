 "use client";
// --- Site settings types ---
type SocialLink = { label: string; url: string; icon?: string };
type FeatureCard = { title: string; body: string; icon?: string };
type SiteRow = {
  hero_title?: string | null;
  hero_tagline?: string | null;
  about_me?: string | null;
  achievements?: string | null;
  metrics_years?: string | null;
  metrics_projects?: string | null;
  metrics_certs?: string | null;
  skills?: string[] | null;
  resume_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_location?: string | null;
  social_links?: SocialLink[] | string | null;
  avatar_url?: string | null;
  feature_cards?: FeatureCard[] | string | null;
};
import { Button } from "@/components/ui/button";
import { Aurora } from "@/components/branding/Aurora";
import { FadeIn } from "@/components/motion/FadeIn";
import ProjectsSection from "@/components/projects/projects-section";
import ExperienceSection from "@/components/experience/experience-section";
import EducationSection from "@/components/education/education-section";
import CertificationsSection from "@/components/certifications/certifications-section";
import AboutSection from "@/components/about/about-section";
import PublicationsSection from "@/components/publications/publications-section";
import SkillsSection from "@/components/skills/skills-section";
import ContactSection from "@/components/contact/contact-section";
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



function HeroTitle({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div className={`hero-title ${className}`}>
      {/* Accessible full title for screen readers */}
      <h1 className="sr-only">{text}</h1>

      {/* Visual: word-by-word reveal */}
      <div
        aria-hidden
        className="hero-title-words inline-flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2"
      >
        {words.map((w, i) => {
          const wordStyle: React.CSSProperties & Record<'--rd', string> = { ['--rd']: `${i * 90}ms` };
          return (
            <span
              key={`${w}-${i}`}
              className="reveal-word gradient-text text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.15] pb-1"
              style={wordStyle}
            >
              {w}
            </span>
          );
        })}
      </div>

      {/* Subtle animated underline sheen */}
      <span aria-hidden className="hero-title-sheen" />
    </div>
  );
}

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
  const [settings, setSettings] = useState<Required<Omit<SiteRow, 'social_links' | 'feature_cards'>> & { social_links: SocialLink[]; feature_cards: FeatureCard[] }>(
    {
      hero_title: "",
      hero_tagline: "",
      about_me: "",
      achievements: "",
      metrics_years: "",
      metrics_projects: "",
      metrics_certs: "",
      skills: [],
      resume_url: "",
      contact_email: "",
      contact_phone: "",
      contact_location: "",
      social_links: [],
      avatar_url: "",
      feature_cards: [],
    }
  );
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
        // make sure we pick the most recent settings row deterministically
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        const row = data as SiteRow;
        let featureCards: unknown = row.feature_cards ?? [];
        if (typeof featureCards === 'string') {
          try { featureCards = JSON.parse(featureCards); } catch { featureCards = []; }
        }
        if (!Array.isArray(featureCards)) featureCards = [];

        let socialLinks: unknown = row.social_links ?? [];
        if (typeof socialLinks === 'string') {
          try { socialLinks = JSON.parse(socialLinks); } catch { socialLinks = []; }
        }
        if (!Array.isArray(socialLinks)) socialLinks = [];

        setSettings({
          hero_title: row.hero_title ?? "",
          hero_tagline: row.hero_tagline ?? "",
          about_me: row.about_me ?? "",
          achievements: row.achievements ?? "",
          metrics_years: row.metrics_years ?? "",
          metrics_projects: row.metrics_projects ?? "",
          metrics_certs: row.metrics_certs ?? "",
          skills: Array.isArray(row.skills) ? row.skills : [],
          resume_url: row.resume_url ?? "",
          contact_email: row.contact_email ?? "",
          contact_phone: row.contact_phone ?? "",
          contact_location: row.contact_location ?? "",
          social_links: socialLinks as SocialLink[],
          avatar_url: row.avatar_url ?? "",
          feature_cards: featureCards as FeatureCard[],
        });
      } else {
        if (error) {
          console.warn('[site_settings] fetch error:', error);
        }
      }
    })();
  }, []);

  function parseMetric(input: string | null | undefined, fallbackNum: number, fallbackSuffix = "") {
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

  const featureCards: { title: string; body: string; icon?: string }[] =
    (settings.feature_cards && settings.feature_cards.length > 0)
      ? settings.feature_cards
      : [
          {
            title: "GenAI & RAG",
            body: "Grounded answers with your data. Retrieval‑Augmented Generation that boosts search accuracy.",
            icon: "🧠",
          },
          {
            title: "Full‑Stack",
            body: "React/Next frontends with resilient Java/Spring Boot services and real‑time UX.",
            icon: "🚀",
          },
          {
            title: "Cloud & CI/CD",
            body: "Dockerized deployments and automated pipelines on AWS & GCP with Terraform.",
            icon: "⚡",
          },
        ];

  // Fallback content for About if site_settings fields are empty
  const DEFAULT_ABOUT =
    "Full‑stack engineer with ~3 years of experience building clean React/Next.js frontends and resilient Java/Spring services. I care about performance, DX, and production reliability—shipping features with tests, CI/CD, and tidy UX. Recently focused on GenAI/RAG and cloud‑native pipelines on AWS & GCP.";

  const DEFAULT_ACHIEVEMENTS =
    "• Reduced API latency ~35% with query tuning & caching\n" +
    "• Shipped CI/CD with Docker + Terraform on AWS/GCP\n" +
    "• Built RAG pipelines (LangChain, vector DB) for grounded answers\n" +
    "• Designed secure RBAC and audit‑friendly API boundaries";

  return (
    <>
      <main id="home" className="relative min-h-[78vh] grid grid-cols-1 md:grid-cols-2 place-items-center md:items-start overflow-visible bg-background section-anchor pt-10 md:pt-20">
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
              <HeroTitle text={settings.hero_title || "Vidya — Full-Stack • AI/RAG"} />
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
                  {featureCards
                    .filter(c => c.title?.trim() && c.body?.trim())
                    .slice(0, 3)
                    .map((c, idx) => (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/[0.06] p-7 md:p-8 min-h-[220px] md:min-h-[260px] flex items-start transition-all duration-300 hover:-translate-y-1 hover:ring-white/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                    >
                      <div className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 w-40 md:w-56 h-40 md:h-56 rounded-full bg-violet-500/10 blur-2xl group-hover:bg-violet-500/20 transition-colors" />
                      <div className="relative z-10 flex gap-4">
                        <span className="inline-grid place-items-center size-12 rounded-xl bg-violet-500/30 ring-1 ring-white/10 text-xl">
                          {c.icon || "✨"}
                        </span>
                        <div className="text-left max-w-[240px] md:max-w-[300px] lg:max-w-[320px]">
                          <div className="text-lg md:text-xl font-semibold text-white/90">{c.title}</div>
                          <p className="mt-1 text-sm md:text-base text-white/70 leading-snug md:leading-normal">{c.body}</p>
                        </div>
                      </div>
                      <span className="pointer-events-none absolute inset-0 translate-x-[-60%] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[120%] transition duration-700" />
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            {/* Futuristic tech ribbon to softly fill the gap */}
            <div className="relative mt-16 md:mt-20 max-w-3xl mx-auto mb-2">
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
              className="group relative w-[240px] h-[260px] md:w-[300px] md:h-[330px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transform-gpu will-change-transform transition-transform duration-300"
              style={{ transform: 'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translate3d(var(--tx, 0px), var(--ty, 0px), 0)' }}
            >
              <span aria-hidden className="pointer-events-none absolute -inset-6 rounded-[24px] bg-gradient-to-r from-violet-500/10 via-transparent to-emerald-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_30%_20%,rgba(124,58,237,0.45),transparent_60%),radial-gradient(40%_60%_at_75%_70%,rgba(34,197,94,0.35),transparent_60%),linear-gradient(180deg,rgba(17,24,39,0.9),rgba(17,24,39,0.9))]" />
              {/* floating particles */}
              <span className="absolute top-8 left-1/3 size-2 rounded-full bg-emerald-300/90 animate-pulse" />
              <span className="absolute top-1/3 right-12 size-1.5 rounded-full bg-violet-300/80 animate-ping" />
              <span className="absolute bottom-8 left-10 size-1.5 rounded-full bg-sky-300/80 animate-ping" />
              {/* profile image fills the whole tile */}
              {profileUrl ? (
                <Image
                  src={profileUrl}
                  alt="Profile"
                  fill
                  className="absolute inset-0 object-cover"
                  sizes="(min-width: 768px) 360px, 300px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="size-24 md:size-28 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 grid place-items-center overflow-hidden">
                    <span className="text-3xl md:text-4xl font-bold text-white/90">B</span>
                  </div>
                </div>
              )}
              {/* glossy sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-40 group-hover:opacity-80 auto-shine"
              />
              {/* soft inner glow on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 ring-1 ring-white/0 group-hover:ring-white/15 rounded-2xl transition duration-500"
              />
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

      {/* About Me */}
      <section id="about" className="section-anchor pt-14 md:pt-20">
        <div className="mx-auto w-full max-w-6xl section-gutter px-4 md:px-6">
          <FadeIn>
            <div className="rounded-2xl ring-1 ring-white/10 bg-gradient-to-r from-sky-500/5 to-emerald-500/5 p-6 md:p-10 hover:from-sky-500/10 hover:to-emerald-500/10 transition">
              <AboutSection
                aboutMe={settings.about_me?.trim() ? settings.about_me : DEFAULT_ABOUT}
                achievements={settings.achievements?.trim() ? settings.achievements : DEFAULT_ACHIEVEMENTS}
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Education (new, above Experience) */}
      <section id="education" className="section-anchor pt-10">
        <div className="mx-auto w-full max-w-6xl section-gutter px-4 md:px-6">
          <FadeIn>
            <div className="card-hover rounded-2xl ring-1 ring-white/10 bg-gradient-to-r from-sky-500/5 to-emerald-500/5 transition-all duration-500 motion-safe:hover:translate-x-0.5 motion-safe:hover:-translate-y-0.5 hover:from-sky-500/10 hover:to-emerald-500/10">
              <EducationSection />
            </div>
          </FadeIn>
        </div>
      </section>

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

      {/* Skills */}
      <section id="skills" className="section-anchor pt-10 pb-16 md:pb-24">
        <div className="mx-auto w-full max-w-6xl section-gutter px-4 md:px-6">
          <FadeIn>
            <SkillsSection />
          </FadeIn>
        </div>
      </section>

      {/* Projects — left-aligned grid of glowing cards */}
      <section id="projects" className="section-anchor pt-16 md:pt-24">
        <div className="mx-auto w-full max-w-6xl section-gutter px-4 md:px-6">
          <div className="projects-area">
            <ProjectsSection />
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section id="certifications" className="section-anchor pt-10">
        <div className="mx-auto w-full max-w-6xl section-gutter px-4 md:px-6">
          <FadeIn>
            <CertificationsSection />
          </FadeIn>
        </div>
      </section>

      {/* Publications */}
      <section id="publications" className="section-anchor pt-10">
        <div className="mx-auto w-full max-w-6xl section-gutter px-4 md:px-6">
          <FadeIn>
            <PublicationsSection />
          </FadeIn>
        </div>
      </section>

      {/* Contact / Hire Me */}
      <section id="contact" className="section-anchor pt-10">
        <div className="mx-auto w-full max-w-6xl section-gutter px-4 md:px-6">
          <FadeIn>
            <ContactSection
              email={settings.contact_email ?? undefined}
              phone={settings.contact_phone ?? undefined}
              location={settings.contact_location ?? undefined}
              socials={Array.isArray(settings.social_links) ? settings.social_links : []}
            />
          </FadeIn>
        </div>
      </section>

      <footer className="mt-12 md:mt-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 text-center">
          <p className="text-sm text-white/55">
            © 2025 Gorji Vidya. All rights reserved.
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
        /* ===== Hero title animation (word-by-word) ===== */
        .hero-title{ position:relative; display:grid; place-items:center; gap:.4rem; }
        .hero-title-words .reveal-word{
          display:inline-block; opacity:0; transform:translateY(.35em) scale(.98);
          animation: reveal-word .66s cubic-bezier(.2,.8,.2,1) forwards;
          background: linear-gradient(90deg,var(--grad-a,#c4b5fd),var(--grad-b,#67e8f9));
          -webkit-background-clip:text; background-clip:text; color:transparent;
          text-shadow: 0 0 24px rgba(0,0,0,.25);
        }
        .hero-title-words .reveal-word:nth-child(odd){ --grad-a:#a78bfa; --grad-b:#22d3ee; }
        .hero-title-words .reveal-word:nth-child(even){ --grad-a:#60a5fa; --grad-b:#34d399; }
        .hero-title-words .reveal-word{ animation-delay: var(--rd,0ms); }
        @keyframes reveal-word{
          0%{ opacity:0; transform:translateY(.35em) scale(.98); }
          100%{ opacity:1; transform:translateY(0) scale(1); }
        }
        /* sheen underline under the title */
        .hero-title-sheen{ position:relative; width:220px; height:6px; border-radius:999px; display:block; margin-top:.35rem; }
        .hero-title-sheen::before{ content:""; position:absolute; inset:0; border-radius:999px;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);
          transform: translateX(-120%); animation: title-sheen 3.2s ease-in-out infinite; opacity:.9;
        }
        .hero-title-sheen::after{ content:""; position:absolute; inset:auto 30% -8px 30%; height:4px; border-radius:999px;
          background: linear-gradient(90deg,rgba(109,40,217,.5),rgba(59,130,246,.5),rgba(34,197,94,.5));
          filter: blur(6px); opacity:.8;
        }
        @keyframes title-sheen{ 0%{ transform:translateX(-120%);} 60%,100%{ transform:translateX(120%);} }
      `}</style>
      <style jsx>{`
        .marquee {
          animation: ribbon-scroll var(--ribbon-speed, 45s) linear infinite;
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
        .skills-ribbon { 
          --ribbon-speed: 70s; /* slower scroll speed */
          box-shadow: 0 8px 40px rgba(0,0,0,.25);
        }

        /* Robot: moves left-to-right across the ribbon while hopping */
        .robot {
          animation:
            robot-move var(--ribbon-speed, 45s) steps(16, end) infinite,
            robot-hop 0.9s ease-in-out infinite alternate;
          filter: drop-shadow(0 6px 10px rgba(0,0,0,.35));
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee, .robot { animation: none !important; }
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
        /* Auto shine sweep across the profile tile */
        .auto-shine{
          transform: translateX(-120%);
          animation: shine-sweep 3.2s ease-in-out infinite;
        }
        @keyframes shine-sweep{
          0%   { transform: translateX(-120%); }
          60%  { transform: translateX(120%); }
          100% { transform: translateX(120%); }
        }
        .type-caret{ display:inline-block; margin-left:.15rem; width:.6ch; color:rgba(255,255,255,.85); animation: caret-blink 1s steps(1,end) infinite; }
        @keyframes caret-blink{ 0%,100%{ opacity: 0; } 50%{ opacity: 1; } }
      `}</style>
    </>
  );
}