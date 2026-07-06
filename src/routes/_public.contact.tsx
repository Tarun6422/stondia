import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  XCircle,
  AlertCircle,
  ChevronDown,
  type Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { SuccessCheck } from "@/components/animations";
import { PageHero } from "@/components/page-parts";
import { COMPANY } from "@/data/site";
import { api, ApiError } from "@/lib/api";
import factory from "@/assets/factory.jpg";

// ── Schema ──
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  company: z.string().trim().max(200, "Company name must be under 200 characters").optional().default(""),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .refine((v) => !v || /^[+\d\s\-().]{5,30}$/.test(v), "Enter a valid phone number (e.g. +91 98290 00000)")
    .optional()
    .default(""),
  country: z.string().trim().max(100).optional().default(""),
  projectType: z.string().trim().optional().default(""),
  _hp: z.string().optional().default(""),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2,000 characters"),
});

type ContactData = z.infer<typeof contactSchema>;

const PROJECT_TYPES = [
  "Architecture & Design",
  "Construction & Development",
  "Landscape Architecture",
  "Restoration & Heritage",
  "Interior Design",
  "Government & Infrastructure",
  "Hospitality & Resorts",
  "Residential",
  "Commercial",
  "Other",
];

const STORAGE_KEY = "stoneindia_contact_draft";

import { buildMeta, canonicalLink, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/_public/contact")({
  head: () => ({
    meta: buildMeta({
      title: "Contact — Stone India Heritage",
      description: "Get in touch with our global export team in Jodhpur, Dubai, and London for quotes, samples, and partnership enquiries. We respond within one business day.",
      path: "/contact",
    }),
    links: [canonicalLink("/contact")],
    scripts: [
      jsonLdScript(breadcrumbSchema([
        { name: "Home", item: "/" },
        { name: "Contact", item: "/contact" },
      ])),
    ],
  }),
  component: Contact,
});

const OFFICES = [
  { city: "Jodhpur, India", role: "Head Office & Factory", detail: COMPANY.address },
  { city: "Dubai, UAE", role: "Middle East Sales", detail: "Sheikh Zayed Road, Dubai" },
  { city: "London, UK", role: "Europe Liaison", detail: "Mayfair, London W1" },
];

function Contact() {
  const formRef = useRef<HTMLFormElement>(null);

  // ── Auto-save draft ──
  const saveDraft = useCallback((data: Partial<ContactData>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* ignore quota errors */ }
  }, []);

  // ── Load draft ──
  const loadDraft = useCallback((): Partial<ContactData> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }, []);

  const draft = useRef(loadDraft());

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactData, boolean>>>({});
  const [messageLen, setMessageLen] = useState(draft.current.message?.length ?? 0);

  // ── Validate on blur / change ──
  const validateField = (name: keyof ContactData, value: string) => {
    const result = contactSchema.safeParse({ ...Object.fromEntries(new FormData(formRef.current!)), [name]: value });
    if (!result.success) {
      const fieldError = result.error.issues.find((i) => i.path[0] === name);
      setErrors((prev) => ({ ...prev, [name]: fieldError?.message }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    return true;
  };

  const handleBlur = (name: keyof ContactData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const input = formRef.current?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (input) validateField(name, input.value);
  };

  const handleFocus = (_name: keyof ContactData) => {
    // focus tracking placeholder
  };

  const handleChange = (name: keyof ContactData) => {
    const input = formRef.current?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (input) {
      if (touched[name]) validateField(name, input.value);
      // Auto-save
      const formData = Object.fromEntries(new FormData(formRef.current!));
      saveDraft(formData as Partial<ContactData>);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = contactSchema.safeParse(data);

    // Mark all as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(contactSchema.shape).forEach((k) => { allTouched[k] = true; });
    setTouched(allTouched as Partial<Record<keyof ContactData, boolean>>);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ContactData, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof ContactData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await api.post("/api/contact", {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || undefined,
        company: parsed.data.company || undefined,
        message: parsed.data.message,
      });

      setSent(true);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Message sent!", {
        description: "Thank you. Our team will contact you shortly.",
      });
    } catch (err) {
      setError(true);
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again later.";
      toast.error(message, {
        description: "Please try again, or email us directly at exports@stoneindiaheritage.com.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSent(false);
    setError(false);
    setErrors({});
    setTouched({});
    formRef.current?.reset();
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk stone"
        intro="Our export team responds within one business day, wherever you are in the world."
        image={factory}
      />
      <section className="py-20">
        <div className="container-lux">
          {/* ── Success state ── */}
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="mx-auto max-w-lg rounded-xl border border-border/60 bg-card p-12 text-center shadow-soft"
              >
                <SuccessCheck />
                <h2 className="mt-5 font-serif text-3xl text-foreground">Message sent</h2>
                <p className="mt-3 text-muted-foreground">
                  Thank you. Our team will contact you shortly.
                </p>
                <Button variant="gold" className="mt-6" onClick={resetForm}>
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
                  {/* ── Contact info ── */}
                  <Reveal>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <ContactRow icon={Mail} label="Email" value={COMPANY.email} />
                        <ContactRow icon={Phone} label="Phone" value={COMPANY.phone} />
                        <ContactRow icon={MapPin} label="Head Office" value={COMPANY.address} />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {OFFICES.map((o) => (
                          <div key={o.city} className="rounded-lg border border-border/60 bg-card p-5 transition-all hover:shadow-soft">
                            <p className="font-serif text-lg text-foreground">{o.city}</p>
                            <p className="mt-1 text-xs uppercase tracking-wide text-gold">{o.role}</p>
                            <p className="mt-2 text-sm text-muted-foreground">{o.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>

                  {/* ── Form ── */}
                  <Reveal delay={0.1}>
                    <form
                      ref={formRef}
                      onSubmit={handleSubmit}
                      className="rounded-xl border border-border/60 bg-card p-8 shadow-soft"
                      noValidate
                    >
                      {/* Honeypot — hidden from users, traps bots */}
                      <div className="absolute left-[-9999px]" aria-hidden="true">
                        <input name="_hp" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                      </div>
                      <h2 className="font-serif text-2xl text-foreground">Send us a message</h2>
                      {error && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                          <XCircle className="h-4 w-4 shrink-0" />
                          Something went wrong. Please try again later.
                        </div>
                      )}

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <FormField
                          name="name"
                          label="Full name *"
                          placeholder="Jane Architect"
                          error={touched.name ? errors.name : undefined}
                          onBlur={() => handleBlur("name")}
                          onFocus={() => handleFocus("name")}
                          onChange={() => handleChange("name")}
                          defaultValue={draft.current.name}
                        />
                        <FormField
                          name="company"
                          label="Company"
                          placeholder="Studio Name"
                          error={touched.company ? errors.company : undefined}
                          onBlur={() => handleBlur("company")}
                          onFocus={() => handleFocus("company")}
                          onChange={() => handleChange("company")}
                          defaultValue={draft.current.company}
                        />
                        <FormField
                          name="email"
                          label="Email *"
                          type="email"
                          placeholder="jane@studio.com"
                          error={touched.email ? errors.email : undefined}
                          onBlur={() => handleBlur("email")}
                          onFocus={() => handleFocus("email")}
                          onChange={() => handleChange("email")}
                          defaultValue={draft.current.email}
                        />
                        <FormField
                          name="phone"
                          label="Phone"
                          type="tel"
                          placeholder="+91 98290 00000"
                          error={touched.phone ? errors.phone : undefined}
                          onBlur={() => handleBlur("phone")}
                          onFocus={() => handleFocus("phone")}
                          onChange={() => handleChange("phone")}
                          defaultValue={draft.current.phone}
                        />
                        <FormField
                          name="country"
                          label="Country"
                          placeholder="United Kingdom"
                          error={touched.country ? errors.country : undefined}
                          onBlur={() => handleBlur("country")}
                          onFocus={() => handleFocus("country")}
                          onChange={() => handleChange("country")}
                          defaultValue={draft.current.country}
                        />
                        <div>
                          <label className="text-sm font-medium text-foreground">
                            Project Type
                          </label>
                          <div className="relative mt-1.5">
                            <select
                              name="projectType"
                              defaultValue={draft.current.projectType ?? ""}
                              onBlur={() => handleBlur("projectType")}
                              onFocus={() => handleFocus("projectType")}
                              onChange={() => handleChange("projectType")}
                              className="w-full appearance-none rounded-lg border border-border/60 bg-background px-4 py-2.5 pr-10 text-sm text-foreground outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30"
                            >
                              <option value="">Select a project type</option>
                              {PROJECT_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <label className="text-sm font-medium text-foreground">
                          Message <span className="text-gold">*</span>
                        </label>
                        <div className="relative mt-1.5">
                          <textarea
                            name="message"
                            rows={5}
                            placeholder="Tell us about your project…"
                            defaultValue={draft.current.message}
                            onBlur={() => handleBlur("message")}
                            onFocus={() => handleFocus("message")}
                            onChange={(e) => { handleChange("message"); setMessageLen(e.target.value.length); }}
                            maxLength={2000}
                            className={`w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-all focus:ring-1 ${
                              touched.message && errors.message
                                ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                                : "border-border/60 focus:border-gold focus:ring-gold/30"
                            }`}
                          />
                          <span className="absolute bottom-3 right-3 text-[0.6rem] text-muted-foreground">
                            <span className="tabular-nums">{messageLen}</span>/2000
                          </span>
                        </div>
                        {touched.message && errors.message && (
                          <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        variant="gold"
                        size="lg"
                        className="mt-6 w-full group"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Reveal>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Draft restored notification */}
      {draft.current.name && !sent && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border/60 bg-card px-5 py-3 shadow-soft text-xs text-muted-foreground backdrop-blur-sm">
          Draft restored from your last session
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  COMPONENTS                                                       */
/* ══════════════════════════════════════════════════════════════════ */

function ContactRow({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-gold/15 text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-foreground">{value}</p>
      </div>
    </div>
  );
}

function FormField({
  name,
  label,
  type = "text",
  placeholder,
  error,
  onBlur,
  onFocus,
  onChange,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  onBlur: () => void;
  onFocus: () => void;
  onChange: () => void;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative mt-1.5">
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue ?? ""}
          onBlur={onBlur}
          onFocus={onFocus}
          onChange={onChange}
          maxLength={type === "email" ? 255 : type === "tel" ? 30 : 200}
          className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 ${
            error ? "border-destructive focus:border-destructive focus:ring-destructive/30" : "border-border/60 focus:border-gold focus:ring-gold/30"
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-destructive flex items-center gap-1" role="alert">
          <AlertCircle className="h-3 w-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
