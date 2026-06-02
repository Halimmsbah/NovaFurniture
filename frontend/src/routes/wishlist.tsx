import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/nova/PageShell";
import { ProductCard } from "@/components/nova/ProductCard";
import { useWishlistQuery } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Nova" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const token = useAuth((s) => s.token);
  const { data, isLoading } = useWishlistQuery();

  if (!token) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <Heart className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 font-display text-3xl">Sign in to save favorites</h1>
          <Link to="/login"><Button className="mt-8 rounded-full bg-gradient-primary px-7 shadow-glow">Sign in</Button></Link>
        </div>
      </PageShell>
    );
  }

  const list = data ?? [];
  if (!isLoading && list.length === 0) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <Heart className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 font-display text-3xl">Your wishlist is empty</h1>
          <p className="mt-3 text-muted-foreground">Tap the heart on any product to save it for later.</p>
          <Link to="/shop"><Button className="mt-8 rounded-full bg-gradient-primary px-7 shadow-glow">Browse shop</Button></Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10 lg:pt-16">
        <p className="text-xs uppercase tracking-[0.32em] text-primary/80">Saved for later</p>
        <h1 className="mt-2 font-display text-4xl font-light md:text-5xl">Your wishlist ({list.length})</h1>
      </div>
      <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        {list.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </PageShell>
  );
}
