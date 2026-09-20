import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { generateReply } from "@/lib/gemini";
import { sendWhatsAppText } from "@/lib/whatsapp";

// Meta calls this once to verify the webhook URL when you save it in the App Dashboard.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return true; // not configured yet; skip check rather than break the bot
  if (!signatureHeader) return false;

  const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!isValidSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  // Ignore anything that isn't an incoming text message (delivery/read receipts, etc).
  if (message?.type === "text") {
    const from = message.from as string;
    const text = message.text.body as string;

    try {
      const reply = await generateReply(text);
      await sendWhatsAppText(from, reply);
    } catch (err) {
      console.error("whatsapp-webhook: failed to generate/send reply", err);
    }
  }

  // Meta only cares that we return 200 quickly; the body is ignored.
  return new NextResponse("OK", { status: 200 });
}
