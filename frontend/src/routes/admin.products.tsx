import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { listProducts, createProduct, updateProduct, deleteProduct, reorderProducts } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import { listBrands } from "@/lib/api/brands";
import { listSubcategories } from "@/lib/api/subcategories";
import type { Product } from "@/lib/api/types";
import { apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatEGP } from "@/lib/format";
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => (await listProducts({ limit: 100, sort: "-order,createdAt" })).items,
  });
  const [itemsLocal, setItemsLocal] = useState<Product[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    setItemsLocal(items);
  }, [items]);
  const reorder = useMutation({
    mutationFn: async (ids: string[]) => {
      return await reorderProducts(ids);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Order updated");
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not update order")),
  });
  const del = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your catalog."
        action={
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="mr-1 h-4 w-4" /> New product
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                  <th className="p-3">Image</th>
                  <th className="p-3">Title</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Sold</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No products.</td></tr>
              )}
              {itemsLocal.map((p, idx) => (
                <tr key={p._id} className="hover:bg-muted/20" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
                  e.preventDefault();
                  const draggedId = e.dataTransfer.getData("text/plain");
                  if (!draggedId) return;
                  if (draggedId === p._id) return;
                  const fromIndex = itemsLocal.findIndex((it) => it._id === draggedId);
                  const toIndex = idx;
                  if (fromIndex === -1) return;
                  const newItems = [...itemsLocal];
                  const [moved] = newItems.splice(fromIndex, 1);
                  newItems.splice(toIndex, 0, moved);
                  setItemsLocal(newItems);
                  const ids = newItems.map((it) => it._id);
                  reorder.mutate(ids);
                }}>
                  <td className="p-3 w-24">
                    <div className="flex items-center gap-2">
                      <div className="drag-handle cursor-grab p-2" draggable onDragStart={(e) => { e.dataTransfer.setData("text/plain", p._id); setDraggingId(p._id); }}>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-background/50">
                      {p.imgCover ? <img src={p.imgCover} alt={p.title} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-card/40" />}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-medium text-foreground">{p.title}</td>
                  <td className="p-3">{formatEGP(p.price)}</td>
                  <td className="p-3">{p.quantity ?? 0}</td>
                  <td className="p-3">{p.sold ?? 0}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete this product?")) del.mutate(p._id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ProductDialog
        open={open}
        onOpenChange={setOpen}
        product={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["admin", "products"] })}
      />
    </div>
  );
}

function ProductDialog({
  open,
  onOpenChange,
  product,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product | null;
  onSaved: () => void;
}) {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: brands = [] } = useQuery({ queryKey: ["brands"], queryFn: listBrands });
  const { data: subs = [] } = useQuery({ queryKey: ["subcategories"], queryFn: () => listSubcategories() });

  const save = useMutation({
    mutationFn: async (form: FormData) =>
      product ? updateProduct(product._id, form) : createProduct(form),
    onSuccess: () => {
      toast.success(product ? "Updated" : "Created");
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    // Remove empty file inputs to avoid sending blank
    for (const [k, v] of Array.from(form.entries())) {
      if (v instanceof File && v.size === 0) form.delete(k);
      if (typeof v === "string" && v.trim() === "") form.delete(k);
    }
    save.mutate(form);
  };

  const catId = typeof product?.category === "string" ? product.category : product?.category?._id;
  const brandId = typeof product?.brand === "string" ? product.brand : product?.brand?._id;
  const subId = typeof product?.subcategory === "string" ? product.subcategory : product?.subcategory?._id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "New product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input name="title" defaultValue={product?.title} required />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea name="description" defaultValue={product?.description} rows={3} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Price</Label>
              <Input name="price" type="number" step="0.01" defaultValue={product?.price} required />
            </div>
            <div className="grid gap-2">
              <Label>Discounted price</Label>
              <Input name="priceAfterDiscount" type="number" step="0.01" defaultValue={product?.priceAfterDiscount} />
            </div>
            <div className="grid gap-2">
              <Label>Stock</Label>
              <Input name="quantity" type="number" defaultValue={product?.quantity} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select name="category" defaultValue={catId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Subcategory</Label>
              <Select name="subcategory" defaultValue={subId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {subs.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Brand</Label>
              <Select name="brand" defaultValue={brandId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Cover image</Label>
              <Input name="imgCover" type="file" accept="image/*" required />
            </div>
            <div className="grid gap-2">
              <Label>Gallery (max 10)</Label>
              <Input name="images" type="file" accept="image/*" multiple />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}