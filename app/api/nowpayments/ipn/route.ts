import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { isValidIpnSignature } from "@/lib/nowpayments";
import { createAdminClient } from "@/lib/supabase/admin";

const OWNER_EMAIL = "info@motqen.site";

type IpnPayload = {
  payment_id?: number | string;
  payment_status?: string;
  order_id?: string;
  pay_currency?: string;
  actually_paid?: number;
  price_amount?: number;
};

// NOWPayments calls this whenever a donation payment changes status
// (waiting → confirming → confirmed → finished, or failed/expired/partially_paid).
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let payload: IpnPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid body", { status: 400 });
  }

  if (!isValidIpnSignature(payload, request.headers.get("x-nowpayments-sig"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const orderId = payload.order_id;
  const status = payload.payment_status ?? "unknown";
  if (!orderId || !orderId.startsWith("don-")) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("nowpayments/ipn:", orderId, status);
    return NextResponse.json({ ok: true });
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("donations")
    .select("status, name, email, amount_usd, frequency")
    .eq("order_id", orderId)
    .maybeSingle();

  const { error } = await supabase
    .from("donations")
    .update({
      status,
      payment_id: payload.payment_id != null ? String(payload.payment_id) : null,
      pay_currency: payload.pay_currency ?? null,
      actually_paid: payload.actually_paid ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  if (error) {
    console.error("nowpayments/ipn: failed to update donation", error);
    // Non-2xx makes NOWPayments retry the notification later.
    return new NextResponse("DB error", { status: 500 });
  }

  // Notify the team once, the first time a donation is fully paid.
  if (status === "finished" && existing && existing.status !== "finished" && process.env.RESEND_API_KEY) {
    try {
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: "متقن | Motqen <info@motqen.site>",
        to: OWNER_EMAIL,
        replyTo: existing.email,
        subject: `تبرع جديد بالعملات الرقمية: $${existing.amount_usd}`,
        html: `<div dir="rtl" style="font-family:sans-serif">
          <h2>وصل تبرع جديد عبر NOWPayments</h2>
          <p><b>الاسم:</b> ${escapeHtml(existing.name)}</p>
          <p><b>البريد:</b> ${escapeHtml(existing.email)}</p>
          <p><b>المبلغ:</b> $${existing.amount_usd} (${existing.frequency === "monthly" ? "شهري" : "مرة واحدة"})</p>
          <p><b>العملة المدفوعة:</b> ${escapeHtml(String(payload.actually_paid ?? ""))} ${escapeHtml(payload.pay_currency ?? "")}</p>
          <p><b>رقم الطلب:</b> ${escapeHtml(orderId)}</p>
        </div>`,
      });
    } catch (err) {
      console.error("nowpayments/ipn: failed to send notification email", err);
    }
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
