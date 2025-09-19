"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { cn } from "@/lib/utils";

function toArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    return value
      .split(/[|,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

type Props = {
  org: string;
  role: string;
  start?: string | undefined;
  end?: string | undefined;
  bullets?: string | string[] | undefined;
  tools?: string | string[] | undefined;
  logoUrl?: string | undefined;
  last?: boolean | undefined;
};

export function ExperienceItem({ org, role, start, end, bullets, tools, logoUrl, last }: Props) {
  const dateLabel =
    (start ?? "") + (start && end ? " — " : "") + (end ?? "");
  const bulletsArr = toArray(bullets);
  const toolsArr = toArray(tools);

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
          {logoUrl ? (
            <div className="exp-logo relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={`${org} logo`}
                className="h-10 w-10 md:h-12 md:w-12 rounded-md object-contain ring-1 ring-white/20 bg-white p-1"
              />
            </div>
          ) : (
            <div className="exp-logo relative flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-white ring-1 ring-white/20 text-gray-800 font-bold text-xl md:text-2xl select-none">
              {org?.charAt(0) || "?"}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold">{role}</h3>
            <p className="text-sm text-muted-foreground">
              {org}{dateLabel ? " • " + dateLabel : ""}
            </p>
          </div>
        </div>

        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {bulletsArr.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="exp-bullet mt-1.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {toolsArr.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {toolsArr.map((t, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs rounded-full bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-400/40 shadow-[0_0_14px_rgba(16,185,129,0.45)]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}