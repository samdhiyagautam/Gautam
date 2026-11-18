import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTHS = { name: 100, email: 254, subject: 200, message: 5000 } as const;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  /** Honeypot field — legitimate clients leave it empty. */
  website?: unknown;
}

function isNonEmptyString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: NextRequest) {
  // Spam trap: bots fill hidden fields; accept silently without processing
  // (and without consuming rate-limit budget).
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return NextResponse.json({ success: true });
  }

  const ip = clientIp(request);
  const limit = rateLimit(ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!limit.allowed) {
    const response = NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 }
    );
    response.headers.set("Retry-After", String(limit.retryAfterSeconds));
    return response;
  }

  const errors: Record<string, string> = {};
  if (!isNonEmptyString(body.name, MAX_LENGTHS.name)) errors.name = "Name is required (max 100 characters).";
  if (!isNonEmptyString(body.email, MAX_LENGTHS.email) || !EMAIL_RE.test((body.email as string).trim())) {
    errors.email = "A valid email address is required.";
  }
  if (!isNonEmptyString(body.subject, MAX_LENGTHS.subject)) errors.subject = "Subject is required (max 200 characters).";
  if (!isNonEmptyString(body.message, MAX_LENGTHS.message)) errors.message = "Message is required (max 5000 characters).";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed.", fields: errors }, { status: 422 });
  }

  const name = (body.name as string).trim().replace(/[\r\n]+/g, " ");
  const email = (body.email as string).trim().replace(/[\r\n]+/g, "");
  const subject = (body.subject as string).trim().replace(/[\r\n]+/g, " ");
  const message = (body.message as string).trim();

  let dbSaved = false;

  // 1. Store message in Supabase
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { error: dbError } = await supabase.from("contact_messages").insert({
        name,
        email,
        subject,
        message,
        ip_address: ip,
        status: "unread",
      });
      if (dbError) {
        console.warn("[contact] Supabase insert note:", dbError.message);
      } else {
        dbSaved = true;
      }
    }
  } catch (err) {
    console.warn("[contact] Supabase error:", err);
  }

  // 2. Email notification (if Resend is configured)
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL;
  let emailSent = false;

  if (apiKey && toEmail) {
    const from = process.env.CONTACT_FROM_EMAIL || "Gautam Samdhiya <onboarding@resend.dev>";
    try {
      const resend = new Resend(apiKey);
      const { error: resendError } = await resend.emails.send({
        from,
        to: [toEmail],
        replyTo: email,
        subject: `[Gautam Samdhiya Inquiry] ${subject}`,
        text: `From: ${name} <${email}>\nIP: ${ip}\n\n${message}`,
        html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><p><strong>IP:</strong> ${escapeHtml(ip)}</p><hr /><p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>`,
      });
      if (!resendError) {
        emailSent = true;
      } else {
        console.error("[contact] Resend error:", resendError);
      }
    } catch (sendErr) {
      console.error("[contact] Email dispatch failed:", sendErr);
    }
  }

  // If neither Supabase nor Resend is configured or could succeed
  if (!dbSaved && !emailSent && (!apiKey || !toEmail)) {
    // If Supabase wasn't configured and Resend wasn't configured, notify user
    return NextResponse.json(
      { error: "Direct messaging is currently offline. Please email directly at the email listed on this page." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    dbSaved,
    emailSent,
  });
}
