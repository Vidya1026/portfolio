"use client";

import { useMemo } from "react";
import { supabase } from "@/lib/supabase/client";

type Cert = {
  name: string;
  issuer: string;
  year: string;
  proof?: string;
  /**
   * Can be either:
   *  - a full https URL
   *  - a storage object path inside the bucket (e.g. "certs/azure-ai.png")
   *  - (optionally) a path that mistakenly includes the bucket prefix (e.g. "cert-images/certs/azure-ai.png")
   */
  image?: string;
};

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET || "cert-images";

/** Return a public, hotlinkable URL for a cert image. */
function toPublicUrl(image?: string): string | null {
  if (!image) return null;

  // If it's already an absolute URL, use it as-is.
  if (/^https?:\/\//i.test(image)) return image;

  // Normalize: if the value accidentally includes the bucket name, strip it.
  let path = image.replace(/^\/+/, "");
  if (path.startsWith(`${BUCKET}/`)) {
    path = path.slice(BUCKET.length + 1);
  }

  // Ask Supabase to generate the public URL for the object in our bucket.
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(encodeURI(path));
  return data?.publicUrl ?? null;
}

export function CertCard({ cert }: { cert: Cert }) {
  const imgSrc = useMemo(() => toPublicUrl(cert.image), [cert.image]);

  return (
    <div className="cert-card-inner relative z-10 rounded-xl p-3 md:p-4 flex flex-col w-full h-full">
      <div className="w-full aspect-[16/10] rounded-lg overflow-hidden mb-3 bg-black/30 flex items-center justify-center">
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={cert.name}
            className="w-full h-full object-contain object-center bg-white"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="cert-title text-sm md:text-base font-semibold leading-tight truncate mb-0.5">
          {cert.name}
        </h3>
        <p className="cert-issuer text-xs md:text-sm text-muted-foreground">
          {cert.issuer} • {cert.year}
        </p>
      </div>

      {cert.proof && (
        <div className="mt-3">
          <a
            href={cert.proof}
            target="_blank"
            rel="noreferrer"
            className="btn-verify inline-flex w-full justify-center items-center gap-2 rounded-md px-3 py-1.5 text-xs md:text-sm font-medium bg-primary/85 text-primary-foreground hover:bg-primary transition"
          >
            Verify
          </a>
        </div>
      )}
    </div>
  );
}