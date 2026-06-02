import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/nova/PageShell";
import { ProductCard } from "@/components/nova/ProductCard";
import { Reveal } from "@/components/nova/Reveal";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { listCategories } from "@/lib/api/categories";
import { listProducts } from "@/lib/api/products";
import type { Product } from "@/lib/api/types";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — Nova Furniture" },
      {
        name: "description",
        content: "Browse all Nova furniture: chairs, sofas, tables, beds, lighting and more.",
      },
    ],
  }),
  component: Shop,
});

const sorts: Array<{ label: string; value: string }> = [
  { label: "Featured", value: "" },
  { label: "Newest", value: "-createdAt" },
  { label: "Price: low to high", value: "price" },
  { label: "Price: high to low", value: "-price" },
];

function Shop() {
  const navigate = useNavigate();
  const { category } = Route.useSearch();
  const [q, setQ] = useState("");
  const [price, setPrice] = useState<[number, number]>([0, 100000]);
  const [sort, setSort] = useState(sorts[0].value);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    staleTime: 5 * 60_000,
  });

  const productsQ = useInfiniteQuery({
    queryKey: ["shop-products", category ?? "all", q, price[0], price[1], sort],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      listProducts({
        page: pageParam as number,
        limit: PAGE_SIZE,
        category,
        priceGte: price[0],
        priceLte: price[1],
        sort: sort || undefined,
        keyword: q.trim() || undefined,
      }),
    getNextPageParam: (lastPage, pages) => (lastPage.items.length === PAGE_SIZE ? pages.length + 1 : undefined),
  });

  const visibleList = productsQ.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10 lg:pt-16">
        <p className="text-xs uppercase tracking-[0.32em] text-primary/80">Shop</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-light text-foreground md:text-5xl">
            All products
          </h1>
          <p className="text-sm text-muted-foreground">{productsQ.isLoading ? "Loading…" : `${visibleList.length} items`}</p>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-7xl gap-8 px-6 lg:grid-cols-[260px_1fr] lg:px-10">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-xl border border-border/70 bg-background/60 pl-9 pr-3 text-sm outline-none focus:border-primary/60"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
            <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Category
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => navigate({ search: (prev) => ({ ...prev, category: undefined }) })}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                  !category
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                )}
              >
                <span>All</span>
              </button>
              {(categories.data ?? []).map((c) => (
                <button
                  key={c._id}
                  onClick={() => navigate({ search: (prev) => ({ ...prev, category: c._id }) })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                    category === c._id
                      ? "bg-primary/15 text-foreground"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                  )}
                >
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Price (EGP)
            </h3>
            <p className="mb-4 text-sm text-foreground">
              {price[0].toLocaleString()} – {price[1].toLocaleString()}
            </p>
            <Slider
              min={0}
              max={100000}
              step={100}
              value={price}
              onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])}
            />
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {category && (
                <button
                  onClick={() => navigate({ search: (prev) => ({ ...prev, category: undefined }) })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs text-foreground"
                >
                  Category <X className="h-3 w-3" />
                </button>
              )}
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs text-foreground"
                >
                  "{q}" <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 rounded-lg border border-border/70 bg-card/40 px-3 text-sm text-foreground outline-none focus:border-primary/60"
              >
                {sorts.map((s) => (
                  <option key={s.label} value={s.value} className="bg-background">
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {productsQ.isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-2xl border border-border/60 bg-card/40"
                />
              ))}
            </div>
          ) : visibleList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 p-16 text-center text-muted-foreground">
              No products match your filters.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleList.map((p, i) => (
                  <Reveal key={p._id} i={i}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
              {productsQ.hasNextPage && (
                <div className="mt-10 flex justify-center">
                  <Button
                    onClick={() => productsQ.fetchNextPage()}
                    disabled={productsQ.isFetchingNextPage}
                    variant="outline"
                    className="rounded-full px-6"
                  >
                    {productsQ.isFetchingNextPage ? "Loading more…" : "Load more"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
