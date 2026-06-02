import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listUsers, updateUser, deleteUser } from "@/lib/api/users";
import { apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { Trash2, ShieldCheck, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/admin/users")({ component: UsersAdmin });

function UsersAdmin() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ["admin", "users"], queryFn: listUsers });
  const del = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  const upd = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "user" | "admin" }) => updateUser(id, { role }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  return (
    <div>
      <PageHeader title="Users" description="Manage accounts and roles." />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && items.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No users.</td></tr>}
              {items.map((u) => (
                <tr key={u._id} className="hover:bg-muted/20">
                  <td className="p-3 font-medium text-foreground">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3"><Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role ?? "user"}</Badge></td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      {u.role === "admin" ? (
                        <Button size="sm" variant="ghost" onClick={() => upd.mutate({ id: u._id, role: "user" })}>
                          <ShieldOff className="mr-1 h-4 w-4" /> Demote
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => upd.mutate({ id: u._id, role: "admin" })}>
                          <ShieldCheck className="mr-1 h-4 w-4" /> Promote
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete user?")) del.mutate(u._id); }}>
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
    </div>
  );
}