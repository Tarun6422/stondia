import nodemailer from "nodemailer";
import { CONFIG } from "../config.js";

/* ------------------------------------------------------------------ */
/*  HTML escaping — prevent XSS in user-controlled template values    */
/* ------------------------------------------------------------------ */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeVal(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return escapeHtml(JSON.stringify(v));
  return escapeHtml(String(v));
}

/* ------------------------------------------------------------------ */
/*  Transport — SMTP (standard or Supabase SMTP)                      */
/* ------------------------------------------------------------------ */

function createTransport() {
  if (CONFIG.SUPABASE_SMTP_HOST) {
    // Supabase SMTP via dedicated config vars
    return nodemailer.createTransport({
      host: CONFIG.SUPABASE_SMTP_HOST,
      port: CONFIG.SUPABASE_SMTP_PORT,
      secure: CONFIG.SUPABASE_SMTP_PORT === 465,
      auth: {
        user: CONFIG.SUPABASE_SMTP_USER,
        pass: CONFIG.SUPABASE_SMTP_PASS,
      },
    });
  }
  return nodemailer.createTransport({
    host: CONFIG.SMTP_HOST,
    port: CONFIG.SMTP_PORT,
    secure: CONFIG.SMTP_PORT === 465,
    auth: {
      user: CONFIG.SMTP_USER,
      pass: CONFIG.SMTP_PASS,
    },
  });
}

const transporter = createTransport();

export async function sendEmail(to: string, subject: string, html: string) {
  if (CONFIG.NODE_ENV === "development" && !CONFIG.SMTP_USER) {
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: `"Stone India Heritage" <${CONFIG.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}

/* ------------------------------------------------------------------ */
/*  Shared HTML shell — luxury brand wrapper                           */
/* ------------------------------------------------------------------ */

function shell({
  title,
  preview,
  children,
}: {
  title?: string;
  preview?: string;
  children: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="format-detection" content="telephone=no,address=no,email=no,url=no">
  <title>${title || "Stone India Heritage"}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; }
    td { font-family: Georgia, serif; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#e8e2d9;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.7;color:#3a322a;-webkit-font-smoothing:antialiased">
  ${preview ? `<div style="display:none;font-size:1px;color:#e8e2d9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${preview}</div>` : ""}

  <!-- ── Pre-header spacer ── -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8e2d9">
    <tr><td style="padding:24px 16px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto">

        <!-- ── Header ── -->
        <tr>
          <td style="padding:0 0 20px;text-align:center">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
              <tr>
                <td style="background:#b8860b;border-radius:6px;width:52px;height:52px;text-align:center;vertical-align:middle">
                  <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#1a1208">SH</span>
                </td>
              </tr>
            </table>
            <h1 style="margin:10px 0 0;font-size:26px;font-weight:400;letter-spacing:1px;color:#2c2416;font-family:Georgia,'Times New Roman',serif">
              Stone India Heritage
            </h1>
            <p style="margin:2px 0 0;font-size:11px;letter-spacing:3.5px;text-transform:uppercase;color:#b8860b">
              Heritage Sandstone &amp; Architecture
            </p>
          </td>
        </tr>

        <!-- ── Body card ── -->
        <tr>
          <td style="background:#ffffff;border-radius:12px;padding:40px 36px;box-shadow:0 2px 12px rgba(44,36,22,0.06)">
            ${children}
          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td style="padding:32px 0 24px;text-align:center">
            <p style="margin:0 0 6px;font-size:11px;color:#b8860b;letter-spacing:2.5px;text-transform:uppercase">
              Stone India Heritage
            </p>
            <p style="margin:0 0 4px;font-size:12px;color:#7a7066;line-height:1.6">
              Village Keria, Post Salawa, Jodhpur — Rajasthan, India
            </p>
            <p style="margin:0;font-size:12px;color:#7a7066">
              <a href="tel:+919829000000" style="color:#7a7066;text-decoration:none">${escapeHtml(CONFIG.COMPANY_PHONE || "+91 98290 00000")}</a>
              &nbsp;·&nbsp;
              <a href="mailto:${CONFIG.EMAIL_TO}" style="color:#b8860b;text-decoration:none">${CONFIG.EMAIL_TO}</a>
              &nbsp;·&nbsp;
              <a href="${CONFIG.FRONTEND_URL}" style="color:#b8860b;text-decoration:none">stoneindiaheritage.com</a>
            </p>
            <p style="margin:20px 0 0;font-size:11px;color:#9c9288">
              &copy; 2026 Stone India Heritage. All rights reserved.<br>
              You are receiving this email because you opted in or interacted with our services.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  Helper — gold-themed CTA button                                    */
/* ------------------------------------------------------------------ */

function ctaButton(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0">
    <tr>
      <td style="border-radius:8px;background:#b8860b;text-align:center;padding:0">
        <a href="${url}" target="_blank" style="display:inline-block;padding:14px 36px;border-radius:8px;background:#b8860b;color:#1a1208;text-decoration:none;font-size:14px;font-weight:700;font-family:Georgia,serif;letter-spacing:0.3px;mso-hide:all">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

function divider(): string {
  return `<div style="height:1px;background:linear-gradient(to right,transparent,#d4c5a8,transparent);margin:28px 0"></div>`;
}

/* ------------------------------------------------------------------ */
/*  1. Welcome / Registration                                         */
/* ------------------------------------------------------------------ */

export function welcomeEmail(name: string): string {
  const safeName = escapeVal(name);
  return shell({
    title: "Welcome to Stone India Heritage",
    preview: `Welcome to Stone India Heritage, ${name}. Your account is ready.`,
    children: `
      <div style="text-align:center;margin-bottom:28px">
        <div style="width:64px;height:64px;margin:0 auto;background:#e8dcc8;border-radius:50%;display:flex;align-items:center;justify-content:center">
          <span style="font-size:28px">🏛</span>
        </div>
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:400;color:#2c2416;font-family:Georgia,serif">Welcome, ${safeName}</h2>
      <p style="margin:0 0 16px;color:#5c5248;font-size:15px;line-height:1.8">
        Thank you for creating an account with <strong>Stone India Heritage</strong>.
        You now have access to our complete collection of premium Rajasthan sandstone,
        natural stone slabs, and architectural stone products.
      </p>
      <p style="margin:0 0 20px;color:#5c5248;font-size:15px;line-height:1.8">
        Browse our catalog, request quotations, track orders, and save your
        favourite products — all from your personal dashboard.
      </p>
      <div style="text-align:center;margin:24px 0">
        ${ctaButton(`${CONFIG.FRONTEND_URL}/dashboard`, "Go to Your Dashboard")}
      </div>
      ${divider()}
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="width:50%;padding:0 8px 0 0;vertical-align:top">
            <div style="background:#faf7f2;border-radius:8px;padding:16px;text-align:center">
              <p style="margin:0 0 4px;font-size:20px">📦</p>
              <p style="margin:0;font-size:13px;color:#5c5248;font-weight:600">Premium Stone</p>
              <p style="margin:2px 0 0;font-size:11px;color:#8c8278">400+ varieties</p>
            </div>
          </td>
          <td style="width:50%;padding:0 0 0 8px;vertical-align:top">
            <div style="background:#faf7f2;border-radius:8px;padding:16px;text-align:center">
              <p style="margin:0 0 4px;font-size:20px">🚢</p>
              <p style="margin:0;font-size:13px;color:#5c5248;font-weight:600">Global Shipping</p>
              <p style="margin:2px 0 0;font-size:11px;color:#8c8278">50+ countries</p>
            </div>
          </td>
        </tr>
      </table>
      <p style="margin:20px 0 0;color:#8c8278;font-size:13px;text-align:center">
        Need help? Contact our team at <a href="mailto:${CONFIG.EMAIL_TO}" style="color:#b8860b;text-decoration:none">${CONFIG.EMAIL_TO}</a>
      </p>
    `,
  });
}

/* ------------------------------------------------------------------ */
/*  2. Contact Confirmation                                           */
/* ------------------------------------------------------------------ */

export function contactConfirmationEmail(name: string): string {
  const safeName = escapeVal(name);
  return shell({
    title: "Thank You — Stone India Heritage",
    preview: `Dear ${name}, thank you for reaching out. We'll respond within one business day.`,
    children: `
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:64px;height:64px;margin:0 auto;background:#e8dcc8;border-radius:50%;display:flex;align-items:center;justify-content:center">
          <span style="font-size:28px">✉</span>
        </div>
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:400;color:#2c2416;text-align:center;font-family:Georgia,serif">Thank You, ${safeName}</h2>
      <p style="margin:0 0 8px;color:#5c5248;font-size:15px;line-height:1.8">
        We have received your enquiry and appreciate your interest in Stone India Heritage.
      </p>
      <p style="margin:0 0 16px;color:#5c5248;font-size:15px;line-height:1.8">
        Our team will review your message and respond within <strong>one business day</strong>.
        For urgent enquiries, please call us directly.
      </p>
      ${divider()}
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="text-align:center;color:#5c5248;font-size:14px">
            <p style="margin:0 0 4px;font-weight:600;color:#2c2416">📞 Need a faster response?</p>
            <p style="margin:0">
              <a href="tel:+919829000000" style="color:#b8860b;text-decoration:none;font-size:16px;font-weight:600">+91 98290 00000</a>
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:20px 0 0;color:#8c8278;font-size:13px;text-align:center">
        Enquiry reference included in your dashboard.
      </p>
    `,
  });
}

/* ------------------------------------------------------------------ */
/*  3. RFQ Confirmation                                               */
/* ------------------------------------------------------------------ */

export function rfqConfirmationEmail(name: string, quoteRef?: string): string {
  const safeName = escapeVal(name);
  const safeRef = quoteRef ? escapeVal(quoteRef) : "";
  return shell({
    title: "Quote Request Received — Stone India Heritage",
    preview: `Dear ${name}, your quote request has been received. Our export team will respond within 24 hours.`,
    children: `
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:64px;height:64px;margin:0 auto;background:#e8dcc8;border-radius:50%;display:flex;align-items:center;justify-content:center">
          <span style="font-size:28px">📋</span>
        </div>
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:400;color:#2c2416;text-align:center;font-family:Georgia,serif">Quote Request Received</h2>
      ${quoteRef ? `<p style="margin:0 0 16px;text-align:center;font-size:13px;color:#8c8278">Reference: <span style="font-family:monospace;color:#b8860b;font-size:14px">${safeRef}</span></p>` : ""}
      <p style="margin:0 0 8px;color:#5c5248;font-size:15px;line-height:1.8">
        Dear ${safeName},
      </p>
      <p style="margin:0 0 8px;color:#5c5248;font-size:15px;line-height:1.8">
        Thank you for your quotation request. Our export team is reviewing your
        requirements and will prepare a detailed quotation within <strong>24 hours</strong>.
      </p>
      <p style="margin:0 0 20px;color:#5c5248;font-size:15px;line-height:1.8">
        You will receive a notification as soon as your quote is ready. If you
        have additional specifications or drawings to share, please reply to this
        email or upload them through your dashboard.
      </p>
      <div style="text-align:center;margin:24px 0">
        ${ctaButton(`${CONFIG.FRONTEND_URL}/dashboard`, "Track Your Request")}
      </div>
      ${divider()}
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="width:33%;padding:0 6px 0 0;vertical-align:top;text-align:center">
            <p style="margin:0;font-size:11px;color:#8c8278;line-height:1.4">
              <strong style="color:#2c2416">Review</strong><br>
              We analyse your specifications
            </p>
          </td>
          <td style="width:33%;padding:0 6px;vertical-align:top;text-align:center">
            <p style="margin:0;font-size:11px;color:#8c8278;line-height:1.4">
              <strong style="color:#2c2416">Quote</strong><br>
              Detailed pricing &amp; timeline
            </p>
          </td>
          <td style="width:33%;padding:0 0 0 6px;vertical-align:top;text-align:center">
            <p style="margin:0;font-size:11px;color:#8c8278;line-height:1.4">
              <strong style="color:#2c2416">Delivery</strong><br>
              Global shipping &amp; logistics
            </p>
          </td>
        </tr>
      </table>
    `,
  });
}

/* ------------------------------------------------------------------ */
/*  4. RFQ Quotation Reply                                            */
/* ------------------------------------------------------------------ */

export function rfqReplyEmail(reply: string, status: string): string {
  const safeReply = escapeVal(reply);
  const safeStatus = escapeVal(status);
  const statusColors: Record<string, string> = {
    Quoted: "#b8860b",
    Negotiation: "#2563eb",
    Completed: "#059669",
    Cancelled: "#dc2626",
    Pending: "#8c8278",
  };
  const color = statusColors[status] || "#b8860b";

  return shell({
    title: `Quote Update — Stone India Heritage (${status})`,
    preview: `Your quotation status has been updated to ${status}. View our response.`,
    children: `
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:64px;height:64px;margin:0 auto;background:#e8dcc8;border-radius:50%;display:flex;align-items:center;justify-content:center">
          <span style="font-size:28px">📄</span>
        </div>
      </div>
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:400;color:#2c2416;text-align:center;font-family:Georgia,serif">Quote Update</h2>
      <div style="text-align:center;margin:12px 0 20px">
        <span style="display:inline-block;padding:4px 16px;border-radius:999px;background:${color}15;color:${color};font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase">
          ${safeStatus}
        </span>
      </div>
      <p style="margin:0 0 6px;color:#5c5248;font-size:15px">Our team has reviewed your quote request. Here is our response:</p>
      <div style="background:#faf7f2;border-left:3px solid #b8860b;padding:20px 24px;border-radius:6px;margin:16px 0;font-size:14px;color:#2c2416;line-height:1.8;white-space:pre-wrap;font-family:Georgia,serif">${safeReply}</div>
      <div style="text-align:center;margin:24px 0">
        ${ctaButton(`${CONFIG.FRONTEND_URL}/dashboard`, "View Full Quote")}
      </div>
      <p style="margin:16px 0 0;color:#5c5248;font-size:14px;line-height:1.7">
        Reply directly to this email or contact our export team at
        <a href="mailto:${CONFIG.EMAIL_TO}" style="color:#b8860b;text-decoration:none">${CONFIG.EMAIL_TO}</a>
        for further clarification.
      </p>
    `,
  });
}

/* ------------------------------------------------------------------ */
/*  5. RFQ Completed                                                  */
/* ------------------------------------------------------------------ */

export function rfqCompletedEmail(name: string, company?: string, quoteRef?: string): string {
  const safeName = escapeVal(name);
  const safeCompany = company ? escapeVal(company) : "";
  const safeRef = quoteRef ? escapeVal(quoteRef) : "";
  return shell({
    title: "Quote Completed — Stone India Heritage",
    preview: `Your quotation with Stone India Heritage has been completed.`,
    children: `
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:72px;height:72px;margin:0 auto;background:#ecfdf5;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #059669">
          <span style="font-size:30px;color:#059669">✓</span>
        </div>
      </div>
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:400;color:#059669;text-align:center;font-family:Georgia,serif">Quote Completed</h2>
      <p style="margin:0 0 12px;text-align:center;font-size:13px;color:#8c8278">Your quotation has been finalised</p>
      ${quoteRef ? `<p style="margin:0 0 16px;text-align:center;font-size:13px;color:#8c8278">Reference: <span style="font-family:monospace;color:#b8860b;font-size:14px">${safeRef}</span></p>` : ""}
      <p style="margin:0 0 8px;color:#5c5248;font-size:15px;line-height:1.8">Dear ${safeName},</p>
      <p style="margin:0 0 8px;color:#5c5248;font-size:15px;line-height:1.8">
        We are pleased to inform you that your quotation with Stone India Heritage
        has been marked as <strong style="color:#059669">Completed</strong>.
        ${company ? `Thank you for choosing us as your partner for ${safeCompany}.` : ""}
      </p>
      <p style="margin:0 0 20px;color:#5c5248;font-size:15px;line-height:1.8">
        If you have follow-up requirements, need support with delivery logistics,
        or wish to place another order, our team is ready to assist.
      </p>
      <div style="text-align:center;margin:24px 0">
        ${ctaButton(`${CONFIG.FRONTEND_URL}/dashboard`, "View Order Details")}
      </div>
      <p style="margin:16px 0 0;color:#5c5248;font-size:13px;text-align:center">
        Need support? <a href="${CONFIG.FRONTEND_URL}/contact" style="color:#b8860b">Contact our team</a>
      </p>
    `,
  });
}

/* ------------------------------------------------------------------ */
/*  6. RFQ Cancelled                                                  */
/* ------------------------------------------------------------------ */

export function rfqCancelledEmail(name: string, reason?: string, quoteRef?: string): string {
  const safeName = escapeVal(name);
  const safeReason = reason ? escapeVal(reason) : "";
  const safeRef = quoteRef ? escapeVal(quoteRef) : "";
  return shell({
    title: "Quote Cancelled — Stone India Heritage",
    preview: `Your quotation with Stone India Heritage has been cancelled.`,
    children: `
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:72px;height:72px;margin:0 auto;background:#fef2f2;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #dc2626">
          <span style="font-size:30px;color:#dc2626">✕</span>
        </div>
      </div>
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:400;color:#dc2626;text-align:center;font-family:Georgia,serif">Quote Cancelled</h2>
      <p style="margin:0 0 12px;text-align:center;font-size:13px;color:#8c8278">Your recent quotation has been cancelled</p>
      ${quoteRef ? `<p style="margin:0 0 16px;text-align:center;font-size:13px;color:#8c8278">Reference: <span style="font-family:monospace;color:#b8860b;font-size:14px">${safeRef}</span></p>` : ""}
      <p style="margin:0 0 8px;color:#5c5248;font-size:15px;line-height:1.8">Dear ${safeName},</p>
      <p style="margin:0 0 8px;color:#5c5248;font-size:15px;line-height:1.8">
        We regret to inform you that your quotation with Stone India Heritage
        has been marked as <strong style="color:#dc2626">Cancelled</strong>.
      </p>
      ${reason ? `<div style="background:#fef2f2;border-left:3px solid #dc2626;padding:14px 18px;margin:16px 0;border-radius:6px"><p style="margin:0;color:#7f1d1d;font-size:14px;line-height:1.6">${safeReason}</p></div>` : ""}
      <p style="margin:0 0 20px;color:#5c5248;font-size:15px;line-height:1.8">
        We value your interest and would welcome the opportunity to assist with
        future projects. If circumstances change or you would like to discuss
        alternative options, please don't hesitate to reach out.
      </p>
      <div style="text-align:center;margin:24px 0">
        ${ctaButton(`${CONFIG.FRONTEND_URL}/contact`, "Contact Our Team")}
      </div>
      <p style="margin:16px 0 0;color:#5c5248;font-size:13px;text-align:center">
        Or email us directly at <a href="mailto:${CONFIG.EMAIL_TO}" style="color:#b8860b">${CONFIG.EMAIL_TO}</a>
      </p>
    `,
  });
}

/* ------------------------------------------------------------------ */
/*  7. Password Reset (OTP-based)                                     */
/* ------------------------------------------------------------------ */

export function passwordResetOTPEmail(name: string, otp: string): string {
  const safeName = escapeVal(name);
  return shell({
    title: "Stone India Heritage Password Reset OTP",
    preview: `Hi ${safeName}, use this OTP to reset your password. Valid for 10 minutes.`,
    children: `
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:64px;height:64px;margin:0 auto;background:#e8dcc8;border-radius:50%;display:flex;align-items:center;justify-content:center">
          <span style="font-size:28px">🔐</span>
        </div>
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:400;color:#2c2416;text-align:center;font-family:Georgia,serif">Password Reset OTP</h2>
      <p style="margin:0 0 8px;color:#5c5248;font-size:15px;line-height:1.8">
        Hi ${safeName},
      </p>
      <p style="margin:0 0 8px;color:#5c5248;font-size:15px;line-height:1.8">
        We received a request to reset the password for your Stone India Heritage account.
        Use the verification code below to proceed.
      </p>

      <!-- OTP Display -->
      <div style="text-align:center;margin:32px 0">
        <div style="display:inline-block;background:#faf7f2;border:2px solid #b8860b;border-radius:12px;padding:20px 40px;letter-spacing:12px;font-family:'Courier New',Courier,monospace;font-size:40px;font-weight:700;color:#2c2416">
          ${otp}
        </div>
      </div>

      <p style="margin:0 0 20px;color:#8c8278;font-size:13px;text-align:center">
        <strong style="color:#b8860b">⚠ This code expires in 10 minutes</strong><br>
        Do not share this code with anyone. Our team will never ask for your OTP.
      </p>

      ${divider()}

      <p style="margin:16px 0 0;color:#5c5248;font-size:14px;line-height:1.7">
        If you didn't request a password reset, you can safely ignore this email.
        Your account remains secure.
      </p>
      <p style="margin:8px 0 0;color:#8c8278;font-size:12px;text-align:center">
        Need help? Contact us at <a href="mailto:${CONFIG.EMAIL_TO}" style="color:#b8860b;text-decoration:none">${CONFIG.EMAIL_TO}</a>
      </p>
    `,
  });
}

/* ------------------------------------------------------------------ */
/*  8. Newsletter Confirmation                                        */
/* ------------------------------------------------------------------ */

export function newsletterConfirmationEmail(name?: string, email?: string): string {
  const safeName = name ? escapeVal(name) : "";
  const safeEmail = email ? escapeVal(email) : "";
  const unsubscribeUrl = email
    ? `${CONFIG.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`
    : `${CONFIG.FRONTEND_URL}/contact`;
  const greeting = name ? `Dear ${safeName},` : "Hello,";
  return shell({
    title: "You're Subscribed — Stone India Heritage",
    preview: "Thank you for subscribing to Stone India Heritage updates.",
    children: `
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:64px;height:64px;margin:0 auto;background:#e8dcc8;border-radius:50%;display:flex;align-items:center;justify-content:center">
          <span style="font-size:28px">📬</span>
        </div>
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:400;color:#2c2416;text-align:center;font-family:Georgia,serif">You're Subscribed</h2>
      <p style="margin:0 0 8px;color:#5c5248;font-size:15px;line-height:1.8">${greeting}</p>
      <p style="margin:0 0 8px;color:#5c5248;font-size:15px;line-height:1.8">
        Thank you for subscribing to the <strong>Stone India Heritage</strong>
        newsletter. You'll receive curated updates including:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0">
        <tr>
          <td style="padding:6px 0;color:#5c5248;font-size:14px">
            <span style="color:#b8860b">✦</span> New product arrivals &amp; collections
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#5c5248;font-size:14px">
            <span style="color:#b8860b">✦</span> Featured project spotlights
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#5c5248;font-size:14px">
            <span style="color:#b8860b">✦</span> Industry insights &amp; architectural inspiration
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#5c5248;font-size:14px">
            <span style="color:#b8860b">✦</span> Exclusive offers &amp; trade show invitations
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;color:#8c8278;font-size:13px;line-height:1.6">
        You can <a href="${unsubscribeUrl}" style="color:#8c8278;text-decoration:underline">unsubscribe</a> at any time.
        We respect your inbox and will only send content we
        believe adds genuine value to your business.
      </p>
      ${divider()}
      <p style="margin:0;color:#8c8278;font-size:12px;text-align:center">
        Welcome to the Stone India Heritage community.
      </p>
    `,
  });
}

/* ------------------------------------------------------------------ */
/*  9. Admin Notification (formatted)                                 */
/* ------------------------------------------------------------------ */

export function adminNotificationEmail(type: string, data: Record<string, unknown>): string {
  const fields = Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:6px 12px;font-size:13px;color:#5c5248;border-bottom:1px solid #ece6dc;text-transform:capitalize;font-weight:600;width:100px">${escapeVal(k.replace(/([A-Z])/g, " $1"))}</td>
          <td style="padding:6px 12px;font-size:13px;color:#2c2416;border-bottom:1px solid #ece6dc">${escapeVal(v).slice(0, 500)}</td>
        </tr>`,
    )
    .join("");

  return shell({
    title: `Admin Notification — ${type}`,
    preview: `New ${type} received at Stone India Heritage.`,
    children: `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <div style="width:40px;height:40px;background:#b8860b;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#1a1208;font-size:18px;font-weight:700">!</div>
        <div>
          <h2 style="margin:0;font-size:18px;font-weight:400;color:#2c2416;font-family:Georgia,serif">New ${type}</h2>
          <p style="margin:0;font-size:12px;color:#8c8278">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" })}</p>
        </div>
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#faf7f2;border-radius:8px;overflow:hidden">
        ${fields}
      </table>
      <div style="text-align:center;margin:24px 0">
        ${ctaButton(`${CONFIG.FRONTEND_URL}/admin`, "Open Admin Panel")}
      </div>
    `,
  });
}
