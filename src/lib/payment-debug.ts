/**
 * Payment flow tracing.
 *
 * A payment crosses two page loads and an external domain, so the console is
 * cleared halfway through and the interesting half — the callback — arrives on
 * a page you did not start on. Every entry is therefore mirrored into
 * localStorage, so the whole trail can be read *after* the round trip.
 *
 * Enabled automatically outside production. To trace a live payment, run this
 * in the console on the site first:
 *
 *     localStorage.setItem('cdp_debug_payments', '1')
 *
 * Then, after returning from the gateway:
 *
 *     __cdpPaymentLog()          // pretty table of the whole trail
 *     __cdpPaymentLog.raw()      // the entries as objects
 *     __cdpPaymentLog.clear()    // start a fresh trace
 */

const TRACE_KEY = "cdp_payment_debug";
const DEBUG_FLAG_KEY = "cdp_debug_payments";
const MAX_ENTRIES = 60;

export type PaymentStage =
  | "initiate:request"
  | "initiate:response"
  | "initiate:error"
  | "intent:saved"
  | "callback:params"
  | "callback:resolved"
  | "callback:unresolved"
  | "verify:response"
  | "verify:error";

export interface PaymentTraceEntry {
  at: string;
  stage: PaymentStage;
  origin: string;
  detail: unknown;
}

function isEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV !== "production") return true;

  try {
    return window.localStorage.getItem(DEBUG_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

function readTrace(): PaymentTraceEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(TRACE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Strip anything that should not be written to disk, and drop unserialisable values. */
function safeDetail(detail: unknown): unknown {
  try {
    return JSON.parse(
      JSON.stringify(detail, (key, value) => {
        if (/token|secret|password|authorization/i.test(key)) return "<redacted>";
        return value;
      })
    );
  } catch {
    return String(detail);
  }
}

export function logPayment(stage: PaymentStage, detail: unknown): void {
  if (!isEnabled()) return;

  const entry: PaymentTraceEntry = {
    at: new Date().toISOString(),
    stage,
    origin: typeof window !== "undefined" ? window.location.origin : "",
    detail: safeDetail(detail),
  };

  const style = stage.startsWith("verify:error") || stage.endsWith("unresolved") || stage.endsWith("error")
    ? "color:#b3261e;font-weight:600"
    : "color:#1f4e8c;font-weight:600";

  console.log(`%c[payment] ${stage}`, style, entry.detail);

  try {
    window.localStorage.setItem(
      TRACE_KEY,
      JSON.stringify([...readTrace(), entry].slice(-MAX_ENTRIES))
    );
  } catch {
    // Storage full or blocked — the console line already went out.
  }
}

export function getPaymentTrace(): PaymentTraceEntry[] {
  return readTrace();
}

export function clearPaymentTrace(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TRACE_KEY);
  } catch {
    // ignored
  }
}

/** Expose the reader on window so the trail can be pulled up from the console. */
export function installPaymentTraceConsoleHelper(): void {
  if (typeof window === "undefined") return;

  const helper = () => {
    const trace = readTrace();
    if (trace.length === 0) {
      console.log("[payment] no trace recorded on this origin");
      return trace;
    }

    console.table(
      trace.map((e) => ({
        at: e.at.slice(11, 23),
        stage: e.stage,
        origin: e.origin,
        detail: JSON.stringify(e.detail),
      }))
    );
    return trace;
  };

  helper.raw = readTrace;
  helper.clear = clearPaymentTrace;

  (window as unknown as Record<string, unknown>).__cdpPaymentLog = helper;
}
