import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, UserPlus, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { COMPANY } from "@/data/site";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => !v || /^[+\d\s\-().]{5,30}$/.test(v), "Enter a valid phone number")
    .optional()
    .default(""),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

export const Route = createFileRoute("/_public/register")({
  head: () => ({
    meta: [
      { title: "Create Account — Stone India Heritage" },
      {
        name: "description",
        content: "Create a Stone India Heritage account to request quotes, track orders, and access technical resources.",
      },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterData, boolean>>>({});
  const [serverError, setServerError] = useState("");

  const validateField = (name: keyof RegisterData, value: string) => {
    const form = new FormData(document.getElementById("register-form") as HTMLFormElement);
    const data = Object.fromEntries(form);
    const result = registerSchema.safeParse({ ...data, [name]: value });
    if (!result.success) {
      const fieldError = result.error.issues.find((i) => i.path[0] === name);
      setErrors((prev) => ({ ...prev, [name]: fieldError?.message }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    // Also clear confirmPassword error if passwords now match
    if (name === "password" || name === "confirmPassword") {
      const recheck = registerSchema.safeParse({ ...data, [name]: value });
      if (recheck.success) {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    }
    return true;
  };

  const handleBlur = (name: keyof RegisterData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const input = document.getElementsByName(name)[0] as HTMLInputElement;
    if (input) validateField(name, input.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form);

    setTouched({ name: true, email: true, password: true, confirmPassword: true, phone: true });
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof RegisterData, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof RegisterData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      await register(parsed.data.name, parsed.data.email, parsed.data.password, parsed.data.phone);
      toast.success("Account created!", {
        description: "Welcome to Stone India Heritage. Check your email for verification.",
      });
      navigate({ to: "/" });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
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
              <h1 className="mt-4 font-serif text-2xl text-foreground">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Join {COMPANY.name} as a professional partner
              </p>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}

            <form id="register-form" onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground">Full name *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Jane Architect"
                  onBlur={() => handleBlur("name")}
                  onChange={() => {
                    const v = (document.getElementsByName("name")[0] as HTMLInputElement).value;
                    if (touched.name) validateField("name", v);
                  }}
                  className={`mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 ${
                    touched.name && errors.name
                      ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                      : "border-border/60 focus:border-gold focus:ring-gold/30"
                  }`}
                  aria-invalid={!!(touched.name && errors.name)}
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Email *</label>
                <input
                  name="email"
                  type="email"
                  placeholder="jane@studio.com"
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
                <label className="text-sm font-medium text-foreground">Phone (optional)</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+91 98290 00000"
                  onBlur={() => handleBlur("phone")}
                  onChange={() => {
                    const v = (document.getElementsByName("phone")[0] as HTMLInputElement).value;
                    if (touched.phone) validateField("phone", v);
                  }}
                  className="mt-1.5 w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Password *</label>
                <div className="relative mt-1.5">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    onBlur={() => handleBlur("password")}
                    onChange={() => {
                      const v = (document.getElementsByName("password")[0] as HTMLInputElement).value;
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
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Confirm password *</label>
                <div className="relative mt-1.5">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    onBlur={() => handleBlur("confirmPassword")}
                    onChange={() => {
                      const v = (document.getElementsByName("confirmPassword")[0] as HTMLInputElement).value;
                      if (touched.confirmPassword) validateField("confirmPassword", v);
                    }}
                    className={`w-full rounded-lg border bg-background px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:ring-1 ${
                      touched.confirmPassword && errors.confirmPassword
                        ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                        : "border-border/60 focus:border-gold focus:ring-gold/30"
                    }`}
                    aria-invalid={!!(touched.confirmPassword && errors.confirmPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full group" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-gold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
