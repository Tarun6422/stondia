import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect, type ClipboardEvent, type KeyboardEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { api, ApiError } from "@/lib/api";

// ── Validation schemas ──
const emailSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit code"),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Step = "email" | "otp" | "password" | "success";

export const Route = createFileRoute("/_public/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Stone India Heritage" },
      {
        name: "description",
        content: "Reset your Stone India Heritage account password using a secure verification code.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

/* ── 6-digit OTP Input ── */
function OtpInput({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(6 - value.length).fill("")) as string[];

  const handleChange = (index: number, char: string) => {
    if (!/^\d$/.test(char) && char !== "") return;
    const newDigits = [...digits];
    newDigits[index] = char;
    const newOtp = newDigits.join("");
    onChange(newOtp);
    // Auto-advance to next input
    if (char !== "" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (pasted.length === 6) {
        onChange(pasted);
        inputsRef.current[5]?.focus();
      }
    },
    [onChange],
  );

  return (
    <div>
      <div
        className="flex items-center justify-center gap-2 sm:gap-3"
        onPaste={handlePaste}
        role="group"
        aria-label="6-digit verification code"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${i + 1}`}
            className={`h-12 w-10 sm:h-14 sm:w-12 rounded-lg border text-center text-xl font-bold font-mono outline-none transition-all focus:ring-2 ${
              error
                ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                : "border-border/60 focus:border-gold focus:ring-gold/30"
            } ${disabled ? "opacity-50" : ""}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-center text-xs text-destructive flex items-center justify-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

/* ── Countdown Timer ── */
function CountdownTimer({ expiresAt, onExpire }: { expiresAt: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return;
    }
    const timer = setInterval(() => {
      const r = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire, remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
      <Clock className="h-3.5 w-3.5" />
      <span>
        Code expires in{" "}
        <strong className={remaining < 60 ? "text-destructive" : "text-foreground"}>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </strong>
      </span>
    </div>
  );
}

/* ── Step Indicators ── */
function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "otp", label: "Verify" },
    { key: "password", label: "Reset" },
  ];

  const getIndex = (step: Step) => steps.findIndex((s) => s.key === step);
  const currentIdx = getIndex(current);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all ${
              i < currentIdx
                ? "bg-gold text-[var(--gold-foreground)]"
                : i === currentIdx
                  ? "border-2 border-gold text-gold"
                  : "border border-border/60 text-muted-foreground"
            }`}
          >
            {i < currentIdx ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span
            className={`hidden sm:inline text-xs ${
              i === currentIdx ? "font-medium text-foreground" : "text-muted-foreground"
            }`}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`h-px w-6 ${i < currentIdx ? "bg-gold" : "bg-border/60"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ── */
function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  // Password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<string, string>>>({});
  const [passwordTouched, setPasswordTouched] = useState<Partial<Record<string, boolean>>>({});

  // ── Step 1: Send OTP ──
  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);

    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/send-reset-otp", { email: parsed.data.email });
      setStep("otp");
      setOtp("");
      setOtpExpired(false);
      setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
      startResendCooldown();
      toast.success("Verification code sent", {
        description: "Check your email for the 6-digit code.",
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend cooldown ──
  const cooldownRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startResendCooldown = () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          cooldownRef.current = undefined;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await api.post("/api/auth/send-reset-otp", { email });
      setOtp("");
      setOtpExpired(false);
      setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
      startResendCooldown();
      toast.success("New code sent", { description: "Check your email." });
    } catch {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpExpired = useCallback(() => {
    setOtpExpired(true);
  }, []);

  // ── Step 2: Verify OTP ──
  const handleVerifyOTP = async () => {
    const parsed = otpSchema.safeParse({ otp });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post<{ verified: boolean; message?: string }>("/api/auth/verify-reset-otp", {
        email,
        otp: parsed.data.otp,
      });

      if (res.verified) {
        setStep("password");
        toast.success("Code verified", { description: "Now set your new password." });
      } else {
        setError(res.message || "Invalid code. Please try again.");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit OTP when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && !loading && !error) {
      handleVerifyOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // ── Step 3: Reset Password ──
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    setPasswordTouched({ password: true, confirmPassword: true });
    const parsed = passwordSchema.safeParse({ password, confirmPassword });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setPasswordErrors(fieldErrors);
      return;
    }

    setPasswordErrors({});
    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/reset-password", {
        email,
        otp,
        password: parsed.data.password,
      });
      setStep("success");
      toast.success("Password reset successfully!", {
        description: "You can now sign in with your new password.",
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──
  return (
    <section className="flex min-h-screen items-center justify-center px-4 pt-28 pb-20">
      <div className="w-full max-w-md">
        <Reveal>
          <div className="rounded-xl border border-border/60 bg-card p-8 shadow-soft sm:p-10">
            {/* Brand header */}
            <div className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-sm bg-gold text-[var(--gold-foreground)] font-serif text-xl">
                SH
              </span>
              <h1 className="mt-4 font-serif text-2xl text-foreground">Reset your password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {step === "email" && "Enter your email to receive a verification code."}
                {step === "otp" && `Enter the 6-digit code sent to ${email}`}
                {step === "password" && "Create a new password for your account."}
                {step === "success" && "Your password has been updated."}
              </p>
            </div>

            {/* Step indicator */}
            {step !== "success" && <div className="mt-6"><StepIndicator current={step} /></div>}

            {/* ────────────── Error Banner ────────────── */}
            {error && (
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            {/* ══════════════ Step 1: Email ══════════════ */}
            {step === "email" && (
              <form onSubmit={handleSendOTP} noValidate className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="jane@studio.com"
                    autoFocus
                    className={`mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 ${
                      touched && error
                        ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                        : "border-border/60 focus:border-gold focus:ring-gold/30"
                    }`}
                  />
                </div>

                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Mail className="h-4 w-4" /> Send Verification Code</>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/login" className="font-medium text-gold hover:underline">
                    Sign in
                  </Link>
                </div>
              </form>
            )}

            {/* ══════════════ Step 2: OTP ══════════════ */}
            {step === "otp" && (
              <div className="mt-6 space-y-5">
                <OtpInput
                  value={otp}
                  onChange={(val) => { setOtp(val); setError(""); }}
                  disabled={loading || otpExpired}
                  error={error}
                />

                {!otpExpired && otpExpiresAt > 0 && (
                  <CountdownTimer expiresAt={otpExpiresAt} onExpire={handleOtpExpired} />
                )}

                {otpExpired && (
                  <p className="text-center text-sm text-destructive flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Code expired. Request a new one.
                  </p>
                )}

                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={loading || otp.length !== 6}
                  onClick={handleVerifyOTP}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
                  ) : (
                    "Verify Code"
                  )}
                </Button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Change email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResend}
                    className="text-sm text-gold hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════ Step 3: New Password ══════════════ */}
            {step === "password" && (
              <form onSubmit={handleResetPassword} noValidate className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground">New password</label>
                  <div className="relative mt-1.5">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      onBlur={() => setPasswordTouched((p) => ({ ...p, password: true }))}
                      autoFocus
                      className={`w-full rounded-lg border bg-background px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:ring-1 ${
                        passwordTouched.password && passwordErrors.password
                          ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                          : "border-border/60 focus:border-gold focus:ring-gold/30"
                      }`}
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
                  {passwordTouched.password && passwordErrors.password && (
                    <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {passwordErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Confirm new password</label>
                  <div className="relative mt-1.5">
                    <input
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      onBlur={() => setPasswordTouched((p) => ({ ...p, confirmPassword: true }))}
                      className={`w-full rounded-lg border bg-background px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:ring-1 ${
                        passwordTouched.confirmPassword && passwordErrors.confirmPassword
                          ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                          : "border-border/60 focus:border-gold focus:ring-gold/30"
                      }`}
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
                  {passwordTouched.confirmPassword && passwordErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Resetting…</>
                  ) : (
                    <><Lock className="h-4 w-4" /> Reset Password</>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("otp")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to code verification
                  </button>
                </div>
              </form>
            )}

            {/* ══════════════ Step 4: Success ══════════════ */}
            {step === "success" && (
              <div className="mt-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="mt-4 font-serif text-xl text-foreground">Password reset successful</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your password has been updated. You can now sign in with your new password.
                </p>
                <Button asChild variant="gold" size="lg" className="mt-6">
                  <Link to="/login">Sign in with new password</Link>
                </Button>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
