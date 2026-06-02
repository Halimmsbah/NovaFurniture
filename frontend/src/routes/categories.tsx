import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/nova/PageShell";
import { Reveal } from "@/components/nova/Reveal";
import { useQuery } from "@tanstack/react-query";
import { listCategories } from "@/lib/api/categories";
import { ImageOff } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories — Nova" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const cats = data ?? [];

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10 lg:pt-16">
        <p className="text-xs uppercase tracking-[0.32em] text-primary/80">Categories</p>
        <h1 className="mt-2 font-display text-4xl font-light md:text-5xl">Shop by category</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Find exactly what you're looking for, organized by room and use.</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-5 px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-10">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-3xl border border-border/60 bg-card/40" />
            ))
          : cats.map((c, i) => (
              <Reveal key={c._id} i={i}>
                <Link to="/shop" search={{ category: c._id }} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl border border-border/60 bg-card/40 hover-lift">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50"><ImageOff className="h-10 w-10" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="font-display text-2xl font-light text-foreground">{c.name}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
      </div>
    </PageShell>
  );
}
