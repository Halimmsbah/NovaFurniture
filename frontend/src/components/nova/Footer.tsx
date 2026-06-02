import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const cols = [
  { title: "Shop", links: [["/shop","All Products"],["/categories","Categories"],["/shop","Best Sellers"],["/offers","New Arrivals"]] as const },
  { title: "Company", links: [["/about","About Us"],["/contact","Contact Us"],["/about","Our Stores"],["/about","Careers"]] as const },
  { title: "Help", links: [["/contact","FAQs"],["/contact","Shipping"],["/contact","Returns"],["/contact","Warranty"]] as const },
];

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/40 bg-background">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-5 lg:px-10">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Premium furniture for modern homes. Quality, style and comfort you can trust — crafted with intention, delivered across Egypt.
          </p>
          <div className="mt-6 flex gap-2">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"><Icon className="h-4 w-4" /></a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-4 text-sm font-medium text-foreground">{c.title}</h4>
            <ul className="space-y-3">
              {c.links.map(([to, label]) => (
                <li key={label}><Link to={to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-muted-foreground md:flex-row lg:px-10">
          <p>© {new Date().getFullYear()} Nova Furniture. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-foreground">Privacy Policy</Link>
            <Link to="/about" className="hover:text-foreground">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
