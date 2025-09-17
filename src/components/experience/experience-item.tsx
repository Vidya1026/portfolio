"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { cn } from "@/lib/utils";

type Props = {
  org: string;
  role: string;
  start: string;
  end: string;
  bullets: string[];
  logoUrl?: string;
  last?: boolean;
};

export function ExperienceItem({ org, role, start, end, bullets, logoUrl, last }: Props) {
  return (
    <FadeIn className="relative pl-10 sm:pl-14">
      {/* timeline line */}
      {!last && (
        <span
          aria-hidden
          className="exp-connector absolute left-[18px] sm:left-[26px] top-7 bottom-4 w-px"
        />
      )}
      {/* node */}
      <span
        aria-hidden
        className="exp-dot absolute left-1.5 sm:left-2 top-2"
      />

      <div className="relative z-10 isolate rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-[0.5px] p-4 md:p-5 overflow-hidden exp-card">
        {/* sheen (CSS-only; styles in globals.css) */}
        <div aria-hidden className="card-sheen" />
        <div className="flex items-center gap-3">
          {logoUrl && (
            <div className="exp-logo relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={`${org} logo`} className="size-8 md:size-9 rounded-md object-contain ring-1 ring-white/10" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold">{role}</h3>
            <p className="text-sm text-muted-foreground">{org} • {start} — {end}</p>
          </div>
        </div>

        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="exp-bullet mt-1.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </FadeIn>
  );
}