import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/nova/PageShell";
import { ProductCard } from "@/components/nova/ProductCard";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/api/products";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Nova" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const productsQ = useQuery({
    queryKey: ["search", q],
    queryFn: () => listProducts({ keyword: q || undefined, limit: 40 }),
    enabled: q.length > 0,
  });
  const list = productsQ.data?.items ?? [];

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 pt-16 lg:pt-24">
        <h1 className="text-center font-display text-4xl font-light md:text-5xl">What are you looking for?</h1>
        <div className="relative mt-8">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search chairs, sofas, lighting..."
            className="h-14 w-full rounded-full border border-border/70 bg-card/40 pl-14 pr-5 text-base text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
          />
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
          {["Sofa", "Chair", "Table", "Lamp"].map((t) => (
            <button key={t} onClick={() => setQ(t)} className="rounded-full border border-border/60 px-3 py-1.5 text-muted-foreground hover:border-primary/60 hover:text-foreground">{t}</button>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        {list.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
      {q && !productsQ.isLoading && list.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">No results for "{q}"</p>
      )}
    </PageShell>
  );
}
