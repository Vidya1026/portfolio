"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { ExperienceItem } from "./experience-item";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ExperienceSection() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("start", { ascending: false });

      if (!error && data) {
        setItems(
          data.map((e: any) => ({
            org: e.org,
            role: e.role,
            start: e.start,
            end: e.end,
            bullets: Array.isArray(e.bullets)
              ? e.bullets
              : typeof e.bullets === "string"
                ? e.bullets.split("|").map((s: string) => s.trim()).filter(Boolean)
                : [],
            tools: Array.isArray(e.tools)
              ? e.tools
              : typeof e.tools === "string"
                ? e.tools.split(",").map((s: string) => s.trim()).filter(Boolean)
                : [],
            logoUrl: e.logo_url,
          }))
        );
      } else {
        setItems([]);
      }
    })();
  }, []);

  return (
    <section className="relative z-10 isolate py-16 md:py-24">
      <div className="container relative">
        <FadeIn>
          <div className="flex flex-col items-center justify-center max-w-7xl w-full text-center relative">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-center">
              <span className="gradient-text drop-shadow-[0_0_12px_rgba(167,139,250,0.65)]">
                Experience
              </span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Highlighting my professional journey and impactful contributions.
            </p>
            {/* glowing divider */}
            <div className="mt-6 h-px w-48 md:w-64 bg-gradient-to-r from-transparent via-violet-500/70 to-transparent rounded-full animate-pulse" />
            <div className="mt-2 h-[2px] w-32 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rounded-full" />
          </div>
        </FadeIn>

        {/* ambient background blobs (CSS-only, defined in globals.css) */}
        <div aria-hidden className="exp-bg pointer-events-none absolute inset-0 -z-10">
          <div className="exp-blob exp-blob--left" />
          <div className="exp-blob exp-blob--right" />
        </div>

        <div className="mt-10 relative pl-6 sm:pl-10 w-full max-w-7xl mx-auto">
          {/* vertical timeline glow (CSS defined in globals.css) */}
          <div aria-hidden className="exp-line pointer-events-none absolute left-4 sm:left-6 top-0 bottom-0 -z-10" />
          <div aria-hidden className="exp-line-cap exp-line-cap--top pointer-events-none absolute left-4 sm:left-6 -top-6 h-6 w-px -z-10" />
          <div aria-hidden className="exp-line-cap exp-line-cap--bottom pointer-events-none absolute left-4 sm:left-6 -bottom-6 h-6 w-px -z-10" />
          <div className="space-y-6">
            {items.map((it, idx) => (
              <ExperienceItem
                key={idx}
                org={it.org}
                role={it.role}
                start={it.start}
                end={it.end}
                bullets={it.bullets}
                tools={it.tools}
                logoUrl={it.logoUrl}
                last={idx === items.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}