"use client";

import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Education } from "@/types/education";
import { FadeIn } from "@/components/motion/FadeIn";

export default function EducationSection() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("start_date", { ascending: false });

      if (error) {
        console.error("[education] fetch error:", error);
        setError(error.message ?? "Failed to load education.");
      } else {
        setItems(data ?? []);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <section id="education" className="scroll-mt-24">
      <div className="text-center mb-10 md:mb-12">
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-sky-400">
          Education
        </h2>
        <p className="text-white/70 mt-3">
          Foundations that shaped my approach to software and systems.
        </p>
        <div className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="mx-auto mt-1 h-1 w-28 rounded-full bg-gradient-to-r from-violet-400/70 to-cyan-400/70" />
      </div>

      {/* Status row */}
      {loading && (
        <div className="text-center text-white/60">Loading education…</div>
      )}
      {error && !loading && (
        <div className="text-center text-rose-300">{error}</div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="text-center text-white/60">No education entries yet.</div>
      )}

      {/* Timeline */}
      {!loading && !error && items.length > 0 && (
        <div className="mx-auto max-w-5xl grid gap-8">
          {items.map((e, idx) => (
            <FadeIn key={e.id} delay={idx * 0.06}>
              <EducationRow item={e} />
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  );
}

function EducationRow({ item }: { item: Education }) {
  const period = item.is_current
    ? `${item.start_date || "—"} — Present`
    : `${item.start_date || "—"} — ${item.end_date || "—"}`;

  const highlights = Array.isArray(item.highlights) ? item.highlights : [];
  const coursework = Array.isArray(item.coursework) ? item.coursework : [];

  return (
    <div className="relative">
      <div className="rounded-3xl ring-1 ring-white/10 bg-white/[0.055] p-6 md:p-8 backdrop-blur-lg shadow-[0_0_40px_rgba(59,130,246,0.08)]">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6">
          <div className="text-xl md:text-2xl font-semibold tracking-tight">
            {item.degree}{" "}
            <span className="text-white/60">— {item.school}</span>
            {item.location ? <span className="text-white/50"> • {item.location}</span> : null}
          </div>
          <div className="text-sm md:text-base text-white/75 md:text-right whitespace-nowrap shrink-0 leading-6 md:pt-1">{period}</div>
        </div>

        {(item.field || item.gpa) && (
          <div className="mt-2 text-sm md:text-base text-white/80 flex flex-wrap items-center gap-2">
            {item.field ? <span>{item.field}</span> : null}
            {item.gpa ? (
              <span className="ml-0 inline-flex items-center rounded-md px-2 py-0.5 ring-1 ring-sky-500/30 bg-gradient-to-r from-sky-400/15 to-cyan-500/15 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                GPA: {item.gpa}
              </span>
            ) : null}
          </div>
        )}

        {highlights.length > 0 && (
          <ul className="mt-4 space-y-2.5 text-sm md:text-[0.95rem] text-white/85">
            {highlights.map((h, i) => (
              <li key={i} className="flex gap-2">
                <span className="i-tabler-check text-emerald-400 shrink-0 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {coursework.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {coursework.map((c, i) => (
              <span
                key={i}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs md:text-sm text-white/85 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}