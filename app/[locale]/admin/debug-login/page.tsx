"use client";

import { useState } from "react";
import Logo from "@/components/Logo";

export default function DebugLoginPage() {
  const [email, setEmail] = useState("motastock96@gmail.com");
  const [password, setPassword] = useState("Teacher123");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/debug-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      setResult(JSON.stringify({ httpStatus: res.status, ...body }, null, 2));
    } catch (err) {
      setResult(String(err));
    }
    setLoading(false);
  }

  return (
    <div className="container-page flex min-h-screen flex-col items-center gap-6 py-16">
      <Logo />
      <div className="card w-full max-w-xl p-6">
        <h1 className="mb-4 text-lg font-extrabold text-ink">تشخيص تسجيل الدخول (مؤقت)</h1>
        <div className="flex flex-col gap-3">
          <input className="input" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
          <input className="input" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
          <button onClick={run} disabled={loading} className="btn-primary disabled:opacity-70">
            {loading ? "جارٍ الفحص..." : "فحص"}
          </button>
        </div>
        {result && (
          <pre dir="ltr" className="mt-5 max-h-[60vh] overflow-auto rounded-xl bg-bg p-4 text-xs text-ink">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
