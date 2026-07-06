import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ValidationError } from "./errors.js";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      }
      throw new ValidationError(errors);
    }
    req[source] = result.data;
    next();
  };
}

// ── Shared schemas ──

export const emailSchema = z.string().email("Invalid email").max(255);
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(100);
export const slugSchema = z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Invalid slug format");

// Password with strength validation
const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// 6-digit OTP
export const otpSchema = z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code");

export const sendResetOtpSchema = z.object({
  email: emailSchema,
});

export const verifyResetOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

export const resetPasswordWithOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  password: strongPasswordSchema,
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().max(30).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  message: z.string().min(10).max(2000),
  _hp: z.string().max(0, "Spam detected").optional(),
});

export const rfqSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  message: z.string().min(10).max(3000),
  products: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
});

export const newsletterSchema = z.object({
  email: emailSchema,
  name: z.string().max(100).optional(),
});

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: slugSchema.optional(),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  subCategory: z.string().max(100).optional(),
  price: z.number().positive().optional(),
  finish: z.string().max(100).optional(),
  size: z.string().max(100).optional(),
  thickness: z.string().max(100).optional(),
  origin: z.string().max(200).optional(),
  featured: z.boolean().optional(),
  stock: z.string().max(50).optional(),
  tags: z.array(z.string()).optional(),
});

export const blogSchema = z.object({
  title: z.string().min(2).max(200),
  slug: slugSchema.optional(),
  excerpt: z.string().min(10).max(300),
  content: z.string().min(50),
  cover: z.string().optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});
