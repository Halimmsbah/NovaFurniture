import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Field = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string }>(
  ({ label, className, ...props }, ref) => (
    <label className="block">
      {label && <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>}
      <input ref={ref} {...props} className={cn(
        "w-full rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/25",
        className
      )} />
    </label>
  )
);
Field.displayName = "Field";
