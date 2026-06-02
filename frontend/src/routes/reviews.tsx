import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/nova/PageShell";
import { Star } from "lucide-react";
import { Reveal } from "@/components/nova/Reveal";

const reviews = [
  { n: "Mai Ahmed", c: "Cairo", t: "NOVA furniture completely transformed my living room. Quality is amazing." },
  { n: "Omar Hassan", c: "Giza", t: "Fast delivery, great quality, and the design is just beautiful." },
  { n: "Yara Mostafa", c: "Alexandria", t: "The best furniture store I've dealt with in Egypt. Highly recommended." },
  { n: "Khaled Ezz", c: "Mansoura", t: "Honest pricing for the quality. The velvet chair is even better than the photos." },
  { n: "Salma Adel", c: "Cairo", t: "Their team helped me pick a sofa that fits my apartment perfectly." },
  { n: "Hassan Tarek", c: "Alexandria", t: "The bed frame is solid and the finish is impeccable. Very happy." },
];

export const Route = createFileRoute("/reviews")({
  head: () => ({ meta: [{ title: "Customer Reviews — Nova" }] }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10 lg:pt-16">
        <p className="text-xs uppercase tracking-[0.32em] text-primary/80">Reviews</p>
        <h1 className="mt-2 font-display text-4xl font-light md:text-5xl">What our customers say</h1>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex gap-0.5 text-accent">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-5 w-5 fill-current" />)}</div>
          <span className="text-sm text-muted-foreground">4.9 average · 2,840 verified reviews</span>
        </div>
      </div>
      <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-5 px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-10">
        {reviews.map((r, i) => (
          <Reveal key={r.n} i={i}>
            <div className="h-full rounded-2xl border border-border/60 bg-card/40 p-6 hover-lift">
              <div className="mb-4 flex gap-0.5 text-accent">{Array.from({length:5}).map((_,k)=><Star key={k} className="h-4 w-4 fill-current"/>)}</div>
              <p className="text-foreground">"{r.t}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-medium text-primary-foreground">{r.n[0]}</div>
                <div><p className="text-sm font-medium">{r.n}</p><p className="text-xs text-muted-foreground">{r.c}, Egypt</p></div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </PageShell>
  ),
});
