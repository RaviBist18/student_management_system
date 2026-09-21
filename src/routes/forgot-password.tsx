import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendResetLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="dark">
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
        <Toaster richColors position="top-right" />
        <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-violet/20 blur-3xl" />
        <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="brand-mark">
              <GraduationCap />
            </div>
            <span className="text-lg font-bold">Ambition Technical Institute</span>
          </div>
          {sent ? (
            <>
              <div className="eyebrow">Check your email</div>
              <h1 className="mt-2 text-2xl font-bold">Reset link sent</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a password reset link to {email}. Click it to set a new password.
              </p>
            </>
          ) : (
            <>
              <div className="eyebrow">Reset password</div>
              <h1 className="mt-2 text-2xl font-bold">Enter your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We'll send you a link to reset your password.
              </p>
              <form className="mt-6 grid gap-4" onSubmit={sendResetLink}>
                <label className="form-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                    placeholder="Enter your email"
                  />
                </label>
                <Button type="submit" className="h-11" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
