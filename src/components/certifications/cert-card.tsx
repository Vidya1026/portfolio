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
    <div className="rounded-2xl border bg-card/60 backdrop-blur-xs p-4 hover:shadow-glow transition">
      <div className="flex items-center gap-3">
        {cert.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cert.image}
            alt={cert.name}
            className="size-12 rounded-md object-contain"
          />
        ) : (
          <div className="size-12 rounded-md bg-gradient-to-br from-violet-500/40 to-cyan-500/40" />
        )}
        <div className="flex-1">
          <h3 className="text-base font-semibold">{cert.name}</h3>
          <p className="text-sm text-muted-foreground">
            {cert.issuer} • {cert.year}
          </p>
        </div>
      </div>

      {cert.proof && (
        <div className="mt-3">
          <a
            href={cert.proof}
            target="_blank"
            rel="noreferrer"
            className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Verify
          </a>
        </div>
      )}
    </div>
  );
}