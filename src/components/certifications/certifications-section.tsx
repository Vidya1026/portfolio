"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { FadeIn } from "@/components/motion/FadeIn";

import { CertCard } from "./cert-card";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET || "cert-images";

// Turn a stored path like "certs/filename.png" into a public URL.
// If the DB already holds a full URL, just return it as-is.
function toPublicUrl(image?: string | null): string {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  // getPublicUrl is a pure helper (no network); safe in the client.
  return supabase.storage.from(BUCKET).getPublicUrl(image).data.publicUrl;
}

export default function CertificationsSection() {
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("certifications")
        .select("id, name, issuer, year, proof_url, image, published, sort_order")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("year", { ascending: false });

      if (!error && data) {
        setCerts(
          data.map((c: any) => ({
            name: c.name,
            issuer: c.issuer,
            year: c.year,
            proof: c.proof_url,
            image: toPublicUrl(c.image),
          }))
        );
      } else {
        setCerts([]);
      }
    })();
  }, []);

  return (
    <section className="relative z-10 isolate py-16 md:py-24 section-anchor" id="certifications">
      <div className="container">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              <span className="gradient-text">Certifications</span>
            </h2>
            <p className="mt-4 text-sm md:text-base text-muted-foreground">
              Verified credentials that back my work across cloud, data, and software engineering.
            </p>
            <div className="mx-auto mt-6 h-px w-40 md:w-56 bg-gradient-to-r from-transparent via-violet-500/60 to-transparent rounded-full" />
            <div className="pointer-events-none mx-auto mt-2 h-[2px] w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          </div>
        </FadeIn>

        <div className="relative z-10 isolate grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-stretch mt-12">
          {certs.map((c, i) => (
            <FadeIn key={c.name} delay={i * 0.06}>
              <div
                className="group relative z-0 hover:animate-[wiggle_800ms_ease-in-out] transition-transform duration-300 will-change-transform hover:scale-[1.02] hover:-translate-y-1"
              >
                {/* soft halo behind on hover */}
                <div className="pointer-events-none absolute -inset-1.5 rounded-2xl bg-[radial-gradient(30%_40%_at_50%_0%,theme(colors.violet.500/18),transparent_70%)] opacity-0 group-hover:opacity-80 transition-opacity duration-300 -z-10" />

                {/* card host with sheen (CSS in globals) */}
                <div className="relative z-10 isolate rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-[0.5px] overflow-hidden cert-card">
                  <div aria-hidden className="card-sheen" />
                  <CertCard cert={c} />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}