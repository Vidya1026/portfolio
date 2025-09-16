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
    <section className="relative py-16 md:py-24 section-anchor" id="certifications">
      <div className="container">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            <span className="gradient-text">Certifications</span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((c) => (
            <FadeIn key={c.name}>
              <CertCard cert={c} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}