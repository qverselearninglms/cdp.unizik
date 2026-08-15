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
import {
	clearPendingAdmissionPaymentType,
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
 * Credo returns transAmount in the same unit as your payment initiation.
 * If amounts don't match, also try dividing by 100 (kobo → naira fallback).
 */
function resolvePaymentType(transAmount: string | null, pendingType: PaymentTypeConfig | null): PaymentTypeConfig | null {
	if (pendingType) return pendingType;
	if (!transAmount) return null;

	const raw = parseFloat(transAmount);
	if (isNaN(raw)) return null;

	// Try both the raw value and kobo-divided value
	const candidates = [raw, raw / 100];

	const sorted = [...PAYMENT_TYPES].sort((a, b) => b.baseAmount - a.baseAmount);

	for (const amount of candidates) {
		for (const config of sorted) {
			if (amount >= config.baseAmount && amount <= config.baseAmount * 1.05) {
				return config;
			}
		}
	}

	return null;
}

// ─── Per-type Verification Wrappers ─────────────────────────────────────────
// Each wrapper calls the correct React Query hook (hooks can't be conditional)

function VerifyApplication({ reference }: { reference: string }) {
	const { data, isLoading, error } = useVerifyApplicationPayment(reference);
	useEffect(() => {
		clearPendingAdmissionPaymentType();
	}, []);
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

function VerifyAcceptance({ reference }: { reference: string }) {
	const { data, isLoading, error } = useVerifyAcceptanceFeePayment(reference);
	useEffect(() => {
		clearPendingAdmissionPaymentType();
	}, []);
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
	useEffect(() => {
		clearPendingAdmissionPaymentType();
	}, []);
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
	const explicitType = searchParams.get("payment_type") ?? searchParams.get("fee_type");
	const selectedProgramFee = getSelectedProgramPaymentInfo();
	console.log("Payment verification params", { reference, transAmount });

	const paymentType = useMemo(() => {
		const dynamicTypes: PaymentTypeConfig[] = PAYMENT_TYPES.map((item) => {
			if (item.type === "access") {
				return {
					...item,
					baseAmount: selectedProgramFee?.accessFeeAmount ?? item.baseAmount,
				};
			}

			if (item.type === "tuition") {
				return {
					...item,
					baseAmount: selectedProgramFee?.tuitionAmount ?? item.baseAmount,
				};
			}

			return item;
		});

		const pending = getPendingAdmissionPaymentType();
		const requestedType = (explicitType ?? pending) as PaymentType | null;
		const fromRequested = requestedType
			? dynamicTypes.find((item) => item.type === requestedType) ?? null
			: null;

		if (fromRequested) return fromRequested;

		if (!transAmount) return null;
		const raw = parseFloat(transAmount);
		if (isNaN(raw)) return null;

		const candidates = [raw, raw / 100];
		const sorted = [...dynamicTypes].sort((a, b) => b.baseAmount - a.baseAmount);

		for (const amount of candidates) {
			for (const config of sorted) {
				if (amount >= config.baseAmount && amount <= config.baseAmount * 1.05) {
					return config;
				}
			}
		}

		return resolvePaymentType(transAmount, null);
	}, [explicitType, transAmount, selectedProgramFee]);
	console.log("paymentType", paymentType);

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
		case "access":
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