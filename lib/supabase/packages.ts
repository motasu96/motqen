import { SupabaseClient } from "@supabase/supabase-js";

export type PackageRow = {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  lessons_count: number;
  price_usd: number;
  validity_days: number;
  is_active: boolean;
  sort_order: number;
};

export type PackageInput = {
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  lessons_count: number;
  price_usd: number;
  validity_days: number;
  is_active: boolean;
  sort_order: number;
};

export type PaymentMethod = "whatsapp" | "cash" | "paypal" | "gift" | "other";
export const PAYMENT_METHODS: PaymentMethod[] = ["whatsapp", "cash", "paypal", "gift", "other"];

export type StudentPackageRow = {
  id: string;
  studentId: string;
  studentName: string;
  packageName: string;
  lessonsTotal: number;
  lessonsUsed: number;
  pricePaid: number;
  paymentMethod: PaymentMethod;
  status: "active" | "void";
  activatedAt: string;
  expiresAt: string;
  note: string | null;
};

export type StudentOption = { id: string; name: string; email: string };

// What the admin sees for a subscription: voided, used up, expired, or live.
export type SubscriptionState = "active" | "void" | "exhausted" | "expired";

export function subscriptionState(p: Pick<StudentPackageRow, "status" | "lessonsTotal" | "lessonsUsed" | "expiresAt">): SubscriptionState {
  if (p.status === "void") return "void";
  if (p.lessonsUsed >= p.lessonsTotal) return "exhausted";
  if (new Date(p.expiresAt).getTime() <= Date.now()) return "expired";
  return "active";
}

const PACKAGE_COLUMNS =
  "id, name, name_en, description, description_en, lessons_count, price_usd, validity_days, is_active, sort_order";

// Every package, active or not (an admin session; everyone else only ever
// sees the active ones through Row Level Security).
export async function listAllPackages(supabase: SupabaseClient): Promise<PackageRow[]> {
  const { data } = await supabase
    .from("packages")
    .select(PACKAGE_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return ((data ?? []) as PackageRow[]).map((p) => ({ ...p, price_usd: Number(p.price_usd) }));
}

export async function savePackage(supabase: SupabaseClient, input: PackageInput, id?: string): Promise<boolean> {
  const { error } = id
    ? await supabase.from("packages").update(input).eq("id", id)
    : await supabase.from("packages").insert(input);
  return !error;
}

export async function setPackageActive(supabase: SupabaseClient, id: string, isActive: boolean): Promise<boolean> {
  const { error } = await supabase.from("packages").update({ is_active: isActive }).eq("id", id);
  return !error;
}

// Students who already bought it keep their snapshot, so deleting a package
// only removes it from the catalogue.
export async function deletePackage(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await supabase.from("packages").delete().eq("id", id);
  return !error;
}

export async function listStudentOptions(supabase: SupabaseClient): Promise<StudentOption[]> {
  const { data } = await supabase
    .from("students")
    .select("id, email, profiles(full_name)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((s) => {
    const profile = s.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    return { id: s.id as string, name: name || "", email: (s.email as string | null) ?? "" };
  });
}

export async function listStudentPackages(supabase: SupabaseClient, limit = 300): Promise<StudentPackageRow[]> {
  const { data } = await supabase
    .from("student_packages")
    .select(
      "id, student_id, package_name, lessons_total, lessons_used, price_paid, payment_method, status, activated_at, expires_at, note, profiles!student_packages_student_id_fkey(full_name)"
    )
    .order("activated_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => {
    const profile = r.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    return {
      id: r.id as string,
      studentId: r.student_id as string,
      studentName: name || "",
      packageName: r.package_name as string,
      lessonsTotal: r.lessons_total as number,
      lessonsUsed: r.lessons_used as number,
      pricePaid: Number(r.price_paid),
      paymentMethod: r.payment_method as PaymentMethod,
      status: r.status as "active" | "void",
      activatedAt: r.activated_at as string,
      expiresAt: r.expires_at as string,
      note: (r.note as string | null) ?? null,
    };
  });
}

// Admin-only: snapshots the package, sets the expiry and records who did it
// (see activate_student_package in migration 0034).
export async function activateStudentPackage(
  supabase: SupabaseClient,
  params: { studentId: string; packageId: string; paymentMethod: PaymentMethod; price: number | null; note: string | null }
): Promise<boolean> {
  const { error } = await supabase.rpc("activate_student_package", {
    p_student_id: params.studentId,
    p_package_id: params.packageId,
    p_payment_method: params.paymentMethod,
    p_price: params.price,
    p_note: params.note,
  });
  return !error;
}

export async function voidStudentPackage(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await supabase.from("student_packages").update({ status: "void" }).eq("id", id);
  return !error;
}

// ---- Student side -------------------------------------------------------

export type BookingCredit = {
  lessonsLeft: number;
  nextExpiry: string | null;
  trialAvailable: boolean;
};

// The signed-in student's own balance (my_booking_credit in migration 0034).
// Returns null when it can't be read — notably before that migration has been
// run — so callers fall back to the old behaviour instead of blocking booking.
export async function getMyBookingCredit(supabase: SupabaseClient): Promise<BookingCredit | null> {
  const { data, error } = await supabase.rpc("my_booking_credit");
  if (error) return null;
  const row = (Array.isArray(data) ? data[0] : data) as
    | { lessons_left: number | null; next_expiry: string | null; trial_available: boolean | null }
    | null
    | undefined;
  if (!row) return null;
  return {
    lessonsLeft: row.lessons_left ?? 0,
    nextExpiry: row.next_expiry ?? null,
    trialAvailable: Boolean(row.trial_available),
  };
}

export function canBook(credit: BookingCredit | null): boolean {
  // Unknown balance (migration not run yet): don't block.
  return credit === null || credit.lessonsLeft > 0 || credit.trialAvailable;
}

// The packages on offer. Row Level Security only ever returns the active ones
// to a non-admin, but filter anyway so an admin's view matches the public one.
export async function listActivePackages(supabase: SupabaseClient): Promise<PackageRow[]> {
  const { data } = await supabase
    .from("packages")
    .select(PACKAGE_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return ((data ?? []) as PackageRow[]).map((p) => ({ ...p, price_usd: Number(p.price_usd) }));
}

export function pricePerLesson(p: Pick<PackageRow, "price_usd" | "lessons_count">): number {
  return Math.round((p.price_usd / p.lessons_count) * 100) / 100;
}
