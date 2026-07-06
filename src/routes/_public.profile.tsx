import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2, User, Save, Lock, Camera, ArrowLeft, AlertCircle,
  Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { compressImage, uploadFile, validateUploadFile } from "@/lib/storage-utils";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().max(30).optional().default(""),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(100),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match", path: ["confirmPassword"],
});

export const Route = createFileRoute("/_public/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Stone India Heritage" },
      { name: "description", content: "Manage your profile, password, and avatar." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, updateUser } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login", search: { redirect: "/profile" } });
  }, [user, authLoading, navigate]);

  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [profileErrors, setProfileErrors] = useState<Partial<Record<string, string>>>({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState<Partial<Record<string, string>>>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Avatar
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(profileForm);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0]] = i.message; });
      setProfileErrors(errs);
      return;
    }
    setProfileErrors({});
    setProfileLoading(true);
    try {
      const updated = await api.put<{ id: string; name: string; email: string; phone?: string; role: string; avatar?: string }>("/api/auth/profile", parsed.data);
      updateUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(pwForm);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0]] = i.message; });
      setPwErrors(errs);
      return;
    }
    setPwErrors({});
    setPwLoading(true);
    try {
      await api.put("/api/auth/change-password", { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateUploadFile(file);
    if (validationError) { toast.error(validationError); return; }
    setAvatarUploading(true);
    setAvatarProgress(0);
    try {
      const blob = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.8 });
      const uploadFile_ = new File([blob], file.name, { type: blob.type || file.type });
      const result = await uploadFile(uploadFile_, { folder: "avatars", onProgress: (p) => setAvatarProgress(p) });
      const updated = await api.put<{ id: string; name: string; email: string; avatar?: string }>("/api/auth/profile", { avatar: result.url });
      updateUser(updated);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error("Avatar upload failed");
    } finally {
      setAvatarUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (authLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center pt-28 pb-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="min-h-screen pt-28 pb-20">
      <div className="container-lux max-w-2xl">
        <Reveal>
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <h1 className="font-serif text-3xl text-foreground">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account settings and security.</p>

          <div className="mt-8 space-y-8">
            {/* ── Avatar Section ── */}
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-gold/20 bg-muted">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gold bg-gold/5">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-[var(--gold-foreground)] shadow-md transition-all hover:brightness-110 disabled:opacity-50"
                    title="Change avatar"
                  >
                    {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                  </button>
                  <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-gold/10 px-3 py-0.5 text-[0.6rem] font-medium text-gold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
              {avatarUploading && (
                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${avatarProgress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Uploading… {avatarProgress}%</p>
                </div>
              )}
            </div>

            {/* ── Edit Profile ── */}
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <h2 className="font-serif text-lg text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-gold" /> Profile Information
              </h2>
              <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Full name</label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    className={`mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 ${
                      profileErrors.name ? "border-destructive" : "border-border/60 focus:border-gold focus:ring-gold/30"
                    }`}
                  />
                  {profileErrors.name && <p className="mt-1 text-xs text-destructive">{profileErrors.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input value={user.email} disabled className="mt-1.5 w-full rounded-lg border border-border/30 bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed" />
                  <p className="mt-1 text-[0.6rem] text-muted-foreground">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98290 00000"
                    className="mt-1.5 w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30"
                  />
                </div>
                <Button type="submit" variant="gold" disabled={profileLoading}>
                  {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </form>
            </div>

            {/* ── Change Password ── */}
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <h2 className="font-serif text-lg text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-gold" /> Change Password
              </h2>
              <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
                {["currentPassword", "newPassword", "confirmPassword"].map((field) => {
                  const label = field === "currentPassword" ? "Current password" : field === "newPassword" ? "New password" : "Confirm new password";
                  const placeholder = field === "currentPassword" ? "Enter current password" : "At least 8 characters";
                  const showKey = field === "currentPassword" ? "current" : field === "newPassword" ? "new" : "confirm";
                  return (
                    <div key={field}>
                      <label className="text-sm font-medium text-foreground">{label}</label>
                      <div className="relative mt-1.5">
                        <input
                          type={showPw[showKey] ? "text" : "password"}
                          value={(pwForm as any)[field]}
                          onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                          placeholder={placeholder}
                          className={`w-full rounded-lg border bg-background px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:ring-1 ${
                            pwErrors[field] ? "border-destructive" : "border-border/60 focus:border-gold focus:ring-gold/30"
                          }`}
                        />
                        <button type="button" onClick={() => setShowPw((p) => ({ ...p, [showKey]: !p[showKey] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPw[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {pwErrors[field] && <p className="mt-1 text-xs text-destructive">{pwErrors[field]}</p>}
                    </div>
                  );
                })}
                <Button type="submit" variant="gold" disabled={pwLoading}>
                  {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Update Password
                </Button>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
