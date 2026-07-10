import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
    email: typeof search.email === "string" ? search.email : "",
  }),
  head: () => ({
    meta: [
      { title: "Reset Password — Stone India Heritage" },
      { name: "description", content: "Reset your Stone India Heritage account password." },
    ],
  }),
  component: ResetPasswordRedirect,
});

function ResetPasswordRedirect() {
  const { token, email } = Route.useSearch();

  // If there's a token, this is an old reset link — redirect to OTP flow
  return (
    <section className="flex min-h-screen items-center justify-center px-4 pt-28 pb-20">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-sm bg-gold text-[var(--gold-foreground)] font-serif text-xl">
          SH
        </span>
        <h1 className="mt-4 font-serif text-2xl text-foreground">Password reset link expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The old password reset links have been replaced with a new secure verification code
          system.
          {email ? (
            <>
              {" "}
              If you still need to reset your password for <strong>{email}</strong>, please request
              a new code below.
            </>
          ) : (
            <> Please request a new verification code to reset your password.</>
          )}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link to="/forgot-password">Request New Verification Code</Link>
          </Button>
          {!token && (
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Back to sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
