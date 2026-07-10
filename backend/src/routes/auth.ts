import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { Secret, SignOptions } from "jsonwebtoken";
import { prisma } from "../db.js";
import { CONFIG } from "../config.js";
import { authenticate } from "../middleware/auth.js";
import {
  validate,
  registerSchema,
  loginSchema,
  sendResetOtpSchema,
  verifyResetOtpSchema,
  resetPasswordWithOtpSchema,
} from "../lib/validation.js";
import { AppError, UnauthorizedError } from "../lib/errors.js";
import { sendEmail, welcomeEmail, passwordResetOTPEmail } from "../lib/email.js";
import type { JwtPayload } from "../middleware/auth.js";

const router = Router();

function generateTokens(payload: JwtPayload) {
  const accessToken = jwt.sign(payload, CONFIG.JWT_SECRET as Secret, {
    expiresIn: CONFIG.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
  const refreshToken = jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET as Secret, {
    expiresIn: CONFIG.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  });
  return { accessToken, refreshToken };
}

function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  rememberMe = false,
) {
  const accessMaxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000; // 7 days or 15 min
  const refreshMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days or 7 days

  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: CONFIG.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: accessMaxAge,
  });
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: CONFIG.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: refreshMaxAge,
    path: "/api/auth",
  });
}

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email already registered", 409);

  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedVerificationToken = await bcrypt.hash(verificationToken, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      verificationToken: hashedVerificationToken,
      verificationTokenExp: new Date(Date.now() + 86400000), // 24 hours
    },
  });

  const tokens = generateTokens({ userId: user.id, role: user.role });
  setAuthCookies(res, tokens);

  // Send welcome & verification email
  const verifyUrl = `${CONFIG.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${email}`;
  try {
    await sendEmail(email, "Welcome to Stone India Heritage", welcomeEmail(name));
    await sendEmail(
      email,
      "Verify Your Email — Stone India Heritage",
      `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:22px;margin:0 0 8px;color:#1a1a1a">Verify your email</h2>
        <p style="color:#5c5248;font-size:15px;line-height:1.7;margin:0 0 24px">
          Thanks for joining Stone India Heritage, <strong>${name}</strong>. Please verify your email address by clicking the button below.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#b8860b;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px">
          Verify Email
        </a>
        <p style="color:#8a7f74;font-size:13px;margin-top:24px">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>`,
    );
  } catch {
    /* ignore email failures — user can still log in */
  }

  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      company: user.company,
      designation: user.designation,
    },
    ...tokens,
  });
});

// GET /api/auth/verify-email
router.get("/verify-email", async (req: Request, res: Response) => {
  const { email, token } = req.query as Record<string, string>;
  if (!email || !token) return res.redirect(`${CONFIG.FRONTEND_URL}/login?verified=fail`);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.verificationToken || !user.verificationTokenExp) {
    return res.redirect(`${CONFIG.FRONTEND_URL}/login?verified=fail`);
  }

  if (user.verificationTokenExp < new Date()) {
    return res.redirect(`${CONFIG.FRONTEND_URL}/login?verified=expired`);
  }

  const valid = await bcrypt.compare(token, user.verificationToken);
  if (!valid) return res.redirect(`${CONFIG.FRONTEND_URL}/login?verified=fail`);

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationToken: null, verificationTokenExp: null },
  });

  res.redirect(`${CONFIG.FRONTEND_URL}/login?verified=success`);
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const rememberMe = req.body.rememberMe === true;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError("Invalid email or password");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new UnauthorizedError("Invalid email or password");

  const tokens = generateTokens({ userId: user.id, role: user.role });
  setAuthCookies(res, tokens, rememberMe);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      company: user.company,
      designation: user.designation,
    },
    ...tokens,
  });
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.json({ message: "Logged out successfully" });
});

// POST /api/auth/refresh
router.post("/refresh", async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw new UnauthorizedError("No refresh token");

  try {
    const payload = jwt.verify(token, CONFIG.JWT_REFRESH_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new UnauthorizedError("User not found");

    const tokens = generateTokens({ userId: user.id, role: user.role });

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: CONFIG.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        company: user.company,
        designation: user.designation,
      },
    });
  } catch {
    throw new UnauthorizedError("Invalid refresh token");
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      address: true,
      company: true,
      designation: true,
      createdAt: true,
    },
  });
  if (!user) throw new UnauthorizedError("User not found");
  res.json(user);
});

// ── OTP-based Password Reset ──

// POST /api/auth/send-reset-otp — Send 6-digit OTP to email
router.post(
  "/send-reset-otp",
  validate(sendResetOtpSchema),
  async (req: Request, res: Response) => {
    const { email } = req.body;

    // Always return generic success — don't reveal whether email exists
    const genericMessage = { message: "If the email exists, a verification code has been sent." };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json(genericMessage);

    // Generate a random 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOtp: hashedOtp,
        passwordResetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        passwordResetAttempts: 0,
      },
    });

    // Send OTP email
    try {
      await sendEmail(
        email,
        "Stone India Heritage Password Reset OTP",
        passwordResetOTPEmail(user.name, otp),
      );
    } catch {
      // Log but don't reveal failure
      console.error("[AUTH] Failed to send OTP email to:", email);
    }

    res.json(genericMessage);
  },
);

// POST /api/auth/verify-reset-otp — Verify OTP code
router.post(
  "/verify-reset-otp",
  validate(verifyResetOtpSchema),
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const genericFail = { verified: false, message: "Invalid or expired verification code." };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpiry) {
      return res.json(genericFail);
    }

    // Check expiry
    if (user.passwordResetOtpExpiry < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetOtp: null, passwordResetOtpExpiry: null, passwordResetAttempts: 0 },
      });
      return res.json({
        verified: false,
        message: "Verification code has expired. Request a new one.",
      });
    }

    // Check max attempts (5)
    if (user.passwordResetAttempts >= 5) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetOtp: null, passwordResetOtpExpiry: null, passwordResetAttempts: 0 },
      });
      return res.json({
        verified: false,
        message: "Too many attempts. Please request a new code.",
      });
    }

    // Verify OTP
    const valid = await bcrypt.compare(otp, user.passwordResetOtp);
    if (!valid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetAttempts: { increment: 1 } },
      });
      const remaining = 5 - (user.passwordResetAttempts + 1);
      return res.json({
        verified: false,
        message:
          remaining > 0
            ? `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Too many attempts. Please request a new code.",
      });
    }

    // OTP verified — save the verified flag by storing "verified" in passwordResetOtp
    // We'll use a marker approach: set a short-lived verified flag in the OTP field
    // Reset attempts count
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetAttempts: 0 },
    });

    res.json({ verified: true });
  },
);

// POST /api/auth/reset-password — Reset password after OTP verification
router.post(
  "/reset-password",
  validate(resetPasswordWithOtpSchema),
  async (req: Request, res: Response) => {
    const { email, otp, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpiry) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    // Check expiry
    if (user.passwordResetOtpExpiry < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetOtp: null, passwordResetOtpExpiry: null, passwordResetAttempts: 0 },
      });
      return res.status(400).json({ message: "Verification code has expired. Request a new one." });
    }

    // Check max attempts
    if (user.passwordResetAttempts >= 5) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetOtp: null, passwordResetOtpExpiry: null, passwordResetAttempts: 0 },
      });
      return res.status(400).json({ message: "Too many attempts. Please request a new code." });
    }

    // Verify OTP again before allowing password change
    const valid = await bcrypt.compare(otp, user.passwordResetOtp);
    if (!valid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetAttempts: { increment: 1 } },
      });
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetOtp: null,
        passwordResetOtpExpiry: null,
        passwordResetAttempts: 0,
      },
    });

    // Log the password reset event for admin auditing
    try {
      const ip = req.ip || (req.headers["x-forwarded-for"] as string) || "";
      const userAgent = req.headers["user-agent"] || "";
      await prisma.passwordResetLog.create({
        data: {
          userId: user.id,
          ip: ip.slice(0, 45),
          userAgent: String(userAgent).slice(0, 500),
          success: true,
          method: "otp",
        },
      });
    } catch {
      // Logging failure shouldn't break password reset
    }

    res.json({ message: "Password reset successfully" });
  },
);

// POST /api/auth/forgot-password — @deprecated Legacy endpoint kept for backward compat.
// Use POST /api/auth/send-reset-otp instead (same logic, clearer naming).
router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new AppError("Email is required", 400);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.json({ message: "If the email exists, a verification code has been sent." });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const hashedOtp = await bcrypt.hash(otp, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetOtp: hashedOtp,
      passwordResetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      passwordResetAttempts: 0,
    },
  });

  try {
    await sendEmail(
      email,
      "Stone India Heritage Password Reset OTP",
      passwordResetOTPEmail(user.name, otp),
    );
  } catch {
    /* ignore */
  }

  res.json({ message: "If the email exists, a verification code has been sent." });
});

// PUT /api/auth/profile — update name, phone, avatar, address, company, designation
router.put("/profile", authenticate, async (req: Request, res: Response) => {
  const { name, phone, avatar, address, company, designation } = req.body;
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (phone !== undefined) data.phone = phone;
  if (avatar !== undefined) data.avatar = avatar;
  if (address !== undefined) data.address = address;
  if (company !== undefined) data.company = company;
  if (designation !== undefined) data.designation = designation;

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      address: true,
      company: true,
      designation: true,
    },
  });
  res.json(user);
});

// PUT /api/auth/change-password
router.put("/change-password", authenticate, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new AppError("Missing required fields", 400);

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) throw new UnauthorizedError();

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new AppError("Current password is incorrect", 400);

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

  res.json({ message: "Password changed successfully" });
});

export default router;
