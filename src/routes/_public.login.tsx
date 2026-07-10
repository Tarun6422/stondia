import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { COMPANY } from "@/data/site";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/_public/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Stone India Heritage" },
      {
        name: "description",
        content:
          "Sign in to your Stone India Heritage account to manage quotes, track orders, and download resources.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_public/login" }) as { redirect?: string; verified?: string };
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginData, boolean>>>({});
  const [serverError, setServerError] = useState("");

  // Show verification success message if redirected
  const verified = search.verified === "success";

  const validateField = (name: keyof LoginData, value: string) => {
    const result = loginSchema.safeParse({ [name]: value });
    if (!result.success) {
      const fieldError = result.error.issues.find((i) => i.path[0] === name);
      setErrors((prev) => ({ ...prev, [name]: fieldError?.message }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    return true;
  };

  const handleBlur = (name: keyof LoginData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const input = document.getElementsByName(name)[0] as HTMLInputElement;
    if (input) validateField(name, input.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    setTouched({ email: true, password: true });
    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof LoginData, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof LoginData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      const user = await login(email, password, rememberMe);
      toast.success("Welcome back!", { description: "You've been signed in successfully." });
      // Redirect based on role
      if (search.redirect) {
        navigate({ to: search.redirect });
      } else if (user.role === "ADMIN") {
        navigate({ to: "/admin" });
      } else if (user.role === "ARCHITECT" || user.role === "DEALER") {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/profile" });
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center px-4 pt-28 pb-20">
      <div className="w-full max-w-md">
        <Reveal>
          <div className="rounded-xl border border-border/60 bg-card p-8 shadow-soft sm:p-10">
            {/* Header */}
            <div className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-sm bg-gold text-[var(--gold-foreground)] font-serif text-xl">
                SH
              </span>
              <h1 className="mt-4 font-serif text-2xl text-foreground">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to your {COMPANY.name} account
              </p>
            </div>

            {/* Verification success banner */}
            {verified && (
              <div className="mt-5 rounded-lg bg-green-50 dark:bg-green-950/20 px-4 py-3 text-sm text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                Email verified successfully! You can now sign in.
              </div>
            )}

            {/* Server error */}
            {serverError && (
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@studio.com"
                  onBlur={() => handleBlur("email")}
                  onChange={() => {
                    const v = (document.getElementsByName("email")[0] as HTMLInputElement).value;
                    if (touched.email) validateField("email", v);
                  }}
                  className={`mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 ${
                    touched.email && errors.email
                      ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                      : "border-border/60 focus:border-gold focus:ring-gold/30"
                  }`}
                  aria-invalid={!!(touched.email && errors.email)}
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative mt-1.5">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    onBlur={() => handleBlur("password")}
                    onChange={() => {
                      const v = (document.getElementsByName("password")[0] as HTMLInputElement)
                        .value;
                      if (touched.password) validateField("password", v);
                    }}
                    className={`w-full rounded-lg border bg-background px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:ring-1 ${
                      touched.password && errors.password
                        ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                        : "border-border/60 focus:border-gold focus:ring-gold/30"
                    }`}
                    aria-invalid={!!(touched.password && errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.password}
                  </p>
                )}
                <div className="mt-1.5 text-right">
                  <Link to="/forgot-password" className="text-xs text-gold hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-[var(--gold)]"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-muted-foreground cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-gold hover:underline">
                Create one
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
