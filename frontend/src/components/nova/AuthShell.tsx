import { Logo } from "./Logo";
import { Link } from "@tanstack/react-router";
import bg from "@/assets/background.png";

export function AuthShell({ children, title, subtitle, footer }: {
  children: React.ReactNode; title: string; subtitle?: string; footer?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-hero-glow" />
      <img src={bg} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <Link to="/" className="mb-10 inline-flex"><Logo /></Link>
        <div className="glass-strong rounded-3xl p-8 shadow-elegant">
          <h1 className="font-display text-3xl font-light text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
