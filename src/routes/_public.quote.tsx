import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  AlertCircle,
  ChevronDown,
  ArrowUpRight,
  Download,
  Home,
  FileText,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { SuccessCheck } from "@/components/animations";
import { PageHero } from "@/components/page-parts";
import { PRODUCTS, CATEGORIES, COMPANY } from "@/data/site";
import { api, ApiError } from "@/lib/api";
import texture from "@/assets/texture-stone.jpg";

// ── Schema ──
const quoteSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(100),
  company: z.string().trim().max(200).optional().default(""),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => !v || /^[+\d\s\-().]{5,30}$/.test(v), "Enter a valid phone number")
    .optional()
    .default(""),
  country: z.string().trim().min(1, "Country is required").max(100),
  product: z.string().trim().min(1, "Please select a product").max(200),
  stoneCategory: z.string().trim().optional().default(""),
  quantity: z.string().trim().min(1, "Estimated quantity is required").max(100),
  dimensions: z.string().trim().max(200).optional().default(""),
  finish: z.string().trim().max(200).optional().default(""),
  budget: z.string().trim().optional().default(""),
  timeline: z.string().trim().optional().default(""),
  projectDetails: z
    .string()
    .trim()
    .min(10, "Project details must be at least 10 characters")
    .max(3000, "Project details must be under 3,000 characters"),
});

type QuoteData = z.infer<typeof quoteSchema>;

const FINISH_OPTIONS = [
  "Natural", "Honed", "Polished", "Leather", "Brushed",
  "Sandblasted", "Bush Hammered", "Flamed", "Antique", "Tumbled",
];

const BUDGET_RANGES = [
  "Under $5,000",
  "$5,000 – $20,000",
  "$20,000 – $50,000",
  "$50,000 – $100,000",
  "$100,000 – $250,000",
  "$250,000+",
  "Not sure yet",
];

const TIMELINE_OPTIONS = [
  "Immediate (within 1 month)",
  "Short-term (1–3 months)",
  "Medium-term (3–6 months)",
  "Long-term (6–12 months)",
  "Planning stage (12+ months)",
  "Not sure yet",
];

const STORAGE_KEY = "stoneindia_quote_draft";

export const Route = createFileRoute("/_public/quote")({
  head: () => ({
    meta: [
      { title: "Request a Quote — Stone India Heritage" },
      { name: "description", content: "Request a detailed quote or samples for your natural stone project. Our export team replies within one business day." },
    ],
  }),
  component: Quote,
});

function Quote() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof QuoteData, boolean>>>({});
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [refNumber, setRefNumber] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Auto-save draft ──
  const loadDraft = useCallback((): Partial<QuoteData> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }, []);

  const saveDraft = useCallback((data: Partial<QuoteData>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
  }, []);

  const draft = useRef(loadDraft());
  const [detailsLen, setDetailsLen] = useState(draft.current.projectDetails?.length ?? 0);

  // ── Validation ──
  const validateField = (name: keyof QuoteData, value: string) => {
    const formData = Object.fromEntries(new FormData(formRef.current!));
    const result = quoteSchema.safeParse({ ...formData, [name]: value });
    if (!result.success) {
      const fieldError = result.error.issues.find((i) => i.path[0] === name);
      setErrors((prev) => ({ ...prev, [name]: fieldError?.message }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    return true;
  };

  const handleBlur = (name: keyof QuoteData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const input = formRef.current?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (input) validateField(name, input.value);
  };

  const handleChange = (name: keyof QuoteData) => {
    const input = formRef.current?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (input) {
      if (touched[name]) validateField(name, input.value);
      const formData = Object.fromEntries(new FormData(formRef.current!));
      saveDraft(formData as Partial<QuoteData>);
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: "Maximum file size is 10 MB. Please compress or choose a smaller file.",
      });
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/upload/public`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }

      const data = await res.json();
      setFileUrl(data.url);
      setFileUploaded(true);
      toast.success(`"${file.name}" uploaded`, {
        description: "File ready to submit with your quote request.",
      });
    } catch (err) {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Please try again or contact us directly.",
      });
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    // Mark all as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(quoteSchema.shape).forEach((k) => { allTouched[k] = true; });
    setTouched(allTouched as Partial<Record<keyof QuoteData, boolean>>);

    const parsed = quoteSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof QuoteData, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof QuoteData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const specBlock = `\n\nProduct: ${parsed.data.product}\nCategory: ${parsed.data.stoneCategory || "Not specified"}\nQuantity: ${parsed.data.quantity}\nDimensions: ${parsed.data.dimensions || "Not specified"}\nFinish: ${parsed.data.finish || "Not specified"}\nBudget: ${parsed.data.budget || "Not specified"}\nTimeline: ${parsed.data.timeline || "Not specified"}`;
      const message = `${parsed.data.projectDetails}${fileUrl ? `\n\n---\nUploaded drawing: ${fileUrl}` : ""}${specBlock}`;

      await api.post("/api/rfq", {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || undefined,
        company: parsed.data.company || undefined,
        country: parsed.data.country,
        message,
        products: [parsed.data.product],
        attachments: fileUrl ? [fileUrl, ...attachments] : attachments,
      });

      setSent(true);
      setRefNumber(`RFQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Request submitted!", {
        description: "Our export team will respond within one business day.",
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      toast.error(message, {
        description: "Please try again, or email us directly at exports@stoneindiaheritage.com.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSent(false);
    setErrors({});
    setTouched({});
    setFileUploaded(false);
    setFileUrl("");
    setAttachments([]);
    setRefNumber("");
    formRef.current?.reset();
    localStorage.removeItem(STORAGE_KEY);
  };

  const downloadAcknowledgement = () => {
    toast.success("Acknowledgement downloaded", {
      description: "Your acknowledgement receipt will be ready shortly.",
    });
  };

  return (
    <>
      <PageHero
        eyebrow="Request a Quote"
        title="Get a project quote or samples"
        intro="Share your specifications and our export team will prepare a tailored quote within one business day."
        image={texture}
      />
      <section className="py-20">
        <div className="container-lux max-w-3xl">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="rounded-xl border border-border/60 bg-card p-12 text-center shadow-soft"
              >
                <SuccessCheck />
                <h2 className="mt-5 font-serif text-3xl text-foreground">Request received</h2>
                <p className="mt-3 text-muted-foreground">
                  Thank you — our export team will be in touch within one business day.
                </p>

                {/* Reference number */}
                <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg bg-muted/50 px-5 py-3">
                  <FileText className="h-4 w-4 text-gold" />
                  <span className="text-sm font-mono text-foreground tracking-wider">
                    {refNumber}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(refNumber);
                      toast.success("Reference number copied");
                    }}
                    className="text-xs text-gold hover:underline ml-2"
                  >
                    Copy
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button variant="gold" onClick={downloadAcknowledgement}>
                    <Download className="h-4 w-4" /> Download Acknowledgement
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/">
                      <Home className="h-4 w-4" /> Return Home
                    </Link>
                  </Button>
                </div>
                <Button variant="ghost" className="mt-4" onClick={resetForm}>
                  Submit another request
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Reveal>
                  <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-border/60 bg-card p-8 shadow-soft"
                    noValidate
                  >
                    <h2 className="font-serif text-2xl text-foreground">Project details</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Fill in the details below and our team will prepare a tailored quote.
                    </p>

                    {/* ── Contact Information ── */}
                    <p className="eyebrow mt-8 mb-4">Contact Information</p>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        name="name"
                        label="Full name *"
                        placeholder="Jane Architect"
                        error={touched.name ? errors.name : undefined}
                        onBlur={() => handleBlur("name")}
                        onFocus={() => {}}
                        onChange={() => handleChange("name")}
                        defaultValue={draft.current.name}
                      />
                      <FormField
                        name="company"
                        label="Company"
                        placeholder="Studio Name"
                        error={touched.company ? errors.company : undefined}
                        onBlur={() => handleBlur("company")}
                        onFocus={() => {}}
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
                        onFocus={() => {}}
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
                        onFocus={() => {}}
                        onChange={() => handleChange("phone")}
                        defaultValue={draft.current.phone}
                      />
                      <FormField
                        name="country"
                        label="Country *"
                        placeholder="United Kingdom"
                        error={touched.country ? errors.country : undefined}
                        onBlur={() => handleBlur("country")}
                        onFocus={() => {}}
                        onChange={() => handleChange("country")}
                        defaultValue={draft.current.country}
                      />
                    </div>

                    {/* ── Product Details ── */}
                    <p className="eyebrow mt-8 mb-4">Product Details</p>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <SelectField
                        name="product"
                        label="Product *"
                        options={[
                          { value: "", label: "Select a product" },
                          ...PRODUCTS.map((p) => ({ value: p.slug, label: `${p.name} (${p.category})` })),
                          { value: "custom", label: "Custom product not listed" },
                        ]}
                        error={touched.product ? errors.product : undefined}
                        onBlur={() => handleBlur("product")}
                        onChange={() => handleChange("product")}
                        defaultValue={draft.current.product}
                      />
                      <SelectField
                        name="stoneCategory"
                        label="Stone Category"
                        options={[
                          { value: "", label: "Select category (optional)" },
                          ...CATEGORIES.map((c) => ({ value: c, label: c })),
                        ]}
                        error={touched.stoneCategory ? errors.stoneCategory : undefined}
                        onBlur={() => handleBlur("stoneCategory")}
                        onChange={() => handleChange("stoneCategory")}
                        defaultValue={draft.current.stoneCategory}
                      />
                      <FormField
                        name="quantity"
                        label="Estimated quantity *"
                        placeholder="e.g. 500 m², 100 pieces"
                        error={touched.quantity ? errors.quantity : undefined}
                        onBlur={() => handleBlur("quantity")}
                        onFocus={() => {}}
                        onChange={() => handleChange("quantity")}
                        defaultValue={draft.current.quantity}
                      />
                      <FormField
                        name="dimensions"
                        label="Dimensions"
                        placeholder="e.g. 600×600 mm, custom"
                        error={touched.dimensions ? errors.dimensions : undefined}
                        onBlur={() => handleBlur("dimensions")}
                        onFocus={() => {}}
                        onChange={() => handleChange("dimensions")}
                        defaultValue={draft.current.dimensions}
                      />
                      <SelectField
                        name="finish"
                        label="Desired Finish"
                        options={[
                          { value: "", label: "Select finish (optional)" },
                          ...FINISH_OPTIONS.map((f) => ({ value: f, label: f })),
                        ]}
                        error={touched.finish ? errors.finish : undefined}
                        onBlur={() => handleBlur("finish")}
                        onChange={() => handleChange("finish")}
                        defaultValue={draft.current.finish}
                      />
                    </div>

                    {/* ── Project Scope ── */}
                    <p className="eyebrow mt-8 mb-4">Project Scope</p>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <SelectField
                        name="budget"
                        label="Budget Range"
                        options={[
                          { value: "", label: "Select budget range (optional)" },
                          ...BUDGET_RANGES.map((b) => ({ value: b, label: b })),
                        ]}
                        error={touched.budget ? errors.budget : undefined}
                        onBlur={() => handleBlur("budget")}
                        onChange={() => handleChange("budget")}
                        defaultValue={draft.current.budget}
                      />
                      <SelectField
                        name="timeline"
                        label="Project Timeline"
                        options={[
                          { value: "", label: "Select timeline (optional)" },
                          ...TIMELINE_OPTIONS.map((t) => ({ value: t, label: t })),
                        ]}
                        error={touched.timeline ? errors.timeline : undefined}
                        onBlur={() => handleBlur("timeline")}
                        onChange={() => handleChange("timeline")}
                        defaultValue={draft.current.timeline}
                      />
                    </div>

                    {/* ── Upload Drawing ── */}
                    <div className="mt-5">
                      <p className="text-sm font-medium text-foreground">Upload Drawing (optional)</p>
                      <div
                        onClick={() => fileRef.current?.click()}
                        className={`mt-1.5 flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 transition-all ${
                          fileUploaded
                            ? "border-gold/50 bg-gold/5"
                            : "border-border/60 hover:border-gold/30 hover:bg-muted/30"
                        }`}
                      >
                        {uploading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-gold" />
                        ) : (
                          <Upload className={`h-5 w-5 ${fileUploaded ? "text-gold" : "text-muted-foreground"}`} />
                        )}
                        <div className="text-center">
                          {fileUploaded ? (
                            <p className="text-sm font-medium text-gold">File selected ✓</p>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground">
                                Drop a drawing or specification file here
                              </p>
                              <p className="text-[0.6rem] text-muted-foreground/60 mt-0.5">
                                PDF, DWG, DXF, or image files accepted
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleFileUpload}
                          aria-label="Upload drawing file"
                        />
                      </div>
                    </div>

                    {/* ── Project Details ── */}
                    <div className="mt-5">
                      <label className="text-sm font-medium text-foreground">
                        Project Details <span className="text-gold">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <textarea
                          name="projectDetails"
                          rows={5}
                          placeholder="Describe your project in detail — including finishes, colours, site conditions, and any special requirements…"
                          defaultValue={draft.current.projectDetails}
                          onBlur={() => handleBlur("projectDetails")}
                          onFocus={() => {}}                          onChange={(e) => { handleChange("projectDetails"); setDetailsLen(e.target.value.length); }}
                            maxLength={3000}
                            className={`w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-all focus:ring-1 ${
                              touched.projectDetails && errors.projectDetails
                                ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                                : "border-border/60 focus:border-gold focus:ring-gold/30"
                            }`}
                          />
                        <span className="absolute bottom-3 right-3 text-[0.6rem] text-muted-foreground">
                          <span className="tabular-nums">{detailsLen}</span>/3000
                        </span>
                      </div>
                      {touched.projectDetails && errors.projectDetails && (
                        <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.projectDetails}
                        </p>
                      )}
                    </div>

                    {/* ── Samples checkbox ── */}
                    <div className="mt-6 flex items-center gap-2">
                      <input id="samples" type="checkbox" className="h-4 w-4 accent-[var(--gold)]" />
                      <label htmlFor="samples" className="text-sm text-muted-foreground">
                        I&apos;d also like to receive physical samples
                      </label>
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
                          Submitting request…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </form>
                </Reveal>
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
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
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
            error
              ? "border-destructive focus:border-destructive focus:ring-destructive/30"
              : "border-border/60 focus:border-gold focus:ring-gold/30"
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

function SelectField({
  name,
  label,
  options,
  error,
  onBlur,
  onChange,
  defaultValue,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  onBlur: () => void;
  onChange: () => void;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative mt-1.5">
        <select
          name={name}
          defaultValue={defaultValue ?? ""}
          onBlur={onBlur}
          onFocus={() => {}}
          onChange={onChange}
          className={`w-full appearance-none rounded-lg border bg-background px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:ring-1 ${
            error
              ? "border-destructive focus:border-destructive focus:ring-destructive/30"
              : "border-border/60 focus:border-gold focus:ring-gold/30"
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-destructive flex items-center gap-1" role="alert">
          <AlertCircle className="h-3 w-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
