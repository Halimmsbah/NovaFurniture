import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/nova/AuthShell";
import { Field } from "@/components/nova/Field";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api";
import { resendVerificationCode, verifyEmail } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  head: () => ({ meta: [{ title: "Verify email â€” Nova" }] }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const login = useAuth((state) => state.login);
  const { email } = Route.useSearch();
  const [otp, setOtp] = useState("");

  const titleEmail = useMemo(() => email || "your email", [email]);

  const verifyMutation = useMutation({
    mutationFn: async () => verifyEmail({ email, otp }),
    onSuccess: (res) => {
      if (res.token) login(res.token, res.user ?? { email });
      toast.success("Email verified successfully");
      navigate({ to: "/" });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not verify email")),
  });

  const resendMutation = useMutation({
    mutationFn: async () => resendVerificationCode({ email }),
    onSuccess: () => toast.success("Verification code resent"),
    onError: (err) => toast.error(apiErrorMessage(err, "Could not resend code")),
  });

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${titleEmail}. Enter it below to activate your account.`}
      footer={
        <>
          Back to{" "}
          <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
            sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email) return;
          verifyMutation.mutate();
        }}
      >
        {!email && (
          <p className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-4 text-sm text-muted-foreground">
            Open this page from the registration flow so we know which email to verify.
          </p>
        )}
        <Field
          label="Email"
          type="email"
          required
          value={email}
          readOnly
          placeholder="you@email.com"
        />
        <Field
          label="Verification code"
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
        />
        <Button
          type="submit"
          disabled={!email || verifyMutation.isPending || otp.length !== 6}
          className="h-12 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
        >
          {verifyMutation.isPending ? "Verifyingâ€¦" : "Verify email"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-full"
          disabled={!email || resendMutation.isPending}
          onClick={() => resendMutation.mutate()}
        >
          {resendMutation.isPending ? "Sendingâ€¦" : "Resend code"}
        </Button>
      </form>
    </AuthShell>
  );
}
