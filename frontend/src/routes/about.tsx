import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/nova/PageShell";
import { Section } from "@/components/nova/Section";
import bg from "@/assets/background.png";
import heroRoom from "@/assets/hero-room.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Nova Furniture" }, { name: "description", content: "Nova is an Egyptian luxury furniture house designing modern pieces for the modern home." }] }),
  component: () => (
    <PageShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero-glow" />
        <img src={bg} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25 mix-blend-luminosity" />
        <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:py-32">
          <p className="mb-4 text-xs uppercase tracking-[0.32em] text-primary/80">Our story</p>
          <h1 className="font-display text-5xl font-light leading-tight md:text-6xl lg:text-7xl">Quiet luxury,<br /><span className="text-gradient italic">made in Egypt.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">Nova was founded in Cairo with one idea: that great furniture should feel personal, last for decades, and quietly elevate everyday life.</p>
        </div>
      </section>

      <Section eyebrow="What we believe" title="Designed with intention. Built to last.">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "Material honesty", d: "We work with solid hardwoods, natural fibers and full-grain leather — never veneers pretending to be something else." },
            { t: "Hand-finished", d: "Every piece passes through skilled hands in our Cairo workshop, where details are checked one by one." },
            { t: "Designed for life", d: "Restrained, refined silhouettes that don't go out of style — meant to age beautifully alongside you." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <h3 className="font-display text-xl text-foreground">{c.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40">
          <div className="relative aspect-[16/8]">
            <img src={heroRoom} alt="Nova interior" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      </Section>
    </PageShell>
  ),
});
