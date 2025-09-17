"use client";

import { Badge } from "@/components/ui/badge";
import SpotlightCard from "@/components/ui/spotlight-card";
import { cn } from "@/lib/utils";

/**
 * Enhanced ProjectCard
 * - Tall glass panel with tidy internal layout
 * - Supports key impacts and 3 CTAs (Live / Code / Case Study)
 * - Subtle conic ring + shine + wiggle handled by parent wrapper in projects-section
 */

type Project = {
  title: string;
  year: string;
  blurb: string;
  tags: string[];
  keyImpacts?: string[];
  ctaLive?: string;
  ctaCode?: string;
  ctaCase?: string;
};

export function ProjectCard({ p, className }: { p: Project; className?: string }) {
  return (
    <SpotlightCard
      className={cn(
        "project-card group relative overflow-hidden",                // enable group-hover & clip local shine
        "glass rounded-2xl ring-1 ring-white/10 bg-white/[0.05] backdrop-blur-md",
        "min-h-[460px] md:min-h-[520px] p-6 md:p-7 flex flex-col justify-start",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_14px_44px_rgba(0,0,0,0.45)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40",
        "transition-all duration-300",
        className
      )}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg md:text-xl font-semibold leading-tight tracking-tight">
          {p.title}
        </h3>
        <span className="shrink-0 text-[11px] md:text-xs text-white/65 bg-white/10 ring-1 ring-white/15 px-2 py-1 rounded-md">
          {p.year}
        </span>
      </div>

      {/* blurb */}
      <p className="mt-2 text-sm text-white/70 leading-normal">
        {p.blurb}
      </p>

      {/* tags */}
      {p.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <Badge key={t} variant="secondary" className="bg-white/10 ring-1 ring-white/15 text-[12px]">
              {t}
            </Badge>
          ))}
        </div>
      ) : null}

      {/* key impacts */}
      {p.keyImpacts?.length ? (
        <ul className="impact mt-4 space-y-2">
          {p.keyImpacts.map((li, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[13px] leading-5 text-white/80">
              {/* neon dot via ::before from global CSS; fallback dot here */}
              <span
                aria-hidden
                className="mt-1 inline-block size-1.5 rounded-full bg-gradient-to-br from-violet-400 to-emerald-400 shadow-[0_0_0_3px_rgba(167,139,250,0.15)]"
              />
              <span>{li}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* footer actions */}
      <div className="footer mt-5 flex items-center gap-2">
        {p.ctaLive ? (
          <a
            href={p.ctaLive}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 hover:shadow-[0_8px_24px_rgba(124,58,237,0.25)] transition"
          >
            <span className="i-tabler-external-link text-[16px]" />
            Live
          </a>
        ) : null}

        {p.ctaCode ? (
          <a
            href={p.ctaCode}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-sm text-violet-100 hover:shadow-[0_8px_24px_rgba(124,58,237,0.35)] transition"
          >
            <span className="i-tabler-brand-github text-[16px]" />
            Code
          </a>
        ) : null}

        {p.ctaCase ? (
          <a
            href={p.ctaCase}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-100 hover:shadow-[0_8px_24px_rgba(34,197,94,0.35)] transition"
          >
            <span className="i-tabler-file-description text-[16px]" />
            Case Study
          </a>
        ) : null}
      </div>
    </SpotlightCard>
  );
}