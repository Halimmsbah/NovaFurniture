import logo from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, size = 56 }: { className?: string; size?: number }) {
  return (
    <Link to="/" className={cn("group flex items-center", className)} aria-label="Nova">
      <div className="relative shrink-0 transition-transform duration-500 group-hover:scale-105" style={{ width: size, height: size }}>
        <div className="absolute inset-[-6px] rounded-full bg-primary/20 blur-xl opacity-60 group-hover:opacity-80 transition-opacity" aria-hidden />
        <img
          src={logo}
          alt="Nova"
          className="relative h-full w-full object-contain"
          style={{ filter: "drop-shadow(0 0 10px rgba(168,85,247,0.55)) drop-shadow(0 0 20px rgba(168,85,247,0.25))" }}
        />
      </div>
    </Link>
  );
}

