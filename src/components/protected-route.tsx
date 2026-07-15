import { type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth, type User } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: ReactNode;
  /** Required roles — user must have one of these to access */
  roles?: User["role"][];
  /** Where to redirect if not authenticated */
  redirectTo?: string;
};

/**
 * Role-based route guard.
 * - If loading: shows spinner
 * - If not authenticated: redirects to /login
 * - If roles specified and user's role isn't in the list: redirects to /
 * - Otherwise: renders children
 */
export function ProtectedRoute({ children, roles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} search={{ redirect: window.location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  
  return <>{children}</>;
}
