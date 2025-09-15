import { Badge } from "@/components/ui/badge";
import SpotlightCard from "@/components/ui/spotlight-card";

type Project = {
  title: string;
  year: string;
  blurb: string;
  tags: string[];
  ctaLive?: string;
  ctaCode?: string;
};

export function ProjectCard({ p }: { p: Project }) {
  return (
    <SpotlightCard className="glass hover:shadow-glow">
      <div className="flex items-start justify-between">
        <h3 className="text-xl font-semibold">{p.title}</h3>
        <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">{p.year}</span>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <Badge key={t} variant="secondary" className="bg-muted/40">
            {t}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        {p.ctaLive && (
          <a
            href={p.ctaLive}
            target="_blank"
            rel="noreferrer"
            className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Live
          </a>
        )}
        {p.ctaCode && (
          <a
            href={p.ctaCode}
            target="_blank"
            rel="noreferrer"
            className="text-sm px-3 py-1.5 rounded-md border hover:bg-muted/30 transition"
          >
            Code
          </a>
        )}
      </div>
    </SpotlightCard>
  );
}