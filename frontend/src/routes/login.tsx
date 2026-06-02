import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/nova/AuthShell";
import { Field } from "@/components/nova/Field";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { signin } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth";
import { apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Nova" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const m = useMutation({
    mutationFn: signin,
    onSuccess: (data) => {
      if (!data.token) {
        toast.error(data.message || "Sign in failed");
        return;
      }
      login(data.token, data.user ?? { email });
      // Show role-specific toast and redirect. delay slightly so toast is visible.
      if (data.user?.role === "admin") {
        toast.success("Welcome back, admin — redirecting to dashboard");
        setTimeout(() => navigate({ to: "/admin/" }), 600);
      } else {
        toast.success("Welcome back");
        navigate({ to: "/" });
      }
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Invalid credentials")),
  });

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Nova account"
      footer={<>Don't have an account? <Link to="/register" className="text-foreground underline-offset-4 hover:underline">Sign up</Link></>}
    >
      <form
        onSubmit={(e) => { e.preventDefault(); m.mutate({ email, password }); }}
        className="space-y-4"
      >
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        <Field label="Password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <Button type="submit" disabled={m.isPending} className="h-12 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
          {m.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
