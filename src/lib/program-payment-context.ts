export const SELECTED_PROGRAM_PAYMENT_KEY = "cdp_selected_program_payment";
export const PENDING_ADMISSION_PAYMENT_KEY = "cdp_pending_admission_payment_type";

export type PendingAdmissionPaymentType = "access" | "acceptance" | "tuition";

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