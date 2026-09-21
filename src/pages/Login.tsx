import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
  }

  return (
    <div className="dark">
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
        <Toaster richColors position="top-right" />
        <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-violet/20 blur-3xl" />
        <div className="relative grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-xl lg:grid-cols-2">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-primary to-violet p-10 text-primary-foreground lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-white/15">
                <GraduationCap />
              </div>
              <span className="text-lg font-bold">Ambition Technical Institute</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold leading-tight">
                Student records &amp; performance,
                <br />
                presentation-ready.
              </h2>
              <p className="mt-4 max-w-sm text-sm text-primary-foreground/80">
                Manage enrollments, track weekly and term performance, and generate clean report
                cards for parent-teacher meetings.
              </p>
            </div>
            <p className="text-xs text-primary-foreground/60">
              Restricted access · Institute operators only
            </p>
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="brand-mark">
                <GraduationCap />
              </div>
              <span className="text-lg font-bold">Ambition Technical Institute</span>
            </div>
            <div className="eyebrow">Operator access</div>
            <h1 className="mt-2 text-2xl font-bold">Sign in to your dashboard</h1>

            <Button onClick={signInGoogle} variant="outline" className="mt-6 h-11">
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form className="grid gap-4" onSubmit={signInPassword}>
              <label className="form-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="Enter your email"
                  required
                />
              </label>
              <label className="form-field">
                <span>Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="mt-1 h-11" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Need access? Contact your system administrator.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
