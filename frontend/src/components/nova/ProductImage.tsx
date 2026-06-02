import { cn } from "@/lib/utils";
import { productImage } from "@/lib/format";
import type { Product } from "@/lib/api/types";
import { ImageOff } from "lucide-react";

type Props = {
  product: Pick<Product, "title" | "imgCover" | "images"> | null | undefined;
  src?: string | null;
  className?: string;
  rounded?: string;
};

export function ProductImage({ product, className, rounded = "rounded-2xl", src }: Props) {
  const defaultSrc = product ? productImage(product) : undefined;
  const finalSrc = src ?? defaultSrc;
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-card/60 via-background to-background",
        rounded,
        className,
      )}
      aria-label={product?.title}
    >
      {finalSrc ? (
        <img
          src={finalSrc}
          alt={product?.title ?? ""}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-4"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60">
          <ImageOff className="h-8 w-8" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background/40" />
    </div>
  );
}
