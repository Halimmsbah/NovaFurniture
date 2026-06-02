import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listReviews, deleteReview } from "@/lib/api/reviews";
import { apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { Trash2, Star } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsAdmin });

function ReviewsAdmin() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ["admin", "reviews"], queryFn: () => listReviews() });
  const del = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "reviews"] }); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  return (
    <div>
      <PageHeader title="Reviews" description="Moderate product reviews." />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">User</th><th className="p-3">Rating</th><th className="p-3">Text</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && items.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No reviews.</td></tr>}
              {items.map((r) => {
                const userName = typeof r.user === "string" ? r.user : r.user?.name;
                return (
                  <tr key={r._id} className="hover:bg-muted/20">
                    <td className="p-3 text-foreground">{userName ?? "—"}</td>
                    <td className="p-3"><div className="flex items-center gap-1 text-amber-500"><Star className="h-3 w-3 fill-current" />{r.rate}</div></td>
                    <td className="p-3 text-muted-foreground">{r.text}</td>
                    <td className="p-3 text-right"><Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(r._id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}