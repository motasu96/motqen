import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { after, before, test } from "node:test";

const ROOT = path.resolve(import.meta.dirname, "..");
const PORT = 4173;
const FAIL_PORT = PORT + 1;
const BASE_URL = `http://localhost:${PORT}`;
const FAIL_URL = `http://localhost:${FAIL_PORT}`;

let server;
let failingServer;

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`);
}

before(async () => {
  if (!existsSync(path.join(ROOT, ".next", "BUILD_ID"))) {
    const build = spawnSync("npm", ["run", "build"], { cwd: ROOT, stdio: "inherit" });
    assert.equal(build.status, 0, "production build must succeed before testing it");
  }

  // Idempotent: applies the enquiries table migration to the local D1
  // simulator that `next start` resolves via the wrangler.jsonc binding.
  const migrate = spawnSync(
    "npx",
    ["wrangler", "d1", "migrations", "apply", "emerald-portfolio-db", "--local"],
    { cwd: ROOT, stdio: "inherit" },
  );
  assert.equal(migrate.status, 0, "local D1 migration must succeed before testing the contact API");

  server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  failingServer = spawn("npx", ["next", "start", "-p", String(FAIL_PORT)], {
    cwd: ROOT,
    env: { ...process.env, ENQUIRIES_LOCAL_DB_PATH: "FORCE_FAIL" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  await Promise.all([waitForServer(BASE_URL), waitForServer(FAIL_URL)]);
});

after(() => {
  server?.kill();
  failingServer?.kill();
});

test("home page renders every documented section", async () => {
  const res = await fetch(BASE_URL);
  assert.equal(res.status, 200);

  const html = await res.text();
  assert.match(html, /<html lang="ar" dir="rtl"/);
  assert.match(html, /<title>EMERALD — ما وراء الواقع/);
  assert.match(html, /رؤية إنسانية\. إمكانيات اصطناعية\./);

  for (const id of ["studio", "visions", "design", "process", "services", "contact"]) {
    assert.match(html, new RegExp(`id="${id}"`), `missing section #${id}`);
  }

  // Selected Visions: all four category rows present.
  for (const title of [
    "شذرات من غرفة لا وجود لها",
    "أشياء ساكنة، مدروسة بعناية",
    "إشارة قبل المعنى",
    "علامة، تُمنح ثِقلاً",
  ]) {
    assert.ok(html.includes(title), `missing vision: ${title}`);
  }

  // Design Dimension: masonry cards present.
  const designCardMatches = html.match(/design-card/g) ?? [];
  assert.ok(designCardMatches.length >= 6, "expected at least 6 design-card occurrences");
});

test("contact API saves a valid enquiry", async () => {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Grace Hopper",
      email: "grace@example.com",
      message: "I'd like to commission a short generative film.",
      requestId: "22222222-2222-2222-2222-222222222222",
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.deduplicated, false);
});

test("contact API rejects invalid input with field errors", async () => {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "A", email: "nope", message: "short" }),
  });

  assert.equal(res.status, 422);
  const data = await res.json();
  const fields = data.errors.map((e) => e.field).sort();
  assert.deepEqual(fields, ["email", "message", "name"]);
});

test("contact API silently drops honeypot submissions without saving", async () => {
  // Run against the server whose store always throws on insert: a 200
  // response here can only mean the honeypot branch returned before ever
  // touching storage.
  const res = await fetch(`${FAIL_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Spam Bot",
      email: "bot@example.com",
      message: "Buy my product, it is great and cheap.",
      company: "definitely not empty",
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
});

test("contact API deduplicates a retried submission by requestId", async () => {
  const payload = {
    name: "Grace Hopper",
    email: "grace@example.com",
    message: "I'd like to commission a short generative film.",
    requestId: "22222222-2222-2222-2222-222222222222",
  };

  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.deduplicated, true);
});

test("contact API surfaces a clean error when storage fails", async () => {
  const res = await fetch(`${FAIL_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "This submission should fail to save on purpose.",
    }),
  });

  assert.equal(res.status, 500);
  const data = await res.json();
  assert.ok(data.error);
});

test("contact API rejects an oversized request body", async () => {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Big Body",
      email: "big@example.com",
      message: "x".repeat(20_000),
    }),
  });

  assert.equal(res.status, 413);
});
