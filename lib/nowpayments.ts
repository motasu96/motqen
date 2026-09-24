import { createHmac, timingSafeEqual } from "node:crypto";

// Server-only helpers for NOWPayments (crypto donations).
// Env: NOWPAYMENTS_API_KEY, NOWPAYMENTS_IPN_SECRET.

const API_BASE = "https://api.nowpayments.io/v1";

export type NowPaymentsInvoice = {
  id: string;
  invoice_url: string;
};

export async function createInvoice(params: {
  priceAmount: number;
  orderId: string;
  orderDescription: string;
  ipnCallbackUrl: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<NowPaymentsInvoice> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error("NOWPAYMENTS_API_KEY is not configured");

  const res = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      price_amount: params.priceAmount,
      price_currency: "usd",
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: params.ipnCallbackUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.invoice_url) {
    throw new Error(`NOWPayments invoice failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return { id: String(data.id), invoice_url: data.invoice_url };
}

// NOWPayments signs the IPN body as HMAC-SHA512 over JSON with keys sorted
// alphabetically (recursively), sent in the `x-nowpayments-sig` header.
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export function isValidIpnSignature(payload: unknown, signature: string | null): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha512", secret).update(JSON.stringify(sortKeys(payload))).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
