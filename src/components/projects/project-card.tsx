"use client";

import { Badge } from "@/components/ui/badge";
import SpotlightCard from "@/components/ui/spotlight-card";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
  coverImage?: string; // optional hero image at top of card
  keyImpacts?: string[];
  ctaLive?: string;
  ctaCode?: string;
  ctaCase?: string;
  ctaYoutube?: string;
  ctaDocs?: string;

  // LEGACY/FALLBACK URL FIELDS (from Supabase columns)
  github_url?: string;
  demo_url?: string;
  live_url?: string;
  youtube_url?: string;
  docs_url?: string;
  case_url?: string;
};

function toArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean) as string[];
  if (typeof value === "string") {
    // split on commas or line breaks / bullets
    return value
      .split(/\r?\n|•|,|;|\u2022/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export default function ProjectCard({ p, className }: { p: Project; className?: string }) {
  const title = p.title ?? "";
  const year = p.year ?? "";
  const blurb = p.blurb ?? "";
  const tagsArr = toArray(p.tags as unknown);
  const impactsArr = toArray(p.keyImpacts as unknown);

  // Normalize CTAs so buttons always render even if the data uses legacy column names
  const live = p.ctaLive ?? p.demo_url ?? p.live_url ?? undefined;
  const code = p.ctaCode ?? p.github_url ?? undefined;
  const youtube = p.ctaYoutube ?? p.youtube_url ?? undefined;
  const docs = p.ctaDocs ?? p.docs_url ?? undefined;
  const cstudy = p.ctaCase ?? p.case_url ?? undefined;

  return (
    <SpotlightCard
      className={cn(
        "project-card group relative z-10 isolate overflow-hidden",                // enable group-hover & clip local shine
        "glass rounded-2xl ring-1 ring-white/10 bg-white/[0.05] backdrop-blur-md",
        "min-h-[420px] md:min-h-[480px] p-6 md:p-7 pr-7 md:pr-8 pb-6 md:pb-7 flex flex-col justify-start",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_14px_44px_rgba(0,0,0,0.45)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40",
        "transition-all duration-300",
        className
      )}
    >
      {/* cover image (optional) */}
      {p.coverImage ? (
        <a
          href={p.ctaLive ?? p.demo_url ?? p.live_url ?? p.ctaCode ?? p.github_url ?? '#'}
          target={p.ctaLive || p.demo_url || p.live_url || p.ctaCode || p.github_url ? '_blank' : undefined}
          rel={p.ctaLive || p.demo_url || p.live_url || p.ctaCode || p.github_url ? 'noreferrer noopener' : undefined}
          className="relative -mt-1 mb-5 block overflow-hidden rounded-xl bg-black/20 ring-1 ring-white/10 aspect-[4/3]"
          aria-label={`${title} preview`}
        >
          <Image
            src={p.coverImage}
            alt={`${title} cover`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            priority={false}
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </a>
      ) : null}

      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg md:text-xl font-semibold leading-tight tracking-tight">
          {title}
        </h3>
        <span className="shrink-0 text-[11px] md:text-xs text-white/65 bg-white/10 ring-1 ring-white/15 px-2 py-1 rounded-md">
          {year}
        </span>
      </div>

      {/* blurb */}
      <p className="mt-2 text-sm text-white/70 leading-normal">
        {blurb}
      </p>

      {/* tags */}
      {tagsArr.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tagsArr.map((t) => (
            <Badge key={t} variant="secondary" className="bg-white/10 ring-1 ring-white/15 text-[12px]">
              {t}
            </Badge>
          ))}
        </div>
      ) : null}

      {/* key impacts */}
      {impactsArr.length ? (
        <ul className="impact mt-4 space-y-2">
          {impactsArr.map((li, idx) => (
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
      <div className="footer mt-auto pt-4 flex flex-wrap items-center gap-2">
        {live ? (
          <a
            href={live}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 hover:shadow-[0_8px_24px_rgba(124,58,237,0.25)] transition min-w-0"
          >
            <span className="i-tabler-external-link text-[16px]" />
            Live
          </a>
        ) : null}

        {code ? (
          <a
            href={code}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-sm text-violet-100 hover:shadow-[0_8px_24px_rgba(124,58,237,0.35)] transition min-w-0"
          >
            <span className="i-tabler-brand-github text-[16px]" />
            Code
          </a>
        ) : null}

        {youtube ? (
          <a
            href={youtube}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/15 px-3 py-1.5 text-sm text-red-100 hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] transition min-w-0"
            aria-label={`${title} on YouTube`}
          >
            <span className="i-tabler-brand-youtube text-[16px]" />
            YouTube
          </a>
        ) : null}

        {cstudy ? (
          <a
            href={cstudy}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-100 hover:shadow-[0_8px_24px_rgba(34,197,94,0.35)] transition min-w-0"
          >
            <span className="i-tabler-file-description text-[16px]" />
            Case Study
          </a>
        ) : null}

        {docs ? (
          <a
            href={docs}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white/85 hover:bg-white/10 transition min-w-0"
            aria-label={`${title} Docs`}
          >
            <span className="i-tabler-file-text text-[16px]" />
            Docs
          </a>
        ) : null}
      </div>
    </SpotlightCard>
  );
}