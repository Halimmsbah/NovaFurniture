export function formatEGP(n: number | undefined | null): string {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return `EGP ${v.toLocaleString("en-EG")}`;
}

export function productImage(p?: { imgCover?: string; images?: string[] } | null): string | undefined {
  if (!p) return undefined;
  return p.imgCover || p.images?.[0];
}
