// Mock payment service aligned with API spec
// Uses BigDecimal strings for all amounts
import type { Payment, ApplicableEventInfo, EarnedRewardInfo } from '$lib/types';
import type {
	PaymentPreviewRequest,
	PaymentPreviewResponse,
	PaymentCreateRequest,
	PaymentCreateResponse,
	PaymentStatusResponse
} from '$lib/types';
import { mockMachines } from '../data/machines';
import { getActiveEventsForMachine } from '../data/events';

// ============================================
// BIGDECIMAL UTILITY FUNCTIONS
// ============================================

/**
 * Multiply BigDecimal string by integer
 */
function multiplyBigDecimal(a: string, count: number): string {
	const result = parseFloat(a) * count;
	return result.toFixed(2);
}

// ============================================
// PAYMENT PREVIEW (API SPEC ALIGNED)
// ============================================

/**
 * Payment preview - calculates cost with applicable events
 * POST /api/v1/payment/preview
 */
export async function paymentPreview(
	request: PaymentPreviewRequest
): Promise<PaymentPreviewResponse> {
	await new Promise((resolve) => setTimeout(resolve, 300));

	const machine = mockMachines[request.machineId];
	if (!machine) {
		throw new Error(`Machine ${request.machineId} not found`);
	}

	const subtotal = multiplyBigDecimal(machine.drawCost, request.drawCount);

	// Get applicable events for this machine
	const activeEvents = getActiveEventsForMachine(request.machineId);
	const applicableEvents: ApplicableEventInfo[] = activeEvents
		.filter((event) => {
			// Check if draw count meets minimum requirement
			const meetsMinimum = !event.minimumDrawCount || request.drawCount >= event.minimumDrawCount;
			return meetsMinimum;
		})
		.map((event) => ({
			eventId: event.id,
			eventTitle: event.title,
			rewardType: event.rewardType,
			rewardDescription: event.description,
			currentProgress: {
				currentSpend: '0.00',
				targetSpend: event.rewardValue,
				currentDraws: 0,
				targetDraws: event.minimumDrawCount || 0,
				currentSpins: 0,
				targetSpins: event.minimumPurchaseSpin || 0,
				spendProgress: 0,
				drawProgress: 0,
				spinProgress: 0
			},
			willComplete: request.drawCount >= (event.minimumDrawCount || 0),
			isAlreadyCompleted: false
		}));

	// For now, total equals subtotal (no discounts applied in preview, rewards earned post-payment)
	const totalAmount = subtotal;

	return {
		machineId: machine.id,
		machineName: machine.name,
		drawCount: request.drawCount,
		pricePerDraw: machine.drawCost,
		subtotal,
		applicableEvents,
		totalAmount,
		currency: 'MYR'
	};
}

// ============================================
// PAYMENT CREATION (API SPEC ALIGNED)
// ============================================

/**
 * In-memory payment store for tracking status
 */
interface StoredPayment {
	payment: Payment;
	response: PaymentCreateResponse;
	completionTime: number;
}

const PAYMENT_STORE = new Map<string, StoredPayment>();

/**
 * Create payment - initiates Airwallex payment intent
 * POST /api/v1/payment/create
 */
export async function createPaymentIntent(
	request: PaymentCreateRequest
): Promise<PaymentCreateResponse> {
	await new Promise((resolve) => setTimeout(resolve, 800));

	const machine = mockMachines[request.machineId];
	if (!machine) {
		throw new Error(`Machine ${request.machineId} not found`);
	}

	const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
	const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
	const clientSecret = `cs_${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 18)}`;

	const amount = multiplyBigDecimal(machine.drawCost, request.drawCount);
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

	// Calculate earned rewards based on active events
	const activeEvents = getActiveEventsForMachine(request.machineId);
	const earnedRewards: EarnedRewardInfo[] = activeEvents
		.filter((event) => {
			const meetsMinimum =
				!event.minimumPurchaseSpin || request.drawCount >= event.minimumPurchaseSpin;
			return meetsMinimum && event.joinMode === 'AUTO_JOIN';
		})
		.map((event) => ({
			eventId: event.id,
			eventTitle: event.title,
			rewardType: event.rewardType,
			rewardValue: event.rewardValue,
			message: `You earned ${event.rewardType === 'EXTRA_SPIN' ? event.rewardValue + ' extra spins' : 'a voucher'}!`,
			creditsEarned: event.rewardType === 'EXTRA_SPIN' ? parseInt(event.rewardValue) : undefined,
			voucherCode: event.rewardType === 'VOUCHER' ? `VOUCHER_${event.id}_${Date.now()}` : undefined
		}));

	const response: PaymentCreateResponse = {
		paymentId,
		clientSecret,
		paymentIntentId,
		amount,
		currency: 'MYR',
		status: 'CREATED',
		expiresAt,
		earnedRewards
	};

	// Create internal payment record
	const payment: Payment = {
		id: paymentId,
		machineId: request.machineId,
		userId: 'mock_user', // Would come from session in real implementation
		amount,
		currency: 'MYR',
		status: 'CREATED',
		paymentIntentId,
		clientSecret,
		expiresAt,
		earnedRewards,
		createdAt: new Date()
	};

	// Store for status polling
	PAYMENT_STORE.set(paymentId, {
		payment,
		response,
		completionTime: Date.now() + 5000 // Complete after 5 seconds (simulates Airwallex processing)
	});

	return response;
}

/**
 * Confirm payment - called after Airwallex SDK completes
 * POST /api/v1/payment/confirm
 */
export async function confirmPayment(paymentId: string): Promise<PaymentStatusResponse> {
	await new Promise((resolve) => setTimeout(resolve, 500));

	const stored = PAYMENT_STORE.get(paymentId);
	if (!stored) {
		throw new Error(`Payment ${paymentId} not found`);
	}

	// Simulate payment processing
	stored.payment.status = 'PROCESSING';

	// After brief delay, mark as succeeded
	setTimeout(() => {
		const s = PAYMENT_STORE.get(paymentId);
		if (s) {
			s.payment.status = 'SUCCEEDED';
			s.payment.completedAt = new Date();
		}
	}, 2000);

	return {
		paymentId: stored.payment.id,
		status: stored.payment.status,
		amount: stored.payment.amount,
		currency: stored.payment.currency,
		earnedRewards: stored.payment.earnedRewards
	};
}

// ============================================
// PAYMENT STATUS (API SPEC ALIGNED)
// ============================================

/**
 * Get payment status
 * GET /api/v1/payment/:id/status
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
	await new Promise((resolve) => setTimeout(resolve, 200));

	const stored = PAYMENT_STORE.get(paymentId);
	if (!stored) {
		throw new Error(`Payment ${paymentId} not found`);
	}

	// Check if auto-completion time has passed
	const now = Date.now();
	if (now >= stored.completionTime && stored.payment.status === 'PROCESSING') {
		stored.payment.status = 'SUCCEEDED';
		stored.payment.completedAt = new Date();
	}

	const creditsAdded =
		stored.payment.status === 'SUCCEEDED'
			? parseInt(stored.response.amount) // Mock: 1 credit per RM 1
			: undefined;

	return {
		paymentId: stored.payment.id,
		status: stored.payment.status,
		amount: stored.payment.amount,
		currency: stored.payment.currency,
		creditsAdded,
		earnedRewards: stored.payment.status === 'SUCCEEDED' ? stored.payment.earnedRewards : undefined
	};
}

/**
 * Poll payment status until completion
 */
export async function pollPaymentStatus(
	paymentId: string,
	maxAttempts: number = 15,
	intervalMs: number = 2000
): Promise<PaymentStatusResponse> {
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const result = await getPaymentStatus(paymentId);

		if (
			result.status === 'SUCCEEDED' ||
			result.status === 'FAILED' ||
			result.status === 'CANCELLED'
		) {
			return result;
		}

		if (attempt < maxAttempts - 1) {
			await new Promise((resolve) => setTimeout(resolve, intervalMs));
		}
	}

	throw new Error('Payment status polling timeout');
}

// ============================================
// LEGACY API (backward compatibility)
// ============================================

/**
 * Legacy payment preview (uses cents)
 * @deprecated Use paymentPreview() instead
 */
export async function createPaymentPreview(
	machineId: string,
	pricePerPlay: number,
	quantity: number = 1,
	eventId?: string
): Promise<{
	subtotal: number;
	tax: number;
	discount: number;
	total: number;
	appliedEventId?: string;
}> {
	await new Promise((resolve) => setTimeout(resolve, 500));

	const subtotal = pricePerPlay * quantity;
	const tax = Math.round(subtotal * 0.06);
	let discount = 0;

	if (eventId === 'event_002') {
		discount = Math.round(subtotal * 0.2);
	} else if (eventId === 'event_004') {
		discount = Math.round(subtotal * 0.5);
	}

	const total = subtotal + tax - discount;

	return {
		subtotal,
		tax,
		discount,
		total,
		appliedEventId: eventId
	};
}

/**
 * Legacy payment creation (uses cents)
 * @deprecated Use createPaymentIntent() instead
 */
export async function createPayment(
	userId: string,
	machineId: string,
	amount: number
): Promise<Payment> {
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

	const payment: Payment = {
		id: paymentId,
		machineId,
		userId,
		amount: (amount / 100).toFixed(2), // Convert cents to BigDecimal string
		currency: 'MYR',
		status: 'PROCESSING',
		createdAt: new Date()
	};

	const completionTime = Date.now() + 2000;
	PAYMENT_STORE.set(paymentId, {
		payment,
		response: {
			paymentId,
			clientSecret: `cs_legacy_${paymentId}`,
			paymentIntentId: `pi_legacy_${paymentId}`,
			amount: payment.amount,
			currency: 'MYR',
			status: 'PROCESSING',
			expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
			earnedRewards: []
		},
		completionTime
	});

	setTimeout(() => {
		const stored = PAYMENT_STORE.get(paymentId);
		if (stored) {
			stored.payment.status = 'SUCCEEDED';
			stored.payment.completedAt = new Date();
		}
	}, 2000);

	return payment;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format BigDecimal string to display format
 */
export function formatPrice(amount: string, currency: string = 'MYR'): string {
	const num = parseFloat(amount);
	if (currency === 'MYR') {
		return `RM ${num.toFixed(2)}`;
	}
	return `${currency} ${num.toFixed(2)}`;
}

/**
 * Format cents to RM display (legacy)
 * @deprecated Use formatPrice() with BigDecimal string
 */
export function formatPriceCents(cents: number): string {
	const rm = (cents / 100).toFixed(2);
	return `RM ${rm}`;
}
