"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentOutcomeView } from "../../components";
import { admissionKeys } from "../../services/admissionService";
import { installPaymentTraceConsoleHelper, logPayment } from "@/lib/payment-debug";
import {
	clearPendingAdmissionPaymentType,
	findPaymentIntent,
	forgetPaymentIntent,
	getPendingAdmissionPaymentType,
} from "@/lib/program-payment-context";
import {
	displayReference,
	feeTypeFromReference,
	normaliseFeeType,
	verifyParamsFrom,
	verifyPayment,
	type FeeType,
	type VerifyOutcome,
	type VerifyResult,
} from "@/lib/payment-verification";
import { COURSE_ENROLLMENT_PATH } from "../course-enrollment/_services/enrollment-service";

/*
 * Return page for every TransactPay checkout. Rules from the backend
 * (docs/from-backend/VERIFY_RESPONSES.md):
 *  - Always call verify; ignore status/errorMessage on the URL.
 *  - Any verify endpoint verifies any fee, and the reply's payment_type says
 *    which — so an unresolved fee is never a dead end, and the amount is
 *    never used to guess.
 *  - The reply's `status` picks the screen.
 */

const TITLES: Record<FeeType, string> = {
	application: "Application Fee Payment",
	acceptance: "Acceptance Fee Payment",
	tuition: "Tuition Payment",
	access: "Course Access Fee",
};

/** Re-check a pending payment this often, this many times, before leaving it to the button. */
const PENDING_POLL_MS = 30_000;
const PENDING_MAX_POLLS = 10;

/** Outcomes that won't change on retry — the local intent can be dropped. */
const SETTLED: VerifyOutcome[] = ["paid", "failed", "needs_attention", "amount_mismatch", "unknown_reference", "ignored"];

/** Only same-origin relative paths. */
function safeRedirect(value: string | null | undefined): string | null {
	if (value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
	return null;
}

function destinationFor(fee: FeeType, redirectParam: string | null, paid: boolean): string {
	if (fee !== "access") return "/process-admission";
	const base = safeRedirect(redirectParam) ?? COURSE_ENROLLMENT_PATH;
	return paid ? `${base}${base.includes("?") ? "&" : "?"}access=granted` : base;
}

function VerifyPaymentContent() {
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();

	const params = useMemo(() => verifyParamsFrom(searchParams), [searchParams]);
	const reference = displayReference(params);
	const redirectParam = searchParams.get("redirect");

	// Best guess of the fee, only to pick an endpoint — the reply has the final say.
	const guessed = useMemo<{ fee: FeeType; via: string }>(() => {
		const fromQuery = normaliseFeeType(searchParams.get("payment_type") ?? searchParams.get("fee_type"));
		if (fromQuery) return { fee: fromQuery, via: "query param" };

		const fromRef = feeTypeFromReference(params.transRef, params.reference, params.trans_ref, params.merchant_reference);
		if (fromRef) return { fee: fromRef, via: "reference prefix" };

		const intent = findPaymentIntent(params.transRef, params.reference);
		if (intent) return { fee: intent.type, via: "reference ledger" };

		const pending = getPendingAdmissionPaymentType();
		if (pending) return { fee: pending, via: "pending slot" };

		return { fee: "application", via: "default (backend resolves the fee)" };
	}, [searchParams, params]);

	useEffect(() => {
		installPaymentTraceConsoleHelper();
		logPayment("callback:params", {
			url: typeof window !== "undefined" ? window.location.href : "",
			params: Object.fromEntries(searchParams.entries()),
			resolved: guessed,
		});
	}, [searchParams, guessed]);

	const query = useQuery<VerifyResult>({
		queryKey: ["verify-payment", guessed.fee, reference],
		enabled: !!reference,
		queryFn: async () => {
			const result = await verifyPayment(guessed.fee, params);
			logPayment("verify:response", { fee: guessed.fee, reference, result });
			if (result.success) {
				// Backend: "Refresh the profile". Also unlocks /course-enrollment.
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: admissionKeys.all }),
					queryClient.invalidateQueries({ queryKey: ["course-enrollment"] }),
				]);
			}
			return result;
		},
		// Network failures only — HTTP answers never throw.
		retry: 2,
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		refetchInterval: (q) =>
			q.state.data?.outcome === "pending" && q.state.dataUpdateCount < PENDING_MAX_POLLS ? PENDING_POLL_MS : false,
	});

	// A network failure after retries is shown as the "error" outcome (retry, don't pay again).
	const result: VerifyResult | undefined =
		query.data ??
		(query.isError
			? { outcome: "error", success: false, reference, feeType: null, amount: null, message: null, httpStatus: 0 }
			: !reference
				? { outcome: "missing_reference", success: false, reference: null, feeType: null, amount: null, message: null, httpStatus: 0 }
				: undefined);

	const outcome = result?.outcome;
	useEffect(() => {
		if (!outcome || !SETTLED.includes(outcome)) return;
		clearPendingAdmissionPaymentType();
		forgetPaymentIntent(params.transRef, params.reference);
	}, [outcome, params.transRef, params.reference]);

	const fee = result?.feeType ?? guessed.fee;
	const paid = outcome === "paid";

	return (
		<PaymentOutcomeView
			title={TITLES[fee]}
			isLoading={!!reference && query.isLoading}
			result={result}
			reference={reference}
			continueTo={destinationFor(fee, redirectParam, paid)}
			continueLabel={fee === "access" ? "Go to my courses" : "Continue admission"}
			onRetry={() => query.refetch()}
			isRetrying={query.isFetching}
		/>
	);
}

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
