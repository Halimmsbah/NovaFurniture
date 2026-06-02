import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/nova/AuthShell";
import { Field } from "@/components/nova/Field";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { signup } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Nova" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", rePassword: "", phone: "" });

  const m = useMutation({
    mutationFn: async () => {
      await signup(form);
    },
    onSuccess: () => {
      toast.success("Verification code sent to your email");
      navigate({ to: "/verify-email", search: { email: form.email } });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not create account")),
  });

  const formatPhone = (value: string) => {
    // Normalize: keep digits and leading +, then group for readability
    const plus = value.trim().startsWith("+") ? "+" : "";
    const digits = value.replace(/[^0-9]/g, "");
    // simple grouping: 4-3-4 for local style when length matches
    if (digits.length <= 4) return plus + digits;
    if (digits.length <= 7) return plus + digits.slice(0, 4) + " " + digits.slice(4);
    if (digits.length <= 11) return plus + digits.slice(0, 4) + " " + digits.slice(4, 7) + " " + digits.slice(7);
    return plus + digits;
  };

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }));

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Nova and get 10% off your first order"
      footer={<>Already a member? <Link to="/login" className="text-foreground underline-offset-4 hover:underline">Sign in</Link></>}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // client-side phone validation (optional)
          if (form.phone && !/^\+?[0-9]{7,15}$/.test(form.phone.replace(/\s+/g, ""))) {
            toast.error("Phone number is invalid");
            return;
          }
          m.mutate();
        }}
        className="space-y-4"
      >
        <Field label="Full name" required value={form.name} onChange={update("name")} placeholder="Ahmed Mohamed" />
        <Field label="Email" type="email" required value={form.email} onChange={update("email")} placeholder="you@email.com" />
        <Field label="Phone" type="tel" value={form.phone} onChange={update("phone")} placeholder="0100 000 0000" />
        <Field label="Password" type="password" required minLength={6} value={form.password} onChange={update("password")} placeholder="At least 6 characters" />
        <Field label="Confirm password" type="password" required minLength={6} value={form.rePassword} onChange={update("rePassword")} placeholder="Repeat password" />
        <Button type="submit" disabled={m.isPending} className="h-12 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
          {m.isPending ? "Creating…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
