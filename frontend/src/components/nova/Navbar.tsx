import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartCount } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { SearchDialog } from "./SearchDialog";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useCartCount();
  const token = useAuth((s) => s.token);
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobile(false); }, [pathname]);

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-500", scrolled ? "glass-strong border-b border-border/40" : "bg-transparent")}>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:h-24 lg:px-10">
        <Logo size={48} className="-mt-1" />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link key={l.to} to={l.to} className={cn("relative rounded-full px-4 py-2 text-sm transition-colors", active ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {active && <span className="absolute inset-0 -z-10 rounded-full bg-primary/15 ring-1 ring-primary/30" />}
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground md:flex"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <Link to="/wishlist" className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground md:flex">
            <Heart className="h-[18px] w-[18px]" />
          </Link>
          <Link to="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">{cartCount}</span>
            )}
          </Link>
          {token ? (
            <>
            {isAdmin && (
              <Link to="/admin" className="ml-1 hidden h-9 items-center gap-1.5 rounded-full border border-primary/60 bg-primary/10 px-4 text-xs text-foreground transition hover:bg-primary/20 lg:flex">
                Admin
              </Link>
            )}
            <button
              onClick={() => logout()}
              className="ml-1 hidden h-9 items-center gap-1.5 rounded-full border border-border/70 bg-background/40 px-4 text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground lg:flex"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
            </>
          ) : (
            <Link to="/login" className="ml-1 hidden lg:block">
              <Button size="sm" className="h-9 rounded-full bg-gradient-primary px-5 text-primary-foreground shadow-glow hover:opacity-95">
                <User className="h-4 w-4" /> Sign in
              </Button>
            </Link>
          )}
          <button onClick={() => setMobile((v) => !v)} className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-foreground lg:hidden">
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobile && (
        <div className="glass-strong border-t border-border/40 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className={cn("rounded-lg px-3 py-2.5 text-sm transition-colors", pathname === l.to ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-primary/10 hover:text-foreground")}>
                {l.label}
              </Link>
            ))}
            {token ? (
              <Button onClick={() => logout()} variant="outline" className="mt-2 w-full rounded-full border-border">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            ) : (
              <Link to="/login" className="mt-2">
                <Button className="w-full rounded-full bg-gradient-primary shadow-glow">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
