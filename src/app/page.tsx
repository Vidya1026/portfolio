import { Button } from "@/components/ui/button";
import { Aurora } from "@/components/branding/Aurora";
import { FadeIn } from "@/components/motion/FadeIn";
import ProjectsSection from "@/components/projects/projects-section";
import ExperienceSection from "@/components/experience/experience-section";
import CertificationsSection from "@/components/certifications/certifications-section";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <main id="home" className="relative min-h-[70vh] grid grid-cols-1 md:grid-cols-2 place-items-center overflow-hidden bg-background section-anchor">
        <Aurora />
        <div>
          <section className="text-center space-y-4 pt-8 pb-16">
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
        </div>
        <div className="flex justify-center items-center">
          <div className="glow rounded-lg overflow-hidden">
            <Image src="/profile.png" alt="Profile Image" width={300} height={300} className="rounded-lg" />
          </div>
        </div>
      </main>

      {/* Projects */}
      <section id="projects" className="section-anchor">
        <ProjectsSection />
      </section>
      <section id="experience" className="section-anchor">
        <ExperienceSection />
      </section>

      <CertificationsSection />

      <section id="chat" className="section-anchor" />
    </>
  );
}