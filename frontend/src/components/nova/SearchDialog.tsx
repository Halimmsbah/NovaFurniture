import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./ProductImage";
import { listProducts } from "@/lib/api/products";
import { formatEGP } from "@/lib/format";
import type { Product } from "@/lib/api/types";

const suggestions = ["Sofa", "Chair", "Table", "Lighting"] as const;

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmed = query.trim();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: ["quick-search", trimmed],
    queryFn: async () => (await listProducts({ keyword: trimmed, limit: 6, sort: "-createdAt" })).items,
    enabled: open && trimmed.length > 0,
  });

  const results = data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden p-0 sm:rounded-3xl">
        <div className="border-b border-border/60 bg-gradient-to-br from-primary/15 via-background to-background px-6 py-6 sm:px-8">
          <DialogHeader className="text-left">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary/75">Search</p>
            <DialogTitle className="font-display text-3xl font-light text-foreground">Find your piece</DialogTitle>
            <DialogDescription className="max-w-2xl text-sm text-muted-foreground">
              Search Nova’s catalog instantly and jump straight to the furniture you want.
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-6">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sofas, chairs, tables, lamps..."
              className="h-14 w-full rounded-full border border-border/70 bg-background/80 pl-14 pr-5 text-base text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
            />
          </div>

          {!trimmed && (
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuery(item)}
                  className="rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6 sm:p-8">
          {!trimmed ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-8 text-center text-sm text-muted-foreground">
              Start typing to search products across the catalog.
            </div>
          ) : isFetching ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-2xl border border-border/60 bg-card/30" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-10 text-center">
              <p className="font-medium text-foreground">No matches found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different keyword or browse the full shop.
              </p>
              <Button asChild variant="outline" className="mt-5 rounded-full">
                <Link to="/shop">
                  Browse shop <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {results.map((product: Product) => (
                <Link
                  key={product._id}
                  to="/products/$id"
                  params={{ id: product._id }}
                  onClick={() => onOpenChange(false)}
                  className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card/40 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-background/60">
                    <ProductImage product={product} rounded="rounded-none" className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{product.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">{formatEGP(product.priceAfterDiscount ?? product.price)}</p>
                  </div>
                  <Sparkles className="h-4 w-4 shrink-0 text-primary/60 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
