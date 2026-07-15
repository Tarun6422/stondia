import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Package,
  FileText,
  Download,
  User,
  ArrowUpRight,
  Mail,
  Phone,
  Building2,
  LogOut,
  Loader2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";

export const Route = createFileRoute("/_public/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — STONDIA" },
      { name: "description", content: "Your personal dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: "/dashboard" } });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center pt-28 pb-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </section>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";
  const isArchitect = user.role === "ARCHITECT";
  const roleLabel =
    user.role === "CUSTOMER"
      ? "Customer"
      : user.role === "ARCHITECT"
        ? "Architect"
        : user.role === "DEALER"
          ? "Dealer"
          : "Admin";

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <section className="min-h-screen bg-secondary/30 pt-28 pb-20">
      <div className="container-lux">
        <Reveal>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-gold/20 bg-muted">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-gold bg-gold/5">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="font-serif text-2xl text-foreground">
                    Welcome, {user.name.split(" ")[0]}
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    {roleLabel} Account
                    <span className="inline-block rounded-full bg-gold/10 px-2.5 py-0.5 text-[0.55rem] font-medium text-gold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/profile">
                  <Settings className="h-3.5 w-3.5" /> Profile
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </Button>
            </div>
          </div>

          {/* Quick links grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Profile */}
            <Link
              to="/profile"
              className="group rounded-xl border border-border/60 bg-card p-6 transition-all hover:shadow-elegant hover:border-gold/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <User className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-lg text-foreground">My Profile</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Edit your personal information, change password, and update avatar.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold group-hover:gap-1.5 transition-all">
                Manage <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>

            {/* My RFQs */}
            <Link
              to="/quote"
              className="group rounded-xl border border-border/60 bg-card p-6 transition-all hover:shadow-elegant hover:border-gold/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-lg text-foreground">Request a Quote</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Submit a new quote request or upload project documents.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold group-hover:gap-1.5 transition-all">
                New Request <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Products */}
            <Link
              to="/products"
              className="group rounded-xl border border-border/60 bg-card p-6 transition-all hover:shadow-elegant hover:border-gold/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-lg text-foreground">Browse Products</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore our catalog of premium sandstone and natural stone.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold group-hover:gap-1.5 transition-all">
                Catalog <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Downloads */}
            <Link
              to="/downloads"
              className="group rounded-xl border border-border/60 bg-card p-6 transition-all hover:shadow-elegant hover:border-gold/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-lg text-foreground">Resources</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Access brochures, technical specs, and installation guides.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold group-hover:gap-1.5 transition-all">
                Browse <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Contact */}
            <Link
              to="/contact"
              className="group rounded-xl border border-border/60 bg-card p-6 transition-all hover:shadow-elegant hover:border-gold/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-lg text-foreground">Contact Support</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get in touch with our export team for assistance.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold group-hover:gap-1.5 transition-all">
                Contact <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Admin link (admin only) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="group rounded-xl border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent p-6 transition-all hover:shadow-elegant"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-lg text-foreground">Admin Dashboard</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage products, projects, orders, and settings.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold group-hover:gap-1.5 transition-all">
                  Open Admin <ArrowUpRight className="h-3 w-3" />
                </span>
              </Link>
            )}


            {/* Architect-specific link */}
            {isArchitect && (
              <Link
                to="/catalog"
                className="group rounded-xl border border-border/60 bg-card p-6 transition-all hover:shadow-elegant hover:border-gold/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-lg text-foreground">Project Catalog</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse completed projects and specification sheets.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold group-hover:gap-1.5 transition-all">
                  View Projects <ArrowUpRight className="h-3 w-3" />
                </span>
              </Link>
            )}
          </div>

          {/* Account info */}
          <div className="mt-8 rounded-xl border border-border/60 bg-card p-6">
            <h3 className="font-serif text-lg text-foreground">Account Details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Name</p>
                <p className="mt-0.5 text-foreground">{user.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                <p className="mt-0.5 text-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Phone</p>
                <p className="mt-0.5 text-foreground">{user.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Role</p>
                <p className="mt-0.5 text-foreground capitalize">{roleLabel}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
