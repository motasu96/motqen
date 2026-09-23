import { NextRequest, NextResponse } from "next/server";

const MAX_MESSAGE_LENGTH = 2000;
const N8N_TIMEOUT_MS = 30000;

function extractReply(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["reply", "output", "text", "message", "answer"]) {
      if (typeof obj[key] === "string") return obj[key] as string;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Chat agent is not configured" }, { status: 501 });
  }

  let payload: { message?: unknown; sessionId?: unknown; locale?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const message = typeof payload.message === "string" ? payload.message.trim().slice(0, MAX_MESSAGE_LENGTH) : "";
  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId.slice(0, 100) : "";
  const locale = typeof payload.locale === "string" ? payload.locale.slice(0, 5) : "ar";

  if (!message || !sessionId) {
    return NextResponse.json({ error: "message and sessionId are required" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId, locale, source: "motqen-site" }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Chat agent failed to respond" }, { status: 502 });
    }

    const data = await res.json().catch(() => null);
    const reply = extractReply(data);
    if (!reply) {
      return NextResponse.json({ error: "Chat agent returned an unexpected response" }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Chat agent did not respond in time" }, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}
