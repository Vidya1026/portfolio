"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { FadeIn } from "@/components/motion/FadeIn";

type Publication = {
  id: string;
  title: string;
  slug: string | null;
  pub_url: string | null;
  abstract: string | null;
  metrics: { views?: number; downloads?: number };
  tech: string[];
  sort_order: number;
};

const CountUp = ({ value, duration = 900 }: { value: number; duration?: number }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setV(Math.round(value * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{v.toLocaleString()}</>;
};

export default function PublicationsSection() {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("publications")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (error) {
          setErr(error.message);
          return;
        }

        if (data) {
          setItems(
            data.map((d: any) => ({
              ...d,
              tech: Array.isArray(d.tech) ? d.tech : [],
              metrics: d.metrics ?? {},
            }))
          );
        }
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load publications.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section id="publications" className="section-anchor pt-10">
      <div className="mx-auto w-full max-w-6xl section-gutter px-4 md:px-6">
        <FadeIn>
          <h2 className="text-center text-3xl md:text-4xl font-extrabold gradient-text">
            Publications
          </h2>
          <div className="h-1 w-24 mx-auto mt-3 rounded-full bg-gradient-to-r from-purple-500 via-slate-400 to-blue-500 animate-pulse" />
          <p className="mt-2 text-center text-white/70">
            Peer-reviewed work with quick metrics and technical highlights.
          </p>
          {err ? (
            <p className="mt-2 text-center text-rose-300/80 text-sm">
              {err}
            </p>
          ) : null}
        </FadeIn>

        {/* Content */}
        {loading ? (
          // Skeletons while loading
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <article
                key={i}
                className="rounded-2xl ring-1 ring-white/10 bg-white/[0.04] backdrop-blur p-6 md:p-7 shadow-[0_14px_44px_rgba(0,0,0,.45)] animate-pulse"
              >
                <div className="h-6 w-2/3 bg-white/10 rounded-md" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full bg-white/10 rounded" />
                  <div className="h-3 w-5/6 bg-white/10 rounded" />
                  <div className="h-3 w-4/6 bg-white/10 rounded" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-16 bg-white/10 rounded-xl" />
                  <div className="h-16 bg-white/10 rounded-xl" />
                </div>
              </article>
            ))}
          </div>
        ) : items.length ? (
          // If there's only one publication, keep it centered and a bit wider
          items.length === 1 ? (
            <div className="mt-8 max-w-5xl mx-auto">
              {items.map((p) => (
                <FadeIn key={p.id}>
                  <article className="group relative overflow-hidden rounded-2xl ring-1 ring-emerald-400/20 bg-white/[0.045] backdrop-blur p-6 md:p-7 shadow-[0_14px_44px_rgba(0,0,0,.45)] transition duration-300 hover:-translate-y-1.5 hover:ring-emerald-400/40 hover:shadow-[0_30px_100px_rgba(16,185,129,.25)]">
                    <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-60 md:opacity-40 bg-gradient-to-br from-emerald-500/10 via-emerald-300/8 to-teal-400/10 blur-2xl transition-opacity duration-300 group-hover:opacity-90" />

                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-white/90 leading-snug">
                        {p.title}
                      </h3>
                      {p.pub_url ? (
                        <a
                          href={p.pub_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ring-1 ring-red-400/50 bg-red-500/15 hover:bg-red-500/25 text-red-200 shadow-[0_0_0_0_rgba(239,68,68,.55)] hover:shadow-[0_0_34px_8px_rgba(239,68,68,.45)] transition-all"
                        >
                          <span className="i-tabler-file-text text-base" />
                          Read
                        </a>
                      ) : null}
                    </div>

                    {p.abstract ? (
                      <p className="mt-3 text-white/70 text-sm leading-relaxed">
                        {p.abstract}
                      </p>
                    ) : null}

                    {/* Metrics */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/[0.06] ring-1 ring-white/10 p-3 transition shadow-[inset_0_0_0_rgba(0,0,0,0)] group-hover:shadow-[inset_0_0_40px_rgba(16,185,129,.08)]">
                        <div className="text-xs text-white/65 flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </span>
                          Views
                        </div>
                        <div className="mt-1 text-2xl font-extrabold tracking-tight text-white/90 [text-shadow:_0_0_12px_rgba(16,185,129,.25)]">
                          <CountUp value={p.metrics?.views ?? 0} />
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/[0.06] ring-1 ring-white/10 p-3 transition shadow-[inset_0_0_0_rgba(0,0,0,0)] group-hover:shadow-[inset_0_0_40px_rgba(16,185,129,.08)]">
                        <div className="text-xs text-white/65 flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/15 ring-1 ring-sky-400/30">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-sky-300" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 3v12" />
                              <path d="m7 10 5 5 5-5" />
                              <path d="M5 21h14" />
                            </svg>
                          </span>
                          Downloads
                        </div>
                        <div className="mt-1 text-2xl font-extrabold tracking-tight text-white/90 [text-shadow:_0_0_12px_rgba(56,189,248,.25)]">
                          <CountUp value={p.metrics?.downloads ?? 0} />
                        </div>
                      </div>
                    </div>

                    {/* Technical Implementation */}
                    {!!p.tech?.length && (
                      <div className="mt-4">
                        <div className="text-xs uppercase tracking-wide text-white/60 mb-2 flex items-center gap-2">
                          <span className="i-tabler-settings" />
                          Technical Implementation
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {p.tech.map((t, i) => (
                            <span
                              key={i}
                              className="text-sm rounded-full px-3 py-1 bg-emerald-500/10 ring-1 ring-emerald-400/40 text-emerald-200 shadow-[0_0_0_0_rgba(16,185,129,.35)] hover:shadow-[0_0_24px_6px_rgba(16,185,129,.35)] transition-shadow"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((p) => (
                <FadeIn key={p.id}>
                  <article className="group relative overflow-hidden rounded-2xl ring-1 ring-emerald-400/15 bg-white/[0.04] backdrop-blur p-6 md:p-7 shadow-[0_14px_44px_rgba(0,0,0,.45)] hover:-translate-y-1 hover:ring-emerald-400/40 hover:shadow-[0_26px_90px_rgba(16,185,129,.22)] transition">
                    <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-60 md:opacity-40 bg-gradient-to-br from-emerald-500/10 via-emerald-300/8 to-teal-400/10 blur-2xl transition-opacity duration-300 group-hover:opacity-90" />
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-white/90 leading-snug">
                        {p.title}
                      </h3>
                      {p.pub_url ? (
                        <a
                          href={p.pub_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ring-1 ring-red-400/50 bg-red-500/15 hover:bg-red-500/25 text-red-200 shadow-[0_0_0_0_rgba(239,68,68,.55)] hover:shadow-[0_0_34px_8px_rgba(239,68,68,.45)] transition-all"
                        >
                          <span className="i-tabler-file-text text-base" />
                          Read
                        </a>
                      ) : null}
                    </div>

                    {p.abstract ? (
                      <p className="mt-3 text-white/70 text-sm leading-relaxed">
                        {p.abstract}
                      </p>
                    ) : null}

                    {/* Metrics */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/[0.06] ring-1 ring-white/10 p-3 transition shadow-[inset_0_0_0_rgba(0,0,0,0)] group-hover:shadow-[inset_0_0_40px_rgba(16,185,129,.08)]">
                        <div className="text-xs text-white/65 flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </span>
                          Views
                        </div>
                        <div className="mt-1 text-2xl font-extrabold tracking-tight text-white/90 [text-shadow:_0_0_12px_rgba(16,185,129,.25)]">
                          <CountUp value={p.metrics?.views ?? 0} />
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/[0.06] ring-1 ring-white/10 p-3 transition shadow-[inset_0_0_0_rgba(0,0,0,0)] group-hover:shadow-[inset_0_0_40px_rgba(16,185,129,.08)]">
                        <div className="text-xs text-white/65 flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/15 ring-1 ring-sky-400/30">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-sky-300" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 3v12" />
                              <path d="m7 10 5 5 5-5" />
                              <path d="M5 21h14" />
                            </svg>
                          </span>
                          Downloads
                        </div>
                        <div className="mt-1 text-2xl font-extrabold tracking-tight text-white/90 [text-shadow:_0_0_12px_rgba(56,189,248,.25)]">
                          <CountUp value={p.metrics?.downloads ?? 0} />
                        </div>
                      </div>
                    </div>

                    {/* Technical Implementation */}
                    {!!p.tech?.length && (
                      <div className="mt-4">
                        <div className="text-xs uppercase tracking-wide text-white/60 mb-2 flex items-center gap-2">
                          <span className="i-tabler-settings" />
                          Technical Implementation
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {p.tech.map((t, i) => (
                            <span
                              key={i}
                              className="text-sm rounded-full px-3 py-1 bg-emerald-500/10 ring-1 ring-emerald-400/40 text-emerald-200 shadow-[0_0_0_0_rgba(16,185,129,.35)] hover:shadow-[0_0_24px_6px_rgba(16,185,129,.35)] transition-shadow"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                </FadeIn>
              ))}
            </div>
          )
        ) : (
          // Empty state
          <div className="mt-10 text-center text-white/60">
            No publications yet — check back soon.
          </div>
        )}
      </div>
    </section>
  );
}