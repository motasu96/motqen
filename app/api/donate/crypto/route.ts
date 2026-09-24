import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createInvoice } from "@/lib/nowpayments";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.motqen.site";
const MIN_USD = 5;
const MAX_USD = 10000;

// Creates a NOWPayments invoice for a donation and returns its hosted payment URL.
export async function POST(req: NextRequest) {
  if (!process.env.NOWPAYMENTS_API_KEY) {
    return NextResponse.json({ error: "Crypto payments are not configured" }, { status: 501 });
  }

  let payload: { name?: unknown; email?: unknown; amount?: unknown; frequency?: unknown; locale?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 100) : "";
  const email = typeof payload.email === "string" ? payload.email.trim().slice(0, 200) : "";
  const amount = Math.round(Number(payload.amount) * 100) / 100;
  const frequency = payload.frequency === "monthly" ? "monthly" : "once";
  const locale = payload.locale === "en" ? "en" : "ar";

  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount < MIN_USD || amount > MAX_USD) {
    return NextResponse.json({ error: `Amount must be between $${MIN_USD} and $${MAX_USD}` }, { status: 400 });
  }

  const orderId = `don-${randomUUID()}`;
  const donatePath = locale === "en" ? "/en/donate" : "/donate";

  let invoice;
  try {
    invoice = await createInvoice({
      priceAmount: amount,
      orderId,
      orderDescription: `Motqen donation (${frequency}) - $${amount}`,
      ipnCallbackUrl: `${SITE_URL}/api/nowpayments/ipn`,
      successUrl: `${SITE_URL}${donatePath}?crypto=success`,
      cancelUrl: `${SITE_URL}${donatePath}?crypto=cancelled`,
    });
  } catch (err) {
    console.error("donate/crypto: invoice creation failed", err);
    return NextResponse.json({ error: "Could not create the payment" }, { status: 502 });
  }

  // Record the pending donation. A DB failure must not block the donor from paying.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { error } = await createAdminClient().from("donations").insert({
      order_id: orderId,
      name,
      email,
      amount_usd: amount,
      frequency,
      invoice_id: invoice.id,
    });
    if (error) console.error("donate/crypto: failed to record donation", error);
  }

  return NextResponse.json({ url: invoice.invoice_url });
}
