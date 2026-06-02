import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/api/coupons";
import type { Coupon } from "@/lib/api/types";
import { apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/coupons")({ component: CouponsAdmin });

function CouponsAdmin() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ["admin", "coupons"], queryFn: listCoupons });
  const del = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "coupons"] }); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <PageHeader title="Coupons" action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-1 h-4 w-4" /> New</Button>} />
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Expires</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-border/60">
            {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No coupons.</td></tr>}
            {items.map((c) => (
              <tr key={c._id} className="hover:bg-muted/20">
                <td className="p-3 font-mono text-foreground">{c.code}</td>
                <td className="p-3">{c.discount}%</td>
                <td className="p-3 text-muted-foreground">{new Date(c.expires).toLocaleDateString()}</td>
                <td className="p-3"><div className="flex justify-end gap-2"><Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(c._id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <CouponDialog open={open} onOpenChange={setOpen} coupon={editing} onSaved={() => qc.invalidateQueries({ queryKey: ["admin", "coupons"] })} />
    </div>
  );
}

function CouponDialog({ open, onOpenChange, coupon, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; coupon: Coupon | null; onSaved: () => void }) {
  const [code, setCode] = useState(coupon?.code ?? "");
  const [discount, setDiscount] = useState<number>(coupon?.discount ?? 10);
  const [expires, setExpires] = useState<string>(coupon?.expires ? coupon.expires.slice(0, 10) : "");
  const save = useMutation({
    mutationFn: async () => coupon
      ? updateCoupon(coupon._id, { code, discount, expires })
      : createCoupon({ code, discount, expires }),
    onSuccess: () => { toast.success(coupon ? "Updated" : "Created"); onSaved(); onOpenChange(false); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  return (
    <Dialog open={open} onOpenChange={(v) => { if (v) { setCode(coupon?.code ?? ""); setDiscount(coupon?.discount ?? 10); setExpires(coupon?.expires ? coupon.expires.slice(0,10) : ""); } onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{coupon ? "Edit coupon" : "New coupon"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4">
          <div className="grid gap-2"><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required /></div>
          <div className="grid gap-2"><Label>Discount (%)</Label><Input type="number" min={1} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} required /></div>
          <div className="grid gap-2"><Label>Expires</Label><Input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} required /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}