import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listBrands, createBrand, updateBrand, deleteBrand } from "@/lib/api/brands";
import type { Brand } from "@/lib/api/types";
import { apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/brands")({ component: BrandsAdmin });

function BrandsAdmin() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ["admin", "brands"], queryFn: listBrands });
  const del = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "brands"] }); qc.invalidateQueries({ queryKey: ["brands"] }); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  const [editing, setEditing] = useState<Brand | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <PageHeader title="Brands" action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-1 h-4 w-4" /> New</Button>} />
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Logo</th><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-border/60">
            {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No brands.</td></tr>}
            {items.map((b) => (
              <tr key={b._id} className="hover:bg-muted/20">
                <td className="p-3">{b.logo ? <img src={b.logo} alt={b.name} className="h-10 w-10 rounded object-contain" /> : <div className="h-10 w-10 rounded bg-muted" />}</td>
                <td className="p-3 font-medium text-foreground">{b.name}</td>
                <td className="p-3 text-muted-foreground">{b.slug}</td>
                <td className="p-3"><div className="flex justify-end gap-2"><Button size="icon" variant="ghost" onClick={() => { setEditing(b); setOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(b._id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <BrandDialog open={open} onOpenChange={setOpen} brand={editing} onSaved={() => { qc.invalidateQueries({ queryKey: ["admin", "brands"] }); qc.invalidateQueries({ queryKey: ["brands"] }); }} />
    </div>
  );
}

function BrandDialog({ open, onOpenChange, brand, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; brand: Brand | null; onSaved: () => void }) {
  const save = useMutation({
    mutationFn: async (form: FormData) => brand ? updateBrand(brand._id, form) : createBrand(form),
    onSuccess: () => { toast.success(brand ? "Updated" : "Created"); onSaved(); onOpenChange(false); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    for (const [k, v] of Array.from(form.entries())) if (v instanceof File && v.size === 0) form.delete(k);
    save.mutate(form);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{brand ? "Edit brand" : "New brand"}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2"><Label>Name</Label><Input name="name" defaultValue={brand?.name} required /></div>
          <div className="grid gap-2"><Label>Logo</Label><Input name="logo" type="file" accept="image/*" /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}