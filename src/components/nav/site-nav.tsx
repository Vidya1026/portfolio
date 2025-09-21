"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

// small inline icons so we don't add deps
function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.08c-3.22.7-3.9-1.4-3.9-1.4-.53-1.35-1.3-1.71-1.3-1.71-1.06-.72.08-.71.08-.71 1.18.08 1.8 1.21 1.8 1.21 1.04 1.78 2.73 1.26 3.4.96.11-.75.41-1.26.74-1.55-2.57-.29-5.27-1.29-5.27-5.73 0-1.27.46-2.31 1.21-3.13-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.19a11.1 11.1 0 0 1 5.82 0c2.22-1.5 3.2-1.19 3.2-1.19.63 1.59.23 2.76.11 3.05.76.82 1.21 1.86 1.21 3.13 0 4.45-2.7 5.43-5.28 5.72.42.37.79 1.1.79 2.22v3.29c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z"/>
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.5 8.5h4V23h-4V8.5ZM8.5 8.5h3.84v1.98h.05c.54-1.02 1.86-2.1 3.83-2.1 4.1 0 4.85 2.7 4.85 6.21V23h-4v-6.36c0-1.52-.03-3.47-2.12-3.47-2.12 0-2.45 1.66-2.45 3.36V23h-4V8.5Z"/>
    </svg>
  );
}

export function SiteNav() {
  const [active, setActive] = useState<string>("");
  const spotRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const [progress, setProgress] = useState(0); // 0..1 scroll progress
  const lastY = useRef(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const doc = document.documentElement;
      const max = (doc.scrollHeight - window.innerHeight) || 1;
      setProgress(Math.min(1, Math.max(0, y / max)));

      // auto hide on scroll down, show on scroll up
      if (Math.abs(y - lastY.current) > 6) {
        setHide(y > lastY.current && y > 80);
        lastY.current = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(()=>{
    const ids = ["about","education","experience","skills","projects","certifications","publications","contact"];
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach((en)=>{
        if(en.isIntersecting){
          setActive(en.target.id);
        }
      })
    },{rootMargin:"-40% 0px -55% 0px", threshold:[0,0.1,0.5,1]});
    ids.forEach(id=>{ const el = document.getElementById(id); if(el) obs.observe(el);});
    return ()=>obs.disconnect();
  },[]);

  const linkBase =
    "group relative inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400/40";
  const hoverFX = "hover:text-foreground/90 text-foreground/70";

  const activeFX = (id:string)=> cn(
    linkBase,
    hoverFX,
    active===id && "text-foreground ring-1 ring-white/10 bg-background/40 shadow-[0_0_24px_rgba(168,85,247,0.25)]"
  );

  return (
    <header ref={navRef} className={cn("sticky top-0 z-50 w-full transition-transform duration-300", hide ? "-translate-y-full" : "translate-y-0") }>
      <div
        className={cn(
          "glass border-b border-border/60 relative",
          "backdrop-blur-xs supports-[backdrop-filter]:bg-background/70",
          "shadow-lg shadow-violet-500/10 ring-1 ring-white/5"
        )}
      >
        {/* Cursor spotlight */}
        <div
          ref={spotRef}
          aria-hidden
          className="pointer-events-none absolute -inset-12 opacity-0 transition-opacity duration-300 md:opacity-100"
          style={{
            background: "radial-gradient(300px 200px at var(--mx, -100px) var(--my, -100px), rgba(168,85,247,0.15), transparent 60%)",
            maskImage: "radial-gradient(300px 200px at var(--mx, -100px) var(--my, -100px), #000 40%, transparent 60%)"
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
        {/* Scroll progress bar */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400"
          style={{ transform: `scaleX(${progress})`, willChange: "transform" }}
        />
        <nav
          className="container flex h-14 items-center justify-between"
          aria-label="Primary"
          onMouseMove={(e)=>{
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            if (spotRef.current) {
              spotRef.current.style.setProperty("--mx", `${mx}px`);
              spotRef.current.style.setProperty("--my", `${my}px`);
            }
          }}
          onMouseLeave={()=>{
            if (spotRef.current){
              spotRef.current.style.setProperty("--mx", `-100px`);
              spotRef.current.style.setProperty("--my", `-100px`);
            }
          }}
        >
          {/* Brand: animated gradient avatar with spinning ring */}
          <Link href="/#home" aria-label="Home" className="relative inline-flex items-center group">
            {/* spinning conic ring (border only via mask) */}
            <span
              aria-hidden
              className="absolute -inset-1 rounded-full opacity-70 blur-[1px]
                         [mask:radial-gradient(farthest-side,transparent_calc(100%-2px),#000_calc(100%-2px))]
                         bg-[conic-gradient(at_50%_50%,#8b5cf6_0%,#22d3ee_25%,#a78bfa_50%,#f472b6_75%,#8b5cf6_100%)]
                         animate-[spin_8s_linear_infinite] transition-opacity group-hover:opacity-90"/>

            {/* inner badge */}
            <span
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-extrabold",
                "text-white",
                "bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400",
                "ring-1 ring-white/20 shadow-[0_0_0_2px_rgba(255,255,255,0.06),0_0_28px_rgba(168,85,247,0.4)]",
                "transition-transform duration-300 group-hover:scale-110"
              )}
            >
              {/* glossy highlight */}
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(70%_60%_at_30%_30%,rgba(255,255,255,0.35),transparent_60%)] opacity-80" />
              <span className="relative drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]">B</span>

              {/* small status ping for a lively feel */}
              <span aria-hidden className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              <span aria-hidden className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-300 animate-ping" />
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <Link href="/#about" className={activeFX("about")}>
              <span className="relative z-10">About</span>
              <span className="pointer-events-none absolute inset-0 rounded-md opacity-0 blur-md transition group-hover:opacity-20 bg-gradient-to-r from-violet-500/0 via-violet-500/25 to-cyan-400/0" />
              <span className="pointer-events-none absolute left-2 right-2 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-fuchsia-400/90 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link href="/#education" className={activeFX("education")}>
              <span className="relative z-10">Education</span>
              <span className="pointer-events-none absolute inset-0 rounded-md opacity-0 blur-md transition group-hover:opacity-20 bg-gradient-to-r from-violet-500/0 via-violet-500/25 to-cyan-400/0" />
              <span className="pointer-events-none absolute left-2 right-2 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-fuchsia-400/90 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link href="/#experience" className={activeFX("experience")}>
              <span className="relative z-10">Experience</span>
              <span className="pointer-events-none absolute inset-0 rounded-md opacity-0 blur-md transition group-hover:opacity-20 bg-gradient-to-r from-violet-500/0 via-violet-500/25 to-cyan-400/0" />
              <span className="pointer-events-none absolute left-2 right-2 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-fuchsia-400/90 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link href="/#skills" className={activeFX("skills")}>
              <span className="relative z-10">Skills</span>
              <span className="pointer-events-none absolute inset-0 rounded-md opacity-0 blur-md transition group-hover:opacity-20 bg-gradient-to-r from-violet-500/0 via-violet-500/25 to-cyan-400/0" />
              <span className="pointer-events-none absolute left-2 right-2 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-fuchsia-400/90 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link href="/#projects" className={activeFX("projects")}>
              <span className="relative z-10">Projects</span>
              <span className="pointer-events-none absolute inset-0 rounded-md opacity-0 blur-md transition group-hover:opacity-20 bg-gradient-to-r from-violet-500/0 via-violet-500/25 to-cyan-400/0" />
              <span className="pointer-events-none absolute left-2 right-2 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-fuchsia-400/90 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link href="/#certifications" className={activeFX("certifications")}>
              <span className="relative z-10">Certifications</span>
              <span className="pointer-events-none absolute inset-0 rounded-md opacity-0 blur-md transition group-hover:opacity-20 bg-gradient-to-r from-violet-500/0 via-violet-500/25 to-cyan-400/0" />
              <span className="pointer-events-none absolute left-2 right-2 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-fuchsia-400/90 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link href="/#publications" className={activeFX("publications")}>
              <span className="relative z-10">Publications</span>
              <span className="pointer-events-none absolute inset-0 rounded-md opacity-0 blur-md transition group-hover:opacity-20 bg-gradient-to-r from-violet-500/0 via-violet-500/25 to-cyan-400/0" />
              <span className="pointer-events-none absolute left-2 right-2 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-fuchsia-400/90 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link href="/#contact" className={activeFX("contact")}>
              <span className="relative z-10">Contact</span>
              <span className="pointer-events-none absolute inset-0 rounded-md opacity-0 blur-md transition group-hover:opacity-20 bg-gradient-to-r from-violet-500/0 via-violet-500/25 to-cyan-400/0" />
              <span className="pointer-events-none absolute left-2 right-2 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-fuchsia-400/90 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>

            {/* Socials */}
            <a
              href="https://github.com/Bhargav1026" target="_blank" rel="noreferrer"
              className="ml-1 hidden sm:inline-flex items-center justify-center h-8 w-8 rounded-md text-foreground/70 hover:text-foreground/90 hover:shadow-[0_0_18px_rgba(168,85,247,0.35)] transition ring-1 ring-white/10 hover:ring-white/20 bg-background/40 hover:bg-background/60"
              aria-label="GitHub"
              onMouseMove={(e)=>{
                const t=e.currentTarget as HTMLAnchorElement;
                const r=t.getBoundingClientRect();
                const dx=(e.clientX-(r.left+r.width/2))/r.width;
                const dy=(e.clientY-(r.top+r.height/2))/r.height;
                t.style.transform=`translate(${dx*6}px, ${dy*6}px)`;
              }}
              onMouseLeave={(e)=>{
                (e.currentTarget as HTMLAnchorElement).style.transform="translate(0,0)";
              }}
            >
              <GitHubIcon className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/bhargava11/" target="_blank" rel="noreferrer"
              className="hidden sm:inline-flex items-center justify-center h-8 w-8 rounded-md text-foreground/70 hover:text-foreground/90 hover:shadow-[0_0_18px_rgba(168,85,247,0.35)] transition ring-1 ring-white/10 hover:ring-white/20 bg-background/40 hover:bg-background/60"
              aria-label="LinkedIn"
              onMouseMove={(e)=>{
                const t=e.currentTarget as HTMLAnchorElement;
                const r=t.getBoundingClientRect();
                const dx=(e.clientX-(r.left+r.width/2))/r.width;
                const dy=(e.clientY-(r.top+r.height/2))/r.height;
                t.style.transform=`translate(${dx*6}px, ${dy*6}px)`;
              }}
              onMouseLeave={(e)=>{
                (e.currentTarget as HTMLAnchorElement).style.transform="translate(0,0)";
              }}
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>

            {/* Open‑to‑Work pill (stronger green + glow) */}
            <Link
              href="/#contact"
              aria-label="Open to work"
              className={cn(
                "hidden md:inline-flex items-center gap-1 ml-2 rounded-full border px-3 py-1.5 text-xs font-medium",
                "border-emerald-300/60 text-emerald-100",
                "bg-emerald-400/20 hover:bg-emerald-400/30",
                "shadow-[0_0_24px_rgba(16,185,129,0.45)] hover:shadow-[0_0_36px_rgba(16,185,129,0.6)]",
                "ring-1 ring-emerald-300/20 transition"
              )}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              <span className="tracking-tight">Open to Work</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
export default SiteNav;