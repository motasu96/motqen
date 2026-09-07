export interface ContactFormInput {
  name: string;
  email: string;
  message: string;
  /** Honeypot field. A real visitor never fills this in. */
  company?: string;
  /** Client-generated id so a retried submission is not saved twice. */
  requestId?: string;
}

export type ContactField = "name" | "email" | "message";

export interface ContactValidationError {
  field: ContactField;
  message: string;
}

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  message: { min: 10, max: 2000 },
} as const;

/** Total request body size the API accepts, in bytes. */
export const MAX_CONTACT_BODY_BYTES = 8 * 1024;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(
  input: Partial<ContactFormInput>,
): ContactValidationError[] {
  const errors: ContactValidationError[] = [];

  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const message = (input.message ?? "").trim();

  if (name.length < CONTACT_LIMITS.name.min || name.length > CONTACT_LIMITS.name.max) {
    errors.push({
      field: "name",
      message: `الاسم يجب أن يكون بين ${CONTACT_LIMITS.name.min} و${CONTACT_LIMITS.name.max} حرفاً.`,
    });
  }

  if (!email || email.length > CONTACT_LIMITS.email.max || !EMAIL_PATTERN.test(email)) {
    errors.push({ field: "email", message: "أدخل بريداً إلكترونياً صحيحاً." });
  }

  if (message.length < CONTACT_LIMITS.message.min || message.length > CONTACT_LIMITS.message.max) {
    errors.push({
      field: "message",
      message: `الرسالة يجب أن تكون بين ${CONTACT_LIMITS.message.min} و${CONTACT_LIMITS.message.max} حرفاً.`,
    });
  }

  return errors;
}

/** A filled honeypot means the submission almost certainly isn't human. */
export function isLikelyBot(input: Partial<ContactFormInput>): boolean {
  return typeof input.company === "string" && input.company.trim().length > 0;
}

export function normalizeContact(input: ContactFormInput) {
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
  };
}
