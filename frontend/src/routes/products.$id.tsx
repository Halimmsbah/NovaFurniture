import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/nova/PageShell";
import { Section } from "@/components/nova/Section";
import { ProductImage } from "@/components/nova/ProductImage";
import { formatEGP } from "@/lib/format";
import { Button as UiButton } from "@/components/ui/button";
import { Heart, Minus, Plus, Star, Truck, Shield, RotateCcw, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAddToCart, useToggleWishlist, useWishlistIds } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { getProduct, listProducts } from "@/lib/api/products";
import { ProductCard } from "@/components/nova/ProductCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/products/$id")({
  head: ({ params }) => ({ meta: [{ title: `Product — Nova` }, { name: "description", content: `Nova product ${params.id}` }] }),
  component: PDP,
});

function PDP() {
  const { id } = Route.useParams();
  const productQ = useQuery({ queryKey: ["product", id], queryFn: () => getProduct(id) });
  const relatedQ = useQuery({ queryKey: ["related", id], queryFn: () => listProducts({ limit: 4 }) });
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const addToCart = useAddToCart();
  const toggleWish = useToggleWishlist();
  const wishIds = useWishlistIds();

  if (productQ.isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl border border-border/60 bg-card/40" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded bg-card/60" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-card/60" />
              <div className="h-10 w-1/3 animate-pulse rounded bg-card/60" />
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (productQ.isError || !productQ.data) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <h1 className="font-display text-4xl">Product not found</h1>
          <p className="mt-3 text-muted-foreground">It may have been removed or the link is broken.</p>
          <Link to="/shop"><UiButton className="mt-6 rounded-full bg-gradient-primary px-6 shadow-glow">Back to shop</UiButton></Link>
        </div>
      </PageShell>
    );
  }

  const product = productQ.data;
  const wished = wishIds.has(product._id);
  const hasDiscount = !!product.priceAfterDiscount && product.priceAfterDiscount < product.price;
  const price = hasDiscount ? product.priceAfterDiscount! : product.price;
  const related = (relatedQ.data?.items ?? []).filter((p) => p._id !== product._id).slice(0, 4);
  const categoryName = typeof product.category === "object" && product.category ? product.category.name : "Furniture";
  const zoomClass =
    zoomScale <= 1
      ? "scale-100"
      : zoomScale <= 1.25
        ? "scale-[1.25]"
        : zoomScale <= 1.5
          ? "scale-[1.5]"
          : zoomScale <= 1.75
            ? "scale-[1.75]"
            : "scale-200";

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-10">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-foreground">{categoryName}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.title}</span>
        </nav>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-10">
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <div className="flex flex-col gap-3">
            {(product.images?.length ? product.images : [product.imgCover]).filter(Boolean).slice(0, 8).map((img, i) => (
              <button
                key={i}
                type="button"
                aria-label={`View product image ${i + 1}`}
                title={`View product image ${i + 1}`}
                onClick={() => setSelectedIndex(i)}
                className={cn("relative aspect-square overflow-hidden rounded-xl border", i === selectedIndex ? "border-primary/60" : "border-border/60")}
              >
                <img src={img!} alt="" className="absolute inset-0 h-full w-full object-contain p-2" />
              </button>
            ))}
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-card/40 to-background">
            <button
              type="button"
              aria-label="Open image zoom"
              title="Open image zoom"
              onClick={() => {
                setZoomOpen(true);
                setZoomScale(1);
              }}
              className="absolute inset-0"
            >
              <ProductImage product={product} src={(product.images?.length ? product.images : [product.imgCover]).filter(Boolean)[selectedIndex] ?? undefined} rounded="rounded-none" className="absolute inset-0" />
            </button>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs uppercase tracking-[0.28em] text-primary/80">{categoryName}</p>
          <h1 className="mt-2 font-display text-4xl font-light text-foreground md:text-5xl">{product.title}</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex gap-0.5 text-accent">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className={cn("h-4 w-4", k < Math.round(product.rateAvg ?? 0) && "fill-current")} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{(product.rateAvg ?? 0).toFixed(1)} ({product.rateCount ?? 0} reviews)</span>
          </div>
          <p className="mt-6 font-display text-4xl text-accent">{formatEGP(price)}</p>
          {hasDiscount && <p className="mt-1 text-sm text-muted-foreground line-through">{formatEGP(product.price)}</p>}

          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Quantity</p>
            <div className="inline-flex h-12 items-center rounded-full border border-border/70 bg-card/40">
              <button type="button" aria-label="Decrease quantity" title="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-12 w-12 items-center justify-center text-muted-foreground hover:text-foreground"><Minus className="h-4 w-4" /></button>
              <span className="w-12 text-center text-sm">{qty}</span>
              <button type="button" aria-label="Increase quantity" title="Increase quantity" onClick={() => setQty(qty + 1)} className="flex h-12 w-12 items-center justify-center text-muted-foreground hover:text-foreground"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <UiButton
              onClick={() => { for (let i = 0; i < qty; i++) addToCart.mutate(product._id); }}
              disabled={addToCart.isPending}
              className="h-12 flex-1 rounded-full bg-gradient-primary px-7 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-95"
            >
              Add to cart
            </UiButton>
            <button
              onClick={() => toggleWish.mutate({ productId: product._id, has: wished })}
              aria-label="Wishlist"
              className={cn("flex h-12 w-12 items-center justify-center rounded-full border border-border/70 hover:text-foreground", wished ? "text-primary" : "text-muted-foreground")}
            >
              <Heart className={cn("h-5 w-5", wished && "fill-primary")} />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
            {[{ Icon: Truck, t: "Free delivery" }, { Icon: Shield, t: "2-year warranty" }, { Icon: RotateCcw, t: "14-day returns" }].map(({ Icon, t }) => (
              <div key={t} className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 p-3 text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{t}</div>
            ))}
          </div>
        </div>
      </div>

      <Section>
        <div className="border-b border-border/60">
          <div className="flex gap-8">
            {(["desc", "specs", "reviews"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn("relative -mb-px py-4 text-sm transition-colors", tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {t === "desc" ? "Description" : t === "specs" ? "Details" : `Reviews (${product.rateCount ?? 0})`}
                {tab === t && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 max-w-3xl leading-relaxed text-muted-foreground">
          {tab === "desc" && <p>{product.description}</p>}
          {tab === "specs" && (
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-muted-foreground">In stock</dt><dd className="text-foreground">{product.quantity ?? 0}</dd>
              <dt className="text-muted-foreground">Sold</dt><dd className="text-foreground">{product.sold ?? 0}</dd>
              <dt className="text-muted-foreground">Rating</dt><dd className="text-foreground">{(product.rateAvg ?? 0).toFixed(1)} / 5</dd>
            </dl>
          )}
          {tab === "reviews" && (
            <p className="text-sm">Reviews appear here once available.</p>
          )}
        </div>
      </Section>

      {related.length > 0 && (
        <Section eyebrow="You may also like" title="Related products">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </Section>
      )}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{product.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="h-[60vh] w-[80%] overflow-hidden rounded-lg border border-border/60">
              <img
                src={(product.images?.length ? product.images : [product.imgCover]).filter(Boolean)[selectedIndex] ?? undefined}
                alt={product.title}
                className={cn("h-full w-full object-contain transition-transform duration-150", zoomClass)}
              />
            </div>
            <div className="flex items-center gap-2">
              <UiButton type="button" aria-label="Zoom out" title="Zoom out" onClick={() => setZoomScale((s) => Math.max(1, +(s - 0.25).toFixed(2)))}>-</UiButton>
              <div className="text-sm text-muted-foreground">{zoomScale.toFixed(2)}x</div>
              <UiButton type="button" aria-label="Zoom in" title="Zoom in" onClick={() => setZoomScale((s) => +(s + 0.25).toFixed(2))}>+</UiButton>
            </div>
          </div>
          <DialogFooter>
            <UiButton type="button" variant="ghost" onClick={() => setZoomOpen(false)}>Close</UiButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
