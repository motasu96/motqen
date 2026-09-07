import { NextResponse } from "next/server";
import {
  isLikelyBot,
  MAX_CONTACT_BODY_BYTES,
  normalizeContact,
  validateContact,
  type ContactFormInput,
} from "@/lib/contact-validation";
import { createEnquiryId, getEnquiryStore } from "@/lib/enquiries";

async function resolveCloudflareEnv(): Promise<{ DB?: unknown } | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true });
    return context.env as { DB?: unknown };
  } catch {
    // Not running on a Cloudflare Worker (local dev / tests) — fall back
    // to the local enquiry store instead.
    return undefined;
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_CONTACT_BODY_BYTES) {
    return NextResponse.json({ error: "الطلب كبير جداً." }, { status: 413 });
  }

  let body: Partial<ContactFormInput>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_CONTACT_BODY_BYTES) {
      return NextResponse.json({ error: "الطلب كبير جداً." }, { status: 413 });
    }
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: "محتوى الطلب غير صالح." }, { status: 400 });
  }

  // Silently accept-and-drop likely bot submissions so the honeypot field
  // doesn't reveal itself through a distinct response.
  if (isLikelyBot(body)) {
    return NextResponse.json({ ok: true });
  }

  const errors = validateContact(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const { name, email, message } = normalizeContact(body as ContactFormInput);
  const id = body.requestId && /^[0-9a-f-]{36}$/i.test(body.requestId)
    ? body.requestId
    : createEnquiryId();

  try {
    const env = await resolveCloudflareEnv();
    const store = await getEnquiryStore(env as Parameters<typeof getEnquiryStore>[0]);
    const { saved } = await store.insert({
      id,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, id, deduplicated: !saved });
  } catch {
    return NextResponse.json(
      { error: "تعذّر حفظ رسالتك. يرجى المحاولة مرة أخرى." },
      { status: 500 },
    );
  }
}
