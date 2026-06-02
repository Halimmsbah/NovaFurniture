import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/nova/PageShell";
import { Section } from "@/components/nova/Section";
import { Reveal } from "@/components/nova/Reveal";
import { ProductCard } from "@/components/nova/ProductCard";
import { ProductImage } from "@/components/nova/ProductImage";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import type { Product, Category } from "@/lib/api/types";
import { ArrowRight, Truck, Shield, RotateCcw, BadgeCheck, Play } from "lucide-react";
import heroRoom from "@/assets/hero-room.jpg";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova — Premium Furniture for Modern Life" },
      { name: "description", content: "Discover Nova's hand-crafted furniture: sofas, chairs, tables, beds and lighting designed for the modern Egyptian home." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PageShell>
      <Hero />
      <Categories />
      <FeaturedCollection />
      <Bestsellers />
      <Perks />
    </PageShell>
  );
}

function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!headlineRef.current) return;
    if (prefersReducedMotion()) return;
    const words = headlineRef.current.querySelectorAll<HTMLElement>("[data-word]");
    const ctx = gsap.context(() => {
      gsap.from(words, {
        yPercent: 110,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        delay: 0.15,
      });
    }, headlineRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-shell relative isolate overflow-hidden">
      <img
        src={heroRoom}
        alt="Premium Nova furniture interior"
        aria-hidden
        className="hero-room-image pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="hero-overlay pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="hero-glow-layer pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl items-center px-6 py-24 sm:px-8 lg:min-h-[92vh] lg:px-10 lg:py-32">
        <div className="max-w-2xl text-left lg:pl-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-8 text-xs font-medium uppercase tracking-[0.34em] text-primary/75"
          >
            Premium Furniture Collection
          </motion.div>

          <h1
            ref={headlineRef}
            className="font-display text-4xl font-light leading-[1.04] text-foreground sm:text-5xl md:text-6xl lg:text-[5.75rem]"
          >
            <span className="block overflow-hidden">
              <span data-word className="inline-block">Design</span>{" "}
              <span data-word className="inline-block">Your</span>
            </span>
            <span className="block overflow-hidden">
              <span data-word className="text-gradient inline-block italic">Dream</span>{" "}
              <span data-word className="text-gradient inline-block italic">Space</span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            High quality furniture to create a space you'll love coming home to.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <a href="#featured-collection" className="inline-block w-full sm:w-auto">
              <Button size="lg" className="h-12 w-full rounded-full bg-gradient-primary px-7 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-95 sm:w-auto">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Link to="/shop" className="group inline-flex w-full items-center justify-center gap-3 rounded-full border border-border/70 bg-background/40 px-5 py-3 text-sm text-foreground backdrop-blur transition-colors hover:border-primary/60 sm:w-auto">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Play className="h-3.5 w-3.5 fill-current" />
              </span>
              Explore Collections
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Perks() {
  const items = [
    { Icon: Truck, title: "Free delivery", note: "On orders over EGP 1,500" },
    { Icon: BadgeCheck, title: "Cash on delivery", note: "Pay when you receive" },
    { Icon: RotateCcw, title: "Easy returns", note: "14-day return policy" },
    { Icon: Shield, title: "2-year warranty", note: "On all furniture" },
  ];
  return (
    <section className="mx-auto mt-24 max-w-7xl px-6 pb-12 lg:px-10 lg:pb-16">
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-card/40 p-3 backdrop-blur md:grid-cols-4">
        {items.map(({ Icon, title, note }) => (
          <div key={title} className="flex items-center gap-3 rounded-xl p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="truncate text-xs text-muted-foreground">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Categories() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: products = [] } = useQuery({ queryKey: ["products", "home"], queryFn: async () => (await listProducts({ limit: 24 })).items });
  return (
    <Section
      eyebrow="Browse"
      title="Shop by Category"
      action={
        <Link to="/categories" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          View all categories <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.slice(0, 6).map((c: Category, i: number) => {
          const product = products.find((p: Product) => {
            const cat = p.category;
            if (!cat) return false;
            if (typeof cat === "string") return cat === c._id;
            return cat._id === c._id;
          });
          return (
            <Reveal key={c._id} i={i}>
              <Link
                to="/shop"
                search={{ category: c._id }}
                aria-label={`Browse ${c.name}`}
                className="group block outline-none transition-transform duration-500 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-card/40 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-glow">
                  {product && <ProductImage product={product} rounded="rounded-none" className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-base font-medium text-foreground">{c.name}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

function Bestsellers() {
  const { data: products = [] } = useQuery({ queryKey: ["products", "bestsellers"], queryFn: async () => (await listProducts({ limit: 8, sort: "-sold" })).items });
  const list = products.slice(0, 4);
  return (
    <Section eyebrow="Best sellers" title="Best Sellers" action={<Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">Shop all <ArrowRight className="h-4 w-4" /></Link>}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p: Product, i: number) => (
          <Reveal key={p._id + "b"} i={i}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function FeaturedCollection() {
  const { data: products = [] } = useQuery({ queryKey: ["products", "featured"], queryFn: async () => (await listProducts({ limit: 4, sort: "-createdAt" })).items });
  const list = products.slice(0, 4);

  if (!list.length) return null;

  return (
    <Section eyebrow="Curated" title="Featured Collection" action={<Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">View all products <ArrowRight className="h-4 w-4" /></Link>}>
      <div id="featured-collection" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((p: Product, i: number) => (
          <Reveal key={p._id} i={i}>
            <Link
              to="/products/$id"
              params={{ id: p._id }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
                <ProductImage product={p} rounded="rounded-none" className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105" />
                {i === 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur">
                    Featured
                  </span>
                )}
              </div>
              <div className="mt-auto p-4">
                <p className="truncate text-[15px] font-medium leading-tight text-foreground">{p.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.price.toLocaleString()} EGP</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
