import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  getStats,
  getRecentOrders,
  getTopProducts,
  getLowStock,
} from "@/lib/api/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEGP } from "@/lib/format";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Tag,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: typeof Package }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { data: stats } = useQuery({ queryKey: ["admin", "stats"], queryFn: getStats });
  const { data: recent = [] } = useQuery({ queryKey: ["admin", "recent-orders"], queryFn: () => getRecentOrders(5) });
  const { data: top = [] } = useQuery({ queryKey: ["admin", "top"], queryFn: () => getTopProducts(5) });
  const { data: lowStock = [] } = useQuery({ queryKey: ["admin", "low-stock"], queryFn: () => getLowStock(5) });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl text-foreground">Dashboard</h2>
              <p className="text-sm text-muted-foreground">Overview of your store.</p>
            </div>
            <div className="ml-4">
              <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm text-primary-foreground shadow-glow hover:opacity-95">View Store</Link>
            </div>
          </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenue" value={formatEGP(stats?.totalRevenue ?? 0)} icon={DollarSign} />
        <StatCard title="Orders" value={String(stats?.totalOrders ?? 0)} icon={ShoppingCart} />
        <StatCard title="Products" value={String(stats?.totalProducts ?? 0)} icon={Package} />
        <StatCard title="Users" value={String(stats?.totalUsers ?? 0)} icon={Users} />
        <StatCard title="Pending" value={String(stats?.pendingOrders ?? 0)} icon={Clock} />
        <StatCard title="Delivered" value={String(stats?.deliveredOrders ?? 0)} icon={CheckCircle2} />
        <StatCard title="Paid" value={String(stats?.paidOrders ?? 0)} icon={DollarSign} />
        <StatCard title="Categories" value={String(stats?.totalCategories ?? 0)} icon={Tag} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent orders</span>
              <Link to="/admin/orders" className="text-xs text-primary hover:underline">View all</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
            {recent.map((o) => (
              <div key={o._id} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">#{o._id.slice(-6)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-foreground">{formatEGP(o.totalOrderPrice)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top selling products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {top.length === 0 && <p className="text-sm text-muted-foreground">No data.</p>}
            {top.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <p className="truncate text-sm text-foreground">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.sold ?? 0} sold</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Low stock alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length === 0 && <p className="text-sm text-muted-foreground">All products are well stocked.</p>}
            {lowStock.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <p className="truncate text-sm text-foreground">{p.title}</p>
                <p className="text-xs text-amber-500">{p.quantity} left</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}