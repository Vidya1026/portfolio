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
    <FadeIn className="relative pl-8">
      {/* timeline line */}
      {!last && (
        <span
          aria-hidden
          className="absolute left-[14px] top-6 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-violet-500/60 to-cyan-500/40"
        />
      )}
      {/* node */}
      <span
        aria-hidden
        className="absolute left-2 top-2 size-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_20px_rgba(167,139,250,.6)]"
      />

      <div className="rounded-2xl border bg-card/60 backdrop-blur-xs p-4 hover:shadow-glow transition">
        <div className="flex items-center gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={`${org} logo`} className="size-8 rounded-md object-contain" />
          )}
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold">{role}</h3>
            <p className="text-sm text-muted-foreground">{org} • {start} — {end}</p>
          </div>
        </div>

        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    </FadeIn>
  );
}