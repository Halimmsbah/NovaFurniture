import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useState } from "react";
import { ProductImage } from "./ProductImage";
import { formatEGP } from "@/lib/format";
import type { Product } from "@/lib/api/types";
import { useAddToCart, useToggleWishlist, useWishlistIds } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useAddToCart();
  const toggleWish = useToggleWishlist();
  const wishIds = useWishlistIds();
  const wished = wishIds.has(product._id);
  const hasDiscount = !!product.priceAfterDiscount && product.priceAfterDiscount < product.price;
  const price = hasDiscount ? product.priceAfterDiscount! : product.price;
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const addProductToCart = () => {
    addToCart.mutate(product._id);
  };

  return (
    <>
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-4xl overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative min-h-[320px] bg-card/40">
              <ProductImage product={product} rounded="rounded-none" className="absolute inset-0 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-transparent" />
            </div>
            <div className="p-6 lg:p-8">
              <DialogHeader className="text-left">
                <DialogTitle className="font-display text-3xl font-light text-foreground">{product.title}</DialogTitle>
                <DialogDescription className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8">
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Price</p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="font-display text-4xl text-accent">{formatEGP(price)}</span>
                  {hasDiscount && <span className="pb-1 text-sm text-muted-foreground line-through">{formatEGP(product.price)}</span>}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={addProductToCart} className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
                  Add to Cart <ShoppingBag className="h-4 w-4" />
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/products/$id" params={{ id: product._id }}>
                    View Product <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Link
        to="/products/$id"
        params={{ id: product._id }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-primary/15 via-background to-background">
          <ProductImage product={product} rounded="rounded-none" className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-105" />
          {hasDiscount && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur">
              Sale
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggleWish.mutate({ productId: product._id, has: wished }); }}
            aria-label="Wishlist"
            className={cn(
              "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-colors hover:text-foreground",
              wished ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Heart className={cn("h-4 w-4", wished && "fill-primary")} />
          </button>
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 opacity-0 transition-all duration-500 group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
              className="inline-flex h-9 items-center rounded-full bg-background/80 px-4 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground backdrop-blur"
            >
              Quick View
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); addProductToCart(); }}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-primary px-4 text-[11px] font-medium uppercase tracking-[0.22em] text-primary-foreground shadow-glow"
            >
              Add to Cart <ShoppingBag className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-auto flex items-start justify-between gap-3 p-4">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-[15px] font-medium leading-tight text-foreground">{product.title}</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl text-accent">{formatEGP(price)}</span>
              {hasDiscount && <span className="text-xs text-muted-foreground line-through">{formatEGP(product.price)}</span>}
            </div>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); addProductToCart(); }}
            aria-label="Add to cart"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-105"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </Link>
    </>
  );
}
