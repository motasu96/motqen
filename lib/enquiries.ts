import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface EnquiryStore {
  /** Returns false (without writing) if a record with this id already exists. */
  insert(record: EnquiryRecord): Promise<{ saved: boolean }>;
}

interface D1LikeDatabase {
  prepare(query: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
      first<T = unknown>(): Promise<T | null>;
    };
  };
}

class D1EnquiryStore implements EnquiryStore {
  constructor(private readonly db: D1LikeDatabase) {}

  async insert(record: EnquiryRecord): Promise<{ saved: boolean }> {
    const existing = await this.db
      .prepare("SELECT id FROM enquiries WHERE id = ?")
      .bind(record.id)
      .first();
    if (existing) return { saved: false };

    await this.db
      .prepare(
        "INSERT INTO enquiries (id, name, email, message, created_at) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(record.id, record.name, record.email, record.message, record.createdAt)
      .run();
    return { saved: true };
  }
}

/**
 * Local substitute for D1, used in dev and in tests where no Cloudflare
 * binding is available. Backed by a single JSON file so a test can inspect
 * what was "saved" without standing up a real database.
 */
class LocalFileEnquiryStore implements EnquiryStore {
  constructor(private readonly filePath: string) {}

  private async readAll(): Promise<EnquiryRecord[]> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as EnquiryRecord[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  async insert(record: EnquiryRecord): Promise<{ saved: boolean }> {
    const all = await this.readAll();
    if (all.some((r) => r.id === record.id)) return { saved: false };

    await mkdir(path.dirname(this.filePath), { recursive: true });
    all.push(record);
    await writeFile(this.filePath, JSON.stringify(all, null, 2));
    return { saved: true };
  }
}

/** Throws on every insert. Used by tests to simulate a storage failure. */
class FailingEnquiryStore implements EnquiryStore {
  async insert(): Promise<{ saved: boolean }> {
    throw new Error("Simulated storage failure.");
  }
}

export function createEnquiryId(): string {
  return randomUUID();
}

interface CloudflareEnv {
  DB?: D1LikeDatabase;
}

/**
 * Resolves the enquiry store for the current runtime:
 * - a forced failure when ENQUIRIES_LOCAL_DB_PATH is set to "FORCE_FAIL"
 *   (checked first so tests can simulate a storage failure even when a
 *   local D1 binding is otherwise available),
 * - a real D1 binding when one is present (Cloudflare Workers, and local
 *   dev/test via the D1 binding declared in wrangler.jsonc),
 * - a local JSON file otherwise.
 */
export async function getEnquiryStore(env?: CloudflareEnv): Promise<EnquiryStore> {
  const localPath = process.env.ENQUIRIES_LOCAL_DB_PATH ?? ".data/enquiries.local.json";
  if (localPath === "FORCE_FAIL") return new FailingEnquiryStore();

  if (env?.DB) return new D1EnquiryStore(env.DB);

  // Local-only fallback (no Cloudflare context at all) — never reached once
  // a D1 binding is present, so this dynamic path never ships in the Worker build.
  return new LocalFileEnquiryStore(path.resolve(/* turbopackIgnore: true */ process.cwd(), localPath));
}
