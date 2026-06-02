import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { listAllOrders, updateOrderDeliveryStatus } from "@/lib/api/orders";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductImage } from "@/components/nova/ProductImage";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatEGP } from "@/lib/format";
import { apiErrorMessage } from "@/lib/api";
import type { Order, Product } from "@/lib/api/types";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

function OrdersAdmin() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ["admin", "orders"], queryFn: listAllOrders });
  const [selected, setSelected] = useState<Order | null>(null);

  const updateStatus = useMutation({
    mutationFn: ({ orderId, isDelivered }: { orderId: string; isDelivered: boolean }) => updateOrderDeliveryStatus(orderId, isDelivered),
    onSuccess: (updated) => {
      toast.success("Order status updated");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      setSelected((current) => (current && updated && current._id === updated._id ? { ...current, ...updated } : current));
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not update order")),
  });

  const selectedItems = useMemo(() => selected?.orderItems ?? [], [selected]);

  return (
    <div>
      <PageHeader title="Orders" description="All customer orders." />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Total</th>
                <th className="p-3">Items</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No orders.</td></tr>}
              {items.map((o) => (
                <tr key={o._id} className="cursor-pointer hover:bg-muted/20" onClick={() => setSelected(o)}>
                  <td className="p-3 font-mono text-foreground">#{o._id.slice(-6)}</td>
                  <td className="p-3">{formatEGP(o.totalOrderPrice)}</td>
                  <td className="p-3">{o.orderItems.length}</td>
                  <td className="p-3 capitalize"><Badge variant={o.isPaid ? "default" : "secondary"}>{o.paymentType} {o.isPaid ? "paid" : "unpaid"}</Badge></td>
                  <td className="p-3"><Badge variant={o.isDelivered ? "default" : "outline"}>{o.isDelivered ? "Delivered" : "Pending"}</Badge></td>
                  <td className="p-3 text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order #{selected?._id.slice(-6)}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={selected.isDelivered ? "default" : "outline"}>{selected.isDelivered ? "Delivered" : "Pending"}</Badge>
                    <Badge variant={selected.isPaid ? "default" : "secondary"}>{selected.isPaid ? "Paid" : "Unpaid"}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      onClick={() => updateStatus.mutate({ orderId: selected._id, isDelivered: !selected.isDelivered })}
                      disabled={updateStatus.isPending}
                    >
                      Mark as {selected.isDelivered ? "Pending" : "Delivered"}
                    </Button>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
                  <p className="text-sm text-muted-foreground">Shipping address</p>
                  <p className="mt-2 text-foreground">{selected.shippingAddress.street}</p>
                  <p className="text-foreground">{selected.shippingAddress.city}</p>
                  <p className="text-foreground">{selected.shippingAddress.phone}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
                  <p className="text-sm text-muted-foreground">Items</p>
                  <div className="mt-3 space-y-3">
                    {selectedItems.map((item) => {
                      const product = (typeof item.product === "object" ? item.product : null) as Product | null;
                      return (
                        <div key={`${selected._id}-${product?._id ?? item.price}`} className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0"><ProductImage product={product} className="absolute inset-0" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-foreground">{product?.title ?? "Product"}</p>
                            <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                          </div>
                          <p className="text-sm text-foreground">{formatEGP(item.price * item.quantity)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
                <p className="text-sm text-muted-foreground">Summary</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Items</dt><dd>{selected.orderItems.length}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Total</dt><dd>{formatEGP(selected.totalOrderPrice)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd>{new Date(selected.createdAt).toLocaleString()}</dd></div>
                </dl>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}