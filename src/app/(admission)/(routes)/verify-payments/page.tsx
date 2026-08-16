"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentVerificationView } from "../../components";
import {
	useVerifyApplicationPayment,
	useVerifyAcceptanceFeePayment,
	useVerifyTuitionPayment,
} from "../../hooks/useAdmissionQueries";
import {
	APPLICATION_FEE_AMOUNT,
	ACCEPTANCE_FEE_AMOUNT,
	FULL_TUITION_FEE_AMOUNT,
} from "@/config/global.config";
import { installPaymentTraceConsoleHelper, logPayment } from "@/lib/payment-debug";
import {
	clearPendingAdmissionPaymentType,
	findPaymentIntent,
	forgetPaymentIntent,
	getPendingAdmissionPaymentType,
	getSelectedProgramPaymentInfo,
} from "@/lib/program-payment-context";

// ─── Payment Type Resolution ────────────────────────────────────────────────
type PaymentType = "access" | "acceptance" | "tuition";

interface PaymentTypeConfig {
	type: PaymentType;
	title: string;
	/** Base fee amount (before gateway processor fees) */
	baseAmount: number;
}

const PAYMENT_TYPES: PaymentTypeConfig[] = [
	{ type: "access", title: "Verifying Access Fee Payment", baseAmount: APPLICATION_FEE_AMOUNT },
	{ type: "acceptance", title: "Verifying Acceptance Fee Payment", baseAmount: ACCEPTANCE_FEE_AMOUNT },
	{ type: "tuition", title: "Verifying Tuition Payment", baseAmount: FULL_TUITION_FEE_AMOUNT },
];

/**
 * Accept either spelling of the fee type on the callback: our own short form
 * (`access`) and the backend's payload form (`access_fee`).
 */
function normalisePaymentType(value: string | null | undefined): PaymentType | null {
	switch ((value ?? "").trim().toLowerCase()) {
		case "access":
		case "access_fee":
		case "application":
		case "application_fee":
			return "access";
		case "acceptance":
		case "acceptance_fee":
			return "acceptance";
		case "tuition":
		case "tuition_fee":
			return "tuition";
		default:
			return null;
	}
}

/**
 * Amount matching is the LAST resort, and a deliberately strict one.
 *
 * The static fee constants are org-wide defaults, not this student's programme
 * fees, so an amount can easily match nothing (a ₦500,000 tuition against a
 * ₦195,000 default) or — worse — match the wrong fee when two fees share a
 * figure. Ambiguity therefore returns null rather than guessing: verifying a
 * payment as the wrong fee type is a far more expensive mistake than asking the
 * student to retry.
 *
 * Credo returns transAmount in the same unit as the initiation, so the kobo
 * fallback (÷100) is tried too.
 */
function resolveByAmount(
	transAmount: string | null,
	processorFee: string | null,
	types: PaymentTypeConfig[]
): PaymentTypeConfig | null {
	if (!transAmount) return null;

	const raw = parseFloat(transAmount);
	if (isNaN(raw)) return null;

	// transAmount is gross — Credo reports its cut separately as processorFee,
	// so the fee the student was actually charged is the difference.
	const fee = parseFloat(processorFee ?? "");
	const net = isNaN(fee) ? raw : raw - fee;

	for (const amount of [net, raw, net / 100, raw / 100]) {
		// Symmetric tolerance: gateways add processor fees, and some settle slightly under.
		const matches = types.filter(
			(config) =>
				config.baseAmount > 0 &&
				amount >= config.baseAmount * 0.95 &&
				amount <= config.baseAmount * 1.05
		);

		if (matches.length === 1) return matches[0];
		if (matches.length > 1) return null; // ambiguous — never guess
	}

	return null;
}

// ─── Per-type Verification Wrappers ─────────────────────────────────────────
// Each wrapper calls the correct React Query hook (hooks can't be conditional)

/**
 * Clear the stored intent only once verification has actually come back.
 * Clearing on mount used to lose the fee type the moment the page was
 * refreshed, leaving the retry with nothing to resolve from.
 */
function useClearIntentWhenSettled(intentRefs: VerifyProps["intentRefs"], settled: boolean) {
	const [transRef, merchantRef] = intentRefs;
	useEffect(() => {
		if (!settled) return;
		clearPendingAdmissionPaymentType();
		forgetPaymentIntent(transRef, merchantRef);
	}, [transRef, merchantRef, settled]);
}

/** Trace what the verification endpoint actually answered. */
function useTraceVerification(feeType: PaymentType, reference: string, data: unknown, error: unknown) {
	useEffect(() => {
		if (data) logPayment("verify:response", { feeType, reference, data });
	}, [feeType, reference, data]);

	useEffect(() => {
		if (error) {
			logPayment("verify:error", {
				feeType,
				reference,
				message: error instanceof Error ? error.message : String(error),
			});
		}
	}, [feeType, reference, error]);
}

interface VerifyProps {
	reference: string;
	/** [transRef, reference] straight off the callback, for ledger cleanup */
	intentRefs: [string | null, string | null];
}

function VerifyApplication({ reference, intentRefs }: VerifyProps) {
	const { data, isLoading, error } = useVerifyApplicationPayment(reference);
	useTraceVerification("access", reference, data, error);
	useClearIntentWhenSettled(intentRefs, !isLoading && !!data);
	return (
		<PaymentVerificationView
			title="Verifying Access Fee Payment"
			isLoading={isLoading}
			error={error}
			data={data}
			redirectTo="/process-admission"
		/>
	);
}

function VerifyAcceptance({ reference, intentRefs }: VerifyProps) {
	const { data, isLoading, error } = useVerifyAcceptanceFeePayment(reference);
	useTraceVerification("acceptance", reference, data, error);
	useClearIntentWhenSettled(intentRefs, !isLoading && !!data);
	return (
		<PaymentVerificationView
			title="Verifying Acceptance Fee Payment"
			isLoading={isLoading}
			error={error}
			data={data}
			redirectTo="/process-admission"
		/>
	);
}

function VerifyTuition({ reference, intentRefs }: VerifyProps) {
	const { data, isLoading, error } = useVerifyTuitionPayment(reference);
	useTraceVerification("tuition", reference, data, error);
	useClearIntentWhenSettled(intentRefs, !isLoading && !!data);
	return (
		<PaymentVerificationView
			title="Verifying Tuition Payment"
			isLoading={isLoading}
			error={error}
			data={data}
			redirectTo="/process-admission"
		/>
	);
}

// ─── Unified Content ────────────────────────────────────────────────────────

function VerifyPaymentContent() {
	const searchParams = useSearchParams();
	// Credo sends both: `reference` is the merchant reference we initiated with,
	// `transRef` is its own transaction reference. Keep both — the ledger may be
	// keyed by either, depending on which one the backend returned at initiation.
	const transRef = searchParams.get("transRef");
	const merchantRef = searchParams.get("reference");
	const reference = transRef ?? merchantRef ?? "";
	const transAmount = searchParams.get("transAmount");
	const processorFee = searchParams.get("processorFee");
	const explicitType = searchParams.get("payment_type") ?? searchParams.get("fee_type");
	const selectedProgramFee = getSelectedProgramPaymentInfo();

	// Record everything the gateway sent back, before any interpretation of it.
	useEffect(() => {
		installPaymentTraceConsoleHelper();
		logPayment("callback:params", {
			url: typeof window !== "undefined" ? window.location.href : "",
			params: Object.fromEntries(searchParams.entries()),
			selectedProgramFee,
		});
		// searchParams is stable per navigation; log once per callback.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	const paymentType = useMemo(() => {
		// Prefer this student's actual programme fees over the org-wide defaults.
		const dynamicTypes: PaymentTypeConfig[] = PAYMENT_TYPES.map((item) => {
			if (item.type === "access") {
				return { ...item, baseAmount: selectedProgramFee?.accessFeeAmount ?? item.baseAmount };
			}
			if (item.type === "tuition") {
				return { ...item, baseAmount: selectedProgramFee?.tuitionAmount ?? item.baseAmount };
			}
			return item;
		});

		const byType = (type: PaymentType | null | undefined) =>
			type ? dynamicTypes.find((item) => item.type === type) ?? null : null;

		// 1. The gateway (or our own callback URL) told us outright.
		const fromQuery = byType(normalisePaymentType(explicitType));
		if (fromQuery) {
			logPayment("callback:resolved", { via: "query param", type: fromQuery.type });
			return fromQuery;
		}

		// 2. The ledger entry we wrote against this reference before redirecting.
		//    This is the path that survives refreshes and second tabs.
		const intent = findPaymentIntent(transRef, merchantRef);
		const fromLedger = byType(intent?.type);
		if (fromLedger) {
			logPayment("callback:resolved", { via: "reference ledger", type: fromLedger.type, intent });
			// The recorded amount beats any default for this specific payment.
			return intent?.amount ? { ...fromLedger, baseAmount: intent.amount } : fromLedger;
		}

		// 3. The single pending slot — only valid for the payment just started.
		const fromPending = byType(getPendingAdmissionPaymentType());
		if (fromPending) {
			logPayment("callback:resolved", { via: "pending slot", type: fromPending.type });
			return fromPending;
		}

		// 4. Last resort: match on amount, refusing to guess when ambiguous.
		const fromAmount = resolveByAmount(transAmount, processorFee, dynamicTypes);
		logPayment(fromAmount ? "callback:resolved" : "callback:unresolved", {
			via: "amount match",
			type: fromAmount?.type ?? null,
			transAmount,
			processorFee,
			comparedAgainst: dynamicTypes.map((t) => ({ type: t.type, baseAmount: t.baseAmount })),
			ledgerMiss: { transRef, merchantRef },
		});
		return fromAmount;
	}, [explicitType, transAmount, processorFee, selectedProgramFee, transRef, merchantRef]);

	if (!reference) {
		return (
			<PaymentVerificationView
				title="Payment Verification"
				isLoading={false}
				error={new Error("No payment reference found. Please retry your payment.")}
				data={undefined}
				redirectTo="/process-admission"
			/>
		);
	}

	if (!paymentType) {
		// Give support something to work with — a bare "contact support" leaves
		// both the student and the desk without the reference.
		const details = [
			reference && `Reference: ${reference}`,
			transAmount && `Amount: ₦${Number(transAmount).toLocaleString()}`,
		]
			.filter(Boolean)
			.join(" · ");

		return (
			<PaymentVerificationView
				title="Payment Verification"
				isLoading={false}
				error={
					new Error(
						`Your payment went through, but we could not tell which fee it was for, so it has not been applied yet. ` +
						`Please contact support with these details. ${details}`
					)
				}
				data={undefined}
				redirectTo="/process-admission"
			/>
		);
	}

	const intentRefs: [string | null, string | null] = [transRef, merchantRef];

	switch (paymentType.type) {
		case "access":
			return <VerifyApplication reference={reference} intentRefs={intentRefs} />;
		case "acceptance":
			return <VerifyAcceptance reference={reference} intentRefs={intentRefs} />;
		case "tuition":
			return <VerifyTuition reference={reference} intentRefs={intentRefs} />;
	}
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function VerifyPaymentsPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-[70vh] items-center justify-center">
					<div className="space-y-4 text-center">
						<Skeleton className="mx-auto h-12 w-12 rounded-full" />
						<Skeleton className="mx-auto h-4 w-48" />
					</div>
				</div>
			}
		>
			<VerifyPaymentContent />
		</Suspense>
	);
}