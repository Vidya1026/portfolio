import { Button } from "@/components/ui/button";
import { Aurora } from "@/components/branding/Aurora";
import { FadeIn } from "@/components/motion/FadeIn";

export default function HomePage() {
  return (
    <main className="relative min-h-[80vh] grid place-items-center overflow-hidden">
      <Aurora />
      <section className="text-center space-y-4">
        <FadeIn>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight gradient-text">
            Bhargava — Full-Stack • AI/RAG
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Clean React/Next frontends. Resilient Java/Spring backends. RAG systems that ship.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" className="glow">View Resume</Button>
            <Button variant="secondary" size="lg">Projects</Button>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}