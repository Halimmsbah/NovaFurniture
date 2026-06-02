import { cn } from "@/lib/utils";
import { CinematicHeading } from "./CinematicHeading";

export function Section({ children, className, eyebrow, title, action }: {
  children: React.ReactNode; className?: string;
  eyebrow?: string; title?: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <section className={cn("mx-auto w-full max-w-7xl px-6 py-16 lg:px-10 lg:py-24", className)}>
      {(eyebrow || title || action) && (
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            {eyebrow && <p className="mb-2 text-xs uppercase tracking-[0.32em] text-primary/80">{eyebrow}</p>}
            {title && (
              typeof title === "string" ? (
                <CinematicHeading
                  text={title}
                  className="font-display text-3xl font-light leading-tight text-foreground md:text-4xl lg:text-[44px]"
                />
              ) : (
                <h2 className="font-display text-3xl font-light leading-tight text-foreground md:text-4xl lg:text-[44px]">{title}</h2>
              )
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
