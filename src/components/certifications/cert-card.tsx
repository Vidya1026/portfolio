import { Badge } from "@/components/ui/badge";

type Cert = {
  name: string;
  issuer: string;
  year: string;
  proof?: string;
  image?: string; // path in /public/certs
};

export function CertCard({ cert }: { cert: Cert }) {
  return (
    // Keep the card content visually clean; the outer host provides glow/sheen
    <div className="cert-card-inner relative z-10 rounded-2xl p-4 md:p-5">
      <div className="flex items-center gap-3 md:gap-4">
        {/* Logo with soft ring */}
        <div className="cert-logo relative">
          {cert.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cert.image}
              alt={cert.name}
              className="size-12 md:size-14 rounded-md object-contain ring-1 ring-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
            />
          ) : (
            <div className="size-12 md:size-14 rounded-md bg-gradient-to-br from-violet-500/30 to-cyan-500/30 ring-1 ring-white/10" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="cert-title text-base md:text-[17px] font-semibold leading-tight truncate">
            {cert.name}
          </h3>
          <p className="cert-issuer text-sm text-muted-foreground">
            {cert.issuer} • {cert.year}
          </p>
        </div>
      </div>

      {cert.proof && (
        <div className="mt-3 md:mt-4">
          <a
            href={cert.proof}
            target="_blank"
            rel="noreferrer"
            className="btn-verify inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium bg-primary/85 text-primary-foreground hover:bg-primary transition"
          >
            Verify
          </a>
        </div>
      )}
    </div>
  );
}