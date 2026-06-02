import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/nova/PageShell";
import { Field } from "@/components/nova/Field";
import { ProductImage } from "@/components/nova/ProductImage";
import { formatEGP } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Banknote, CreditCard, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartQuery, useClearCart } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCashOrder, createCheckoutSession } from "@/lib/api/orders";
import { apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import type { Product } from "@/lib/api/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Nova" }] }),
  component: Checkout,
});

const steps = ["Shipping", "Payment", "Review", "Success"] as const;

function Checkout() {
  const token = useAuth((s) => s.token);
  const navigate = useNavigate();
  const cartQ = useCartQuery();
  const clear = useClearCart();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [pm, setPm] = useState<"cash" | "card">("cash");
  const [addr, setAddr] = useState({ name: "", phone: "", city: "", street: "" });

  if (!token) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl">Sign in to checkout</h1>
          <Link to="/login"><Button className="mt-8 rounded-full bg-gradient-primary px-7 shadow-glow">Sign in</Button></Link>
        </div>
      </PageShell>
    );
  }

  const items = cartQ.data?.cartItems ?? [];
  const subtotal = cartQ.data?.totalPriceAfterDiscount ?? cartQ.data?.totalPrice ?? 0;
  const shipping = subtotal > 1500 ? 0 : 150;
  const total = subtotal + shipping;

  const placeOrder = useMutation({
    mutationFn: async () => {
      const payload = { shippingAddress: { street: addr.street, city: addr.city, phone: addr.phone } };
      if (!cartQ.data?._id) throw new Error("Cart not found");
      if (pm === "card") {
        const session = await createCheckoutSession(cartQ.data._id);
        const url = session?.session?.url ?? session?.url;
        if (url) { window.location.href = url; return; }
        throw new Error("Stripe session not available");
      }
      return createCashOrder(cartQ.data._id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      setStep(3);
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not place order")),
  });

  if (!cartQ.isLoading && items.length === 0 && step < 3) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl">Your cart is empty</h1>
          <Link to="/shop"><Button className="mt-8 rounded-full bg-gradient-primary px-7 shadow-glow">Browse shop</Button></Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10 lg:pt-16">
        <p className="text-xs uppercase tracking-[0.32em] text-primary/80">Checkout</p>
        <h1 className="mt-2 font-display text-4xl font-light md:text-5xl">Complete your order</h1>
        <ol className="mt-10 flex items-center gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium transition", i <= step ? "bg-gradient-primary text-primary-foreground shadow-glow" : "border border-border/70 bg-card/40 text-muted-foreground")}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-sm sm:inline", i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
              {i < steps.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-primary" : "bg-border/60")} />}
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.5fr_1fr] lg:px-10">
        <div className="space-y-6">
          {step === 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <h2 className="font-display text-2xl">Shipping address</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} placeholder="Ahmed Mohamed" />
                <Field label="Phone number" required value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} placeholder="0100 123 4567" />
                <Field label="City" required value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} placeholder="Cairo" />
                <div className="sm:col-span-2"><Field label="Street address" required value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} placeholder="123 El-Tayaran St, Nasr City" /></div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <h2 className="font-display text-2xl">Payment method</h2>
              <div className="mt-6 space-y-3">
                {([
                  { id: "cash" as const, Icon: Banknote, name: "Cash on delivery", note: "Pay in cash when you receive your order" },
                  { id: "card" as const, Icon: CreditCard, name: "Credit / Debit card", note: "Secure payment via Stripe" },
                ]).map((p) => (
                  <button key={p.id} onClick={() => setPm(p.id)} className={cn("flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition", pm === p.id ? "border-primary/60 bg-primary/10" : "border-border/60 bg-card/40 hover:border-border")}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><p.Icon className="h-5 w-5" /></span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.note}</p>
                    </div>
                    <span className={cn("h-4 w-4 rounded-full border", pm === p.id ? "border-primary bg-primary" : "border-border")} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <h2 className="font-display text-2xl">Review</h2>
              <p className="mt-3 text-sm text-muted-foreground">Shipping to <span className="text-foreground">{addr.name}, {addr.street}, {addr.city}</span></p>
              <p className="mt-1 text-sm text-muted-foreground">Payment: <span className="text-foreground">{pm === "cash" ? "Cash on delivery" : "Card via Stripe"}</span></p>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-3xl border border-border/60 bg-card/40 p-10 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow"><Check className="h-9 w-9" /></div>
              <h2 className="mt-6 font-display text-3xl">Order placed</h2>
              <p className="mt-2 text-muted-foreground">Thank you. Your order is being prepared.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/shop"><Button className="rounded-full bg-gradient-primary px-7 shadow-glow">Continue shopping</Button></Link>
                <Button variant="outline" className="rounded-full border-border" onClick={() => navigate({ to: "/" })}>Back to home</Button>
              </div>
            </div>
          )}

          {step < 3 && (
            <div className="flex items-center justify-between">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-full text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /> Back</Button>
              <Button
                disabled={placeOrder.isPending}
                onClick={() => {
                  if (step === 0) {
                    if (!addr.name || !addr.phone || !addr.city || !addr.street) {
                      toast.error("Please complete the address"); return;
                    }
                  }
                  if (step === 2) placeOrder.mutate();
                  else setStep(step + 1);
                }}
                className="h-12 rounded-full bg-gradient-primary px-7 text-primary-foreground shadow-glow"
              >
                {step === 2 ? (placeOrder.isPending ? "Placing…" : "Place order") : "Continue"} <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
            <h3 className="font-display text-xl">Order summary</h3>
            <div className="mt-4 space-y-3">
              {items.map((i, idx) => {
                const product = (typeof i.product === "object" ? i.product : null) as Product | null;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0"><ProductImage product={product} className="absolute inset-0" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-foreground">{product?.title ?? "Product"}</p>
                      <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
                    </div>
                    <span className="text-sm text-accent font-medium">{formatEGP(i.price * i.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <dl className="mt-5 space-y-2 border-t border-border/60 pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="text-accent">{formatEGP(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="text-accent">{shipping > 0 ? formatEGP(shipping) : "Free"}</dd></div>
              <div className="flex items-end justify-between border-t border-border/60 pt-3 text-base"><dt>Total</dt><dd className="font-display text-xl text-accent">{formatEGP(total)}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
