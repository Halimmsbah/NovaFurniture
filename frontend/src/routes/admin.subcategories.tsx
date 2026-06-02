import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } from "@/lib/api/subcategories";
import { listCategories } from "@/lib/api/categories";
import type { Subcategory } from "@/lib/api/types";
import { apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/subcategories")({ component: SubcategoriesAdmin });

function SubcategoriesAdmin() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ["admin", "subcategories"], queryFn: () => listSubcategories() });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const del = useMutation({
    mutationFn: deleteSubcategory,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "subcategories"] }); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [open, setOpen] = useState(false);
  const catName = (id?: string) => categories.find((c) => c._id === id)?.name ?? "—";
  return (
    <div>
      <PageHeader title="Subcategories" action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-1 h-4 w-4" /> New</Button>} />
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Slug</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-border/60">
            {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No subcategories.</td></tr>}
            {items.map((s) => {
              const cid = typeof s.category === "string" ? s.category : s.category?._id;
              return (
                <tr key={s._id} className="hover:bg-muted/20">
                  <td className="p-3 font-medium text-foreground">{s.name}</td>
                  <td className="p-3 text-muted-foreground">{catName(cid)}</td>
                  <td className="p-3 text-muted-foreground">{s.slug}</td>
                  <td className="p-3"><div className="flex justify-end gap-2"><Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(s._id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <SubDialog open={open} onOpenChange={setOpen} sub={editing} onSaved={() => qc.invalidateQueries({ queryKey: ["admin", "subcategories"] })} />
    </div>
  );
}

function SubDialog({ open, onOpenChange, sub, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; sub: Subcategory | null; onSaved: () => void }) {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const [name, setName] = useState(sub?.name ?? "");
  const [category, setCategory] = useState<string>(typeof sub?.category === "string" ? sub.category : sub?.category?._id ?? "");
  const save = useMutation({
    mutationFn: async () => sub ? updateSubcategory(sub._id, { name, category }) : createSubcategory({ name, category }),
    onSuccess: () => { toast.success(sub ? "Updated" : "Created"); onSaved(); onOpenChange(false); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  return (
    <Dialog open={open} onOpenChange={(v) => { if (v) { setName(sub?.name ?? ""); setCategory(typeof sub?.category === "string" ? sub.category : sub?.category?._id ?? ""); } onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{sub ? "Edit subcategory" : "New subcategory"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4">
          <div className="grid gap-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="grid gap-2"><Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending || !name || !category}>{save.isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}