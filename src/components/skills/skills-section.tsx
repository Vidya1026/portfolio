"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SkillGroup, Skill } from "@/types/skills";
import { FadeIn } from "@/components/motion/FadeIn";
import Image from "next/image";

type GroupWithSkills = SkillGroup & { skills: Skill[] };

// helpers to derive accent-driven styles
const colorRing = (accent?: string | null) =>
  accent?.startsWith("#")
    ? `ring-[${accent}]`
    : accent
    ? `ring-${accent}-400/30`
    : "ring-white/10";

const bgGlow = (accent?: string | null) =>
  accent?.startsWith("#")
    ? `shadow-[0_30px_120px_${accent}33]`
    : accent
    ? `shadow-[0_30px_120px_rgba(var(--tw-${accent}),.22)]`
    : "shadow-[0_30px_120px_rgba(255,255,255,.06)]";

// choose a nice fallback gradient per-card (works across accents)
const cardGradient =
  "before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-[linear-gradient(135deg,theme(colors.violet.500/.25),theme(colors.fuchsia.500/.18),theme(colors.sky.500/.22))] before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none";

// map a handful of accents to safe Tailwind classes
const ACCENT = {
  emerald: { ring: "ring-emerald-400/30", dot: "bg-emerald-400/80" },
  violet: { ring: "ring-violet-400/30", dot: "bg-violet-400/80" },
  sky: { ring: "ring-sky-400/30", dot: "bg-sky-400/80" },
  fuchsia: { ring: "ring-fuchsia-400/30", dot: "bg-fuchsia-400/80" },
  amber: { ring: "ring-amber-400/30", dot: "bg-amber-400/80" },
  cyan: { ring: "ring-cyan-400/30", dot: "bg-cyan-400/80" },
  rose: { ring: "ring-rose-400/30", dot: "bg-rose-400/80" },
  lime: { ring: "ring-lime-400/30", dot: "bg-lime-400/80" },
} as const;

const chipRing = (accent?: string | null) =>
  accent && ACCENT[accent as keyof typeof ACCENT]
    ? ACCENT[accent as keyof typeof ACCENT].ring
    : "ring-white/10";

const chipDot = (accent?: string | null) =>
  accent && ACCENT[accent as keyof typeof ACCENT]
    ? ACCENT[accent as keyof typeof ACCENT].dot
    : "bg-emerald-400/80";

export default function SkillsSection() {
  const [groups, setGroups] = useState<GroupWithSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: g, error: ge } = await supabase
        .from("skill_groups")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });

      if (ge || !g) {
        setErr(ge ? ge.message : "No groups found");
        setGroups([]);
        setLoading(false);
        return;
      }

      const { data: s, error: se } = await supabase
        .from("skills")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (se) {
        setErr(se.message);
      }

      const map = new Map<string, Skill[]>();
      (s ?? []).forEach((row) => {
        if (!map.has(row.group_id)) map.set(row.group_id, []);
        map.get(row.group_id)!.push(row as Skill);
      });

      setGroups(
        g.map((gr) => ({
          ...(gr as SkillGroup),
          skills: map.get(gr.id) ?? [],
        }))
      );
      setLoading(false);
    })();
  }, []);

  // util for rendering group icon: emoji → image url → default glyph
  const GroupIcon = ({ icon }: { icon?: string | null }) => {
    if (!icon) return <span className="select-none">🔹</span>;
    // simple heuristic: URL/image
    if (/^https?:\/\//.test(icon))
      return (
        <Image
          src={icon}
          alt=""
          width={20}
          height={20}
          className="rounded-sm object-contain"
          style={{ height: 20, width: 20 }}
          priority={false}
        />
      );
    // emoji-ish? (avoid Unicode property escapes which can crash older runtimes)
    // Heuristic: short, non-ASCII, or contains typical emoji surrogate range.
    const likelyEmoji =
      icon.length <= 4 ||
      /[\u2190-\u2BFF\u3000-\u303F\u{1F000}-\u{1FAFF}]/u.test(icon);
    if (likelyEmoji) return <span className="text-lg">{icon}</span>;
    // icon text fallback
    return <span className="select-none">🔹</span>;
  };

  return (
    <section id="skills" className="section-anchor pt-10 min-h-[200px]">
      <div className="mx-auto w-full max-w-6xl section-gutter px-4 md:px-6">
        <FadeIn>
          <h2 className="text-center text-4xl md:text-5xl font-extrabold gradient-text">
            Technical Skills
          </h2>
          <p className="mt-2 text-center text-lg text-white/70">
            A concise snapshot of tools and technologies I use day-to-day.
          </p>
          {/* underline line */}
          <div className="mx-auto mt-4 mb-2 h-[2px] w-40 bg-gradient-to-r from-violet-400/70 via-fuchsia-400/70 to-sky-400/70 rounded-full" />
          <div className="mx-auto h-[3px] w-24 bg-white/10 rounded-full" />
        </FadeIn>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-6 animate-pulse h-48"
              />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-white/70">
            <p className="text-sm">
              No skills to show yet.
              {err ? (
                <>
                  {" "}
                  <span className="text-white/50">({err})</span>
                </>
              ) : null}
            </p>
            <p className="mt-2 text-xs text-white/50">
              Tip: Ensure your <code className="text-white/80">skill_groups</code>{" "}
              and <code className="text-white/80">skills</code> rows are{" "}
              <span className="text-emerald-400">published</span> and your Supabase
              RLS has a SELECT policy like{" "}
              <code className="text-white/80">USING (published = true)</code>.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((g) => (
              <FadeIn key={g.id}>
                <article
                  onMouseMove={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    const r = el.getBoundingClientRect();
                    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
                    el.style.setProperty("--my", `${e.clientY - r.top}px`);
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.removeProperty("--mx");
                    el.style.removeProperty("--my");
                  }}
                  className={`group relative overflow-hidden rounded-2xl ${cardGradient} ring-1 ${colorRing(
                    g.accent
                  )} bg-white/[0.045] backdrop-blur p-8 transition-transform duration-300 hover:-translate-y-1 hover:rotate-[0.2deg] ${bgGlow(
                    g.accent
                  )} max-w-xl sm:max-w-none mx-auto`}
                >
                  {/* inner card surface so gradient border shows nicely */}
                  <div className="relative z-10 rounded-[14px] bg-black/30 p-3">
                    {/* decorative soft aurora glow */}
                    <div className="pointer-events-none absolute -inset-10 -z-10">
                      <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-violet-500/12 blur-3xl" />
                      <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-sky-500/12 blur-3xl" />
                    </div>

                    <header className="relative z-10 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl ring-1 ring-white/10 bg-white/5 flex items-center justify-center">
                        <GroupIcon icon={g.icon} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-white/90 leading-snug">
                          {g.name}
                        </h3>
                        {g.blurb ? (
                          <p className="text-sm text-white/55">{g.blurb}</p>
                        ) : null}
                      </div>
                    </header>

                    {g.skills.length > 0 ? (
                      <ul className="relative z-10 mt-4 flex flex-wrap gap-2">
                        {g.skills.map((s) => (
                          <li
                            key={s.id}
                            className={`text-base rounded-full px-4 py-2 bg-gradient-to-tr from-white/[0.06] to-white/[0.02] ring-1 ${chipRing(
                              g.accent
                            )} text-white/80 hover:text-white hover:bg-white/[0.10] hover:ring-white/20 transition transform-gpu hover:-translate-y-0.5 hover:shadow-lg/20`}
                          >
                            <span
                              className={`mr-1.5 inline-block h-2 w-2 rounded-full ${chipDot(
                                g.accent
                              )} align-middle`}
                            />
                            {s.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="relative z-10 mt-4 text-sm text-white/50">
                        Coming soon.
                      </p>
                    )}
                  </div>

                  {/* subtle shimmer sweep on hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-1 rounded-[14px] opacity-0 group-hover:opacity-100 transition duration-700"
                    style={{
                      background:
                        "linear-gradient(110deg, transparent 0%, rgba(255,255,255,.06) 45%, rgba(255,255,255,.14) 50%, rgba(255,255,255,.06) 55%, transparent 100%)",
                      animation: "shimmer 2200ms linear infinite",
                      maskImage: "linear-gradient(#000,#000)",
                      WebkitMaskImage: "linear-gradient(#000,#000)",
                      backgroundSize: "200% 100%",
                      backgroundPosition: "200% 0%",
                    }}
                  />

                  {/* soft spotlight that reacts on hover */}
                  <div
                    className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-500 blur-3xl"
                    style={{
                      background:
                        "radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(99,102,241,.12), transparent 40%)",
                    }}
                  />
                </article>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0%; }
          100% { background-position: -200% 0%; }
        }
      `}</style>
    </section>
  );
}