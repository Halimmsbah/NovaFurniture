import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/nova/PageShell";
import { ProductImage } from "@/components/nova/ProductImage";
import { formatEGP } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCartQuery, useUpdateCartItem, useRemoveCartItem, useApplyCoupon } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import type { Product } from "@/lib/api/types";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Nova" }] }),
  component: Cart,
});

function Cart() {
  const token = useAuth((s) => s.token);
  const cartQ = useCartQuery();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const coupon = useApplyCoupon();
  const [promo, setPromo] = useState("");

  if (!token) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 font-display text-3xl">Sign in to view your cart</h1>
          <p className="mt-3 text-muted-foreground">Your bag follows you across devices when you sign in.</p>
          <Link to="/login"><Button className="mt-8 rounded-full bg-gradient-primary px-7 shadow-glow">Sign in</Button></Link>
        </div>
      </PageShell>
    );
  }

  const items = cartQ.data?.cartItems ?? [];
  const subtotal = cartQ.data?.totalPrice ?? items.reduce((s, i) => s + i.price * i.quantity, 0);
  const afterDiscount = cartQ.data?.totalPriceAfterDiscount ?? subtotal;
  const shipping = afterDiscount > 1500 ? 0 : 150;
  const total = afterDiscount + shipping;

  if (cartQ.isLoading) {
    return <PageShell><div className="mx-auto max-w-4xl px-6 py-24 text-center text-muted-foreground">Loading…</div></PageShell>;
  }

  if (items.length === 0) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 font-display text-3xl">Your cart is empty</h1>
          <p className="mt-3 text-muted-foreground">Explore the collection and add something you love.</p>
          <Link to="/shop"><Button className="mt-8 rounded-full bg-gradient-primary px-7 shadow-glow">Browse shop</Button></Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10 lg:pt-16">
        <p className="text-xs uppercase tracking-[0.32em] text-primary/80">Cart</p>
        <h1 className="mt-2 font-display text-4xl font-light text-foreground md:text-5xl">Your bag ({items.length})</h1>
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.4fr_1fr] lg:px-10">
        <div className="space-y-3">
          {items.map((it) => {
            const product = (typeof it.product === "object" ? it.product : null) as Product | null;
            const productId = product?._id ?? (it.product as string);
            return (
              <div key={productId} className="grid grid-cols-[88px_1fr_auto] items-center gap-4 rounded-2xl border border-border/60 bg-card/40 p-3 sm:grid-cols-[100px_1fr_auto_auto]">
                <div className="relative h-[88px] w-[88px] sm:h-[100px] sm:w-[100px]"><ProductImage product={product} className="absolute inset-0" /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground sm:text-base">{product?.title ?? "Product"}</p>
                  <p className="text-xs text-accent">{formatEGP(it.price)} each</p>
                  <p className="mt-1 text-sm text-accent sm:hidden">{formatEGP(it.price * it.quantity)}</p>
                </div>
                <div className="inline-flex items-center rounded-full border border-border/70">
                  <button aria-label="Decrease quantity" title="Decrease quantity" onClick={() => update.mutate({ productId, quantity: Math.max(1, it.quantity - 1) })} className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-8 text-center text-sm">{it.quantity}</span>
                  <button aria-label="Increase quantity" title="Increase quantity" onClick={() => update.mutate({ productId, quantity: it.quantity + 1 })} className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <div className="hidden items-center gap-3 sm:flex">
                  <span className="text-sm text-accent font-medium">{formatEGP(it.price * it.quantity)}</span>
                  <button aria-label="Remove item" title="Remove item" onClick={() => remove.mutate(productId)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
            <h3 className="font-display text-xl">Order summary</h3>
            <form
              onSubmit={(e) => { e.preventDefault(); if (promo) coupon.mutate(promo); }}
              className="mt-5 flex gap-2"
            >
              <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo code" className="h-11 flex-1 rounded-full border border-border/70 bg-background/60 px-4 text-sm text-foreground outline-none focus:border-primary/60" />
              <Button type="submit" disabled={coupon.isPending} variant="outline" className="h-11 rounded-full border-border">Apply</Button>
            </form>
            <dl className="mt-5 space-y-2 border-t border-border/60 pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="text-accent">{formatEGP(subtotal)}</dd></div>
              {afterDiscount !== subtotal && (
                <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="text-accent">-{formatEGP(subtotal - afterDiscount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="text-accent">{shipping === 0 ? "Free" : formatEGP(shipping)}</dd></div>
              <div className="flex items-end justify-between border-t border-border/60 pt-3 text-base"><dt>Total</dt><dd className="font-display text-xl text-accent">{formatEGP(total)}</dd></div>
            </dl>
            <Link to="/checkout"><Button className="mt-5 h-12 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow">Checkout</Button></Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
