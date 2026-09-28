export const SELECTED_PROGRAM_PAYMENT_KEY = "cdp_selected_program_payment";
export const PENDING_ADMISSION_PAYMENT_KEY = "cdp_pending_admission_payment_type";
export const PAYMENT_INTENT_LEDGER_KEY = "cdp_payment_intents";

export type PendingAdmissionPaymentType = "access" | "acceptance" | "tuition";

/**
 * What we knew about a payment at the moment we handed the user to the gateway,
 * keyed by the gateway reference so it can be recovered on the callback.
 *
 * The single "pending type" slot below cannot survive a refresh of the verify
 * page, a second payment started in another tab, or a user returning to an old
 * callback link — this ledger can, because the reference comes back in the URL.
 */
export interface PaymentIntentRecord {
  reference: string;
  type: PendingAdmissionPaymentType;
  amount: number | null;
  programId: number | null;
  programName: string | null;
  createdAt: string;
}

/** Keep the ledger small — it only exists to resolve recent callbacks. */
const MAX_INTENTS = 20;

function readIntents(): PaymentIntentRecord[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(PAYMENT_INTENT_LEDGER_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is PaymentIntentRecord =>
        !!item &&
        typeof item.reference === "string" &&
        (item.type === "access" || item.type === "acceptance" || item.type === "tuition")
    );
  } catch {
    return [];
  }
}

/** Record the fee type against its gateway reference before leaving for the gateway. */
export function rememberPaymentIntent(record: {
  reference: string;
  type: PendingAdmissionPaymentType;
  amount?: number | null;
  programId?: number | null;
  programName?: string | null;
}): void {
  if (typeof window === "undefined") return;
  if (!record.reference) return;

  const entry: PaymentIntentRecord = {
    reference: record.reference,
    type: record.type,
    amount: parseAmount(record.amount),
    programId: typeof record.programId === "number" ? record.programId : null,
    programName: typeof record.programName === "string" ? record.programName : null,
    createdAt: new Date().toISOString(),
  };

  const next = [entry, ...readIntents().filter((i) => i.reference !== entry.reference)].slice(
    0,
    MAX_INTENTS
  );

  try {
    window.localStorage.setItem(PAYMENT_INTENT_LEDGER_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked (private mode) — the other resolution paths still apply.
  }
}

/**
 * Look the intent up by any reference the callback carries.
 *
 * Credo returns BOTH `reference` (the merchant reference we initiated with) and
 * `transRef` (its own transaction reference), and which one matches what the
 * backend handed us at initiation is not guaranteed — so try every candidate
 * rather than betting on one.
 */
export function findPaymentIntent(
  ...references: Array<string | null | undefined>
): PaymentIntentRecord | null {
  const candidates = references.filter((r): r is string => !!r);
  if (candidates.length === 0) return null;

  const intents = readIntents();
  for (const reference of candidates) {
    const match = intents.find((i) => i.reference === reference);
    if (match) return match;
  }

  return null;
}

export function forgetPaymentIntent(...references: Array<string | null | undefined>): void {
  if (typeof window === "undefined") return;

  const drop = new Set(references.filter((r): r is string => !!r));
  if (drop.size === 0) return;

  const next = readIntents().filter((i) => !drop.has(i.reference));
  try {
    window.localStorage.setItem(PAYMENT_INTENT_LEDGER_KEY, JSON.stringify(next));
  } catch {
    // ignored
  }
}

export interface SelectedProgramPaymentInfo {
  programId: number;
  programName: string;
  accessFeeAmount: number | null;
  tuitionAmount: number | null;
  accessFeeLabel: string | null;
  tuitionLabel: string | null;
  duration: string | null;
  updatedAt: string;
}

function parseAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }

  if (typeof value === "string") {
    const stripped = value.replace(/[^\d.]/g, "").trim();
    if (!stripped) return null;

    const numeric = Number(stripped);
    if (!Number.isFinite(numeric)) return null;
    return Math.max(0, Math.round(numeric));
  }

  return null;
}

export function toAmount(value: unknown): number | null {
  return parseAmount(value);
}

export function saveSelectedProgramPaymentInfo(info: SelectedProgramPaymentInfo): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTED_PROGRAM_PAYMENT_KEY, JSON.stringify(info));
}

export function getSelectedProgramPaymentInfo(): SelectedProgramPaymentInfo | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SELECTED_PROGRAM_PAYMENT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<SelectedProgramPaymentInfo>;
    if (typeof parsed.programId !== "number" || typeof parsed.programName !== "string") {
      return null;
    }

    return {
      programId: parsed.programId,
      programName: parsed.programName,
      accessFeeAmount: parseAmount(parsed.accessFeeAmount),
      tuitionAmount: parseAmount(parsed.tuitionAmount),
      accessFeeLabel: typeof parsed.accessFeeLabel === "string" ? parsed.accessFeeLabel : null,
      tuitionLabel: typeof parsed.tuitionLabel === "string" ? parsed.tuitionLabel : null,
      duration: typeof parsed.duration === "string" ? parsed.duration : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function setPendingAdmissionPaymentType(type: PendingAdmissionPaymentType): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_ADMISSION_PAYMENT_KEY, type);
}

export function getPendingAdmissionPaymentType(): PendingAdmissionPaymentType | null {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(PENDING_ADMISSION_PAYMENT_KEY);
  if (value === "access" || value === "acceptance" || value === "tuition") {
    return value;
  }

  return null;
}

export function clearPendingAdmissionPaymentType(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_ADMISSION_PAYMENT_KEY);
}