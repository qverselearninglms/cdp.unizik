"use client";

import { useMemo } from "react";
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

// ─── Payment Type Resolution ────────────────────────────────────────────────
type PaymentType = "application" | "acceptance" | "tuition";

interface PaymentTypeConfig {
	type: PaymentType;
	title: string;
	/** Base fee amount (before gateway processor fees) */
	baseAmount: number;
}

const PAYMENT_TYPES: PaymentTypeConfig[] = [
	{ type: "application", title: "Verifying Application Payment", baseAmount: APPLICATION_FEE_AMOUNT },
	{ type: "acceptance", title: "Verifying Acceptance Fee Payment", baseAmount: ACCEPTANCE_FEE_AMOUNT },
	{ type: "tuition", title: "Verifying Tuition Payment", baseAmount: FULL_TUITION_FEE_AMOUNT },
];

/**
 * Resolve the payment type from the transaction amount.
 * Credo's `transAmount` includes the processor fee, so we compare
 * against each base amount with a tolerance to absorb gateway charges.
 */
function resolvePaymentType(transAmount: string | null): PaymentTypeConfig | null {
	if (!transAmount) return null;

	const amount = parseFloat(transAmount);
	if (isNaN(amount)) return null;

	// Sort descending so a higher amount can't accidentally match a lower tier
	const sorted = [...PAYMENT_TYPES].sort((a, b) => b.baseAmount - a.baseAmount);

	for (const config of sorted) {
		// transAmount >= baseAmount (processor fee makes it slightly higher)
		// and within a reasonable upper bound (base + 5 % cap)
		if (amount >= config.baseAmount && amount <= config.baseAmount * 1.05) {
			return config;
		}
	}

	return null;
}

// ─── Per-type Verification Wrappers ─────────────────────────────────────────
// Each wrapper calls the correct React Query hook (hooks can't be conditional)

function VerifyApplication({ reference }: { reference: string }) {
	const { data, isLoading, error } = useVerifyApplicationPayment(reference);
	return (
		<PaymentVerificationView
			title="Verifying Application Payment"
			isLoading={isLoading}
			error={error}
			data={data}
			redirectTo="/process-admission"
		/>
	);
}

function VerifyAcceptance({ reference }: { reference: string }) {
	const { data, isLoading, error } = useVerifyAcceptanceFeePayment(reference);
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

function VerifyTuition({ reference }: { reference: string }) {
	const { data, isLoading, error } = useVerifyTuitionPayment(reference);
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
	const reference = searchParams.get("transRef") ?? searchParams.get("reference") ?? "";
	const transAmount = searchParams.get("transAmount");

	const paymentType = useMemo(() => resolvePaymentType(transAmount), [transAmount]);

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
		return (
			<PaymentVerificationView
				title="Payment Verification"
				isLoading={false}
				error={new Error("Unable to determine payment type from the transaction amount. Please contact support.")}
				data={undefined}
				redirectTo="/process-admission"
			/>
		);
	}

	switch (paymentType.type) {
		case "application":
			return <VerifyApplication reference={reference} />;
		case "acceptance":
			return <VerifyAcceptance reference={reference} />;
		case "tuition":
			return <VerifyTuition reference={reference} />;
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