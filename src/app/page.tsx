import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-[80vh] grid place-items-center">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Bhargava — Full-Stack • AI/RAG
          </span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Clean React/Next frontends. Resilient Java/Spring backends. RAG systems that ship.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg">View Resume</Button>
          <Button variant="secondary" size="lg">Projects</Button>
        </div>
      </section>
    </main>
  );
}