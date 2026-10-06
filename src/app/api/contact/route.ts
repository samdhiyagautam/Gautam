import { NextRequest, NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTHS = { name: 100, email: 254, subject: 200, message: 5000 } as const;

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

export async function POST(request: NextRequest) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Spam trap: bots fill hidden fields; accept silently without processing.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return NextResponse.json({ success: true });
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

  // No email delivery provider is configured yet (e.g. RESEND_API_KEY).
  // Fail honestly instead of pretending the message was sent.
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Message delivery is not configured yet. Please email directly instead." },
      { status: 503 }
    );
  }

  // Future: send via provider here, then return { success: true }.
  return NextResponse.json({ error: "Message delivery is not configured yet." }, { status: 503 });
}
