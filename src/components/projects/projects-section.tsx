"use client";

const DEBUG_PROJECTS = false; // show real ProjectCard

import { FadeIn } from "@/components/motion/FadeIn";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import React from "react";

// Load supabase client only in the browser, and only when effect runs.
const loadSupabase = async () => {
  try {
    const mod = await import("@/lib/supabase/client");
    // some builds export default, some named
    return (mod as any).supabase ?? (mod as any).default ?? mod;
  } catch {
    return undefined as unknown as { from: any; storage: any } | undefined;
  }
};

const ProjectCard = dynamic(
  () =>
    import("./project-card").then((m: any) => {
      const Comp = m?.ProjectCard ?? m?.default;
      return Comp ?? (() => null);
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-xs text-white/60">Loading…</div>
    ),
  }
);

class CardBoundary extends React.Component<{ p: ProjectItem; children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { p: ProjectItem; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.error("[projects-section] ProjectCard crashed:", err);
  }
  render() {
    if (this.state.hasError) {
      return <FallbackCard p={this.props.p} />;
    }
    return this.props.children as React.ReactElement;
  }
}

const DEFAULT_IMG_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET ?? "project-images";

type ProjectItem = {
  title: string;
  year: string;
  blurb: string;
  tags: string[];
  keyImpacts?: string[];
  github?: string | undefined;
  demo?: string | undefined;
  docs?: string | undefined;
  youtube?: string | undefined;
  coverImage?: string;
  featured?: boolean;
  sortOrder?: number;
  /** canonical aliases used by some cards */
  ctaCode?: string | undefined;
  ctaLive?: string | undefined;
  ctaDocs?: string | undefined;
  ctaYoutube?: string | undefined;
  ctaCase?: string | undefined;
};

// ---------- helpers (no `any`) ----------
const toString = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : fallback;

const toNumber = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
};

const asBool = (v: unknown): boolean => v === true || v === 1 || v === "true";

const asArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string" && v.trim()) {
    const sep = v.includes("|") ? "|" : ",";
    return v.split(sep).map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const asPipeArray = (v: unknown): string[] | undefined => {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string" && v.trim()) return v.split("|").map((s) => s.trim()).filter(Boolean);
  return undefined;
};

const firstString = (row: Record<string, unknown>, keys: string[]): string => {
  for (const k of keys) {
    const s = toString(row[k]);
    if (s) return s;
  }
  return "";
};

/** Convert a storage path or direct URL to a public URL */
function toPublicUrl(input?: string | null, client?: { storage: { from: (b: string) => { getPublicUrl: (p: string) => { data?: { publicUrl?: string } } } } }): string {
  // Guard: nothing provided
  if (!input) return "";
  // Already a full URL
  if (/^https?:\/\//i.test(input)) return input;

  // Clean and short‑circuit if empty after trimming slashes
  const clean = String(input).replace(/^\/+/, "").trim();
  if (!clean) return "";

  // Infer bucket from prefix, otherwise fall back to default
  let bucket = DEFAULT_IMG_BUCKET;
  let path = clean;
  if (clean.startsWith("project-images/")) {
    bucket = "project-images";
    path = clean.slice("project-images/".length);
  } else if (clean.startsWith("cert-images/")) {
    bucket = "cert-images";
    path = clean.slice("cert-images/".length);
  }

  // Extra safety: avoid calling storage if path is still empty
  if (!path) return "";

  try {
    if (!client || !client.storage) return "";
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl ?? "";
  } catch {
    return "";
  }
}

function FallbackCard({ p }: { p: ProjectItem }) {
  return (
    <div className="p-5 flex-1">
      <div className="text-lg font-semibold mb-2">{p.title || "Untitled Project"}</div>
      <div className="text-xs text-white/60 mb-3">{p.year}</div>
      <p className="text-sm text-white/70 line-clamp-3">{p.blurb}</p>
    </div>
  );
}

export default function ProjectsSection() {
  console.info("[projects-section] mount");
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // TEMP debug banner
  const DebugBanner = ({ count }: { count: number }) =>
    DEBUG_PROJECTS ? (
      <div className="fixed top-0 left-0 z-[9999] m-2 rounded bg-fuchsia-600/20 px-2 py-1 text-xs text-fuchsia-200">
        projects-section: items={count} err={String(errMsg ?? "")}
      </div>
    ) : null;

  useEffect(() => {
    (async () => {
      const client = await loadSupabase();
      if (!client) {
        setErrMsg("Supabase client not available");
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await client
          .from("projects")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });
        if (error) throw error;

        const parsed: ProjectItem[] = (data ?? []).map((row: Record<string, unknown>) => {
          const created = toString(row["created_at"]);
          const year = toString(row["year"]) || (created ? String(new Date(created).getFullYear()) : "");

          const coverRaw = firstString(row, [
            "cover_image",
            "coverImage",
            "image",
            "logo_url",
            "cover",
            "img",
            "thumbnail",
          ]);

          return {
            title: toString(row["title"]),
            year,
            blurb: firstString(row, ["subtitle", "sub_title", "description", "blurb"]),
            tags: asArray(row["tags"]),
            keyImpacts: asPipeArray(row["highlights"]) ?? asArray(row["highlights"]),
            // raw link fields
            github: firstString(row, ["github_url", "repo_url", "repo", "github"]) || undefined,
            demo: firstString(row, ["live_url", "website", "demo_url", "site_url", "url"]) || undefined,
            docs: firstString(row, ["docs_url", "documentation_url", "doc"]) || undefined,
            youtube: firstString(row, ["youtube_url", "video_url", "video"]) || undefined,
            // canonical aliases expected by ProjectCard
            ctaCode: firstString(row, ["github_url", "repo_url", "repo", "github"]) || undefined,
            ctaLive: firstString(row, ["live_url", "website", "demo_url", "site_url", "url"]) || undefined,
            ctaDocs: firstString(row, ["docs_url", "documentation_url", "doc"]) || undefined,
            ctaYoutube: firstString(row, ["youtube_url", "video_url", "video"]) || undefined,
            ctaCase: firstString(row, ["case_url", "case_study_url", "article_url", "blog_url"]) || undefined,
            coverImage: toPublicUrl(coverRaw, client),
            featured: asBool(row["featured"]),
            sortOrder: toNumber(row["sort_order"], 999),
          };
        });

        console.info("[projects-section] fetched", { count: parsed.length });

        setItems(
          parsed.sort((a, b) => {
            const f = Number(b.featured) - Number(a.featured);
            if (f !== 0) return f;
            return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
          })
        );
        console.info("[projects-section] ready", { items: parsed.length });
      } catch (e) {
        console.error("[projects-section] supabase fetch failed", e);
        setItems([]);
        setErrMsg(e instanceof Error ? e.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section id="projects" className="relative z-20 isolate py-18 md:py-24">
      <div className="container">
        <DebugBanner count={items.length} />
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              <span className="gradient-text">Featured Projects</span>
            </h2>
            <p className="mt-4 text-sm md:text-base text-muted-foreground">
              A selection of impactful projects showcasing full‑stack engineering and AI integration.
            </p>
            <div className="mx-auto mt-6 h-px w-40 md:w-56 bg-gradient-to-r from-transparent via-violet-500/60 to-transparent rounded-full" />
            <div className="pointer-events-none mx-auto mt-2 h-[2px] w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          </div>
        </FadeIn>

        <div className="relative z-10 isolate mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-stretch min-h-[2rem]">
          {/* Grid */}
          {loading && (
            <div className="col-span-full text-center text-sm text-white/60">Loading projects…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="col-span-full text-center text-sm text-white/70 border border-white/10 rounded-xl py-6">
              {errMsg ? (
                <>
                  <div className="font-medium text-white/80">Couldn&apos;t load projects.</div>
                  <div className="mt-1 text-xs text-white/50">Supabase says: {String(errMsg ?? "unknown error")}</div>
                </>
              ) : (
                <>
                  No projects found. Make sure your <code className="px-1 rounded bg-white/5">projects</code> table has
                  published rows and the column names match.
                </>
              )}
            </div>
          )}
          {!loading &&
            items.map((p, i) => (
              <FadeIn key={`${p.title || "untitled"}-${p.year || "n/a"}-${i}`} delay={i * 0.08}>
                <div className="group relative z-0 [--halo:theme(colors.violet.500/18)] [--ring:conic-gradient(from_180deg,theme(colors.violet.500/.4),theme(colors.fuchsia.500/.35),theme(colors.cyan.400/.35),theme(colors.violet.500/.4))] hover:animate-[wiggle_800ms_ease-in-out] transition-transform duration-300 will-change-transform hover:scale-[1.02] hover:-translate-y-1">
                  <div className="pointer-events-none absolute -inset-1.5 rounded-2xl bg-[radial-gradient(30%_40%_at_50%_0%,var(--halo),transparent_70%)] opacity-0 group-hover:opacity-80 transition-opacity duration-300 -z-10" />
                  <div className="relative z-10 isolate min-h-[460px] flex rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-[0.5px] overflow-hidden project-card">
                    <div aria-hidden className="card-sheen" />
                    <CardBoundary p={p}>
                      <ProjectCard p={p} />
                    </CardBoundary>
                  </div>
                </div>
              </FadeIn>
            ))}
        </div>
      </div>
    </section>
  );
}