"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { CertCard } from "./cert-card";

const certs = [
  {
    name: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    year: "2024",
    proof: "#",
    image: "/certs/aws.png",
  },
  {
    name: "Google Data Analytics",
    issuer: "Google",
    year: "2023",
    proof: "#",
    image: "/certs/google.png",
  },
  {
    name: "Oracle Java SE 8 Programmer",
    issuer: "Oracle",
    year: "2022",
    proof: "#",
    image: "/certs/java.png",
  },
];

export default function CertificationsSection() {
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

        <div className="relative z-10 isolate grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-stretch mt-10">
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