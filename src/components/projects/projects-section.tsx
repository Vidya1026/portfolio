"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { ProjectCard } from "./project-card";
// The shine/tilt effects rely on CSS keyframes in globals and will be added next
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

/**
 * NOTE:
 * - I enriched the sample data so each project can show a "Key Impact" list
 *   and CTA actions (live/code/case study) in the ProjectCard.
 * - Even if the current ProjectCard ignores some of these fields, keeping them
 *   here makes it easy to wire up once we open that file.
 * - The section layout now matches your reference: centered title + subheadline,
 *   a thin gradient divider, and a left‑aligned responsive grid underneath.
 * - Each card sits in a "glow wrapper" so we get a soft halo and subtle wiggle
 *   on hover without touching the card internals yet.
 */

type ProjectItem = {
  title: string;
  year: string;
  blurb: string;
  tags: string[];
  keyImpacts?: string[];
  ctaLive?: string;
  ctaCode?: string;
  ctaCase?: string;
  ctaYoutube?: string;
  ctaDocs?: string;
  coverImage?: string;
};

export default function ProjectsSection() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(
            'title, year, blurb, tags, highlights, github_url, demo_url, youtube_url, docs_url, cover_image, featured, sort_order, published, created_at'
          )
          .eq('published', true)
          .order('featured', { ascending: false })
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });
        if (error) throw error;

        const parsed: ProjectItem[] = (data ?? []).map((d: any) => ({
          title: d.title ?? '',
          year: d.year ?? '',
          blurb: d.blurb ?? '',
          tags: Array.isArray(d.tags)
            ? d.tags
            : typeof d.tags === 'string' && d.tags.trim()
            ? d.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : [],
          keyImpacts: Array.isArray(d.highlights)
            ? d.highlights
            : typeof d.highlights === 'string' && d.highlights.trim()
            ? d.highlights.split('|').map((s: string) => s.trim()).filter(Boolean)
            : undefined,
          ctaLive: d.demo_url || '',
          ctaCode: d.github_url || '',
          ctaCase: '',
          ctaYoutube: d.youtube_url || '',
          ctaDocs: d.docs_url || '',
          coverImage: d.cover_image || '',
        }));

        setItems(parsed);
      } catch (e) {
        console.warn('[projects-section] supabase fetch failed', e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="relative z-10 isolate py-18 md:py-24">
      <div className="container">
        {/* Heading block */}
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              <span className="gradient-text">Featured Projects</span>
            </h2>

            <p className="mt-4 text-sm md:text-base text-muted-foreground">
              A selection of impactful projects showcasing full‑stack engineering and AI integration.
            </p>

            {/* Slim gradient divider like the reference */}
            <div className="mx-auto mt-6 h-px w-40 md:w-56 bg-gradient-to-r from-transparent via-violet-500/60 to-transparent rounded-full" />
            {/* ambient dots */}
            <div className="pointer-events-none mx-auto mt-2 h-[2px] w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          </div>
        </FadeIn>

        {/* Card grid */}
        <div className="relative z-10 isolate mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-stretch">
          {loading && (
            <div className="col-span-full text-center text-sm text-white/60">Loading projects…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="col-span-full text-center text-sm text-white/60">No projects yet.</div>
          )}
          {!loading && items.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.08}>
              <div className="group relative z-0 [--halo:theme(colors.violet.500/18)] [--ring:conic-gradient(from_180deg,theme(colors.violet.500/.4),theme(colors.fuchsia.500/.35),theme(colors.cyan.400/.35),theme(colors.violet.500/.4))] hover:animate-[wiggle_800ms_ease-in-out] transition-transform duration-300 will-change-transform hover:scale-[1.02] hover:-translate-y-1">
                <div className="pointer-events-none absolute -inset-1.5 rounded-2xl bg-[radial-gradient(30%_40%_at_50%_0%,var(--halo),transparent_70%)] opacity-0 group-hover:opacity-80 transition-opacity duration-300 -z-10" />
                <div className="relative z-10 isolate min-h-[460px] flex rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-[0.5px] overflow-hidden project-card">
                  <div aria-hidden className="card-sheen" />
                  <ProjectCard p={p} />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}