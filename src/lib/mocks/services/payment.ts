// Mock payment service
import type { Payment, PaymentPreview, PaymentStatus } from '$lib/types';

/**
 * Mock payment preview calculation
 * Simulates backend pricing calculation with tax and discounts
 */
export async function createPaymentPreview(
	machineId: string,
	pricePerPlay: number,
	eventId?: string
): Promise<PaymentPreview> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	const subtotal = pricePerPlay;
	const tax = Math.round(subtotal * 0.06); // 6% tax
	let discount = 0;

	// Apply event discount if applicable
	if (eventId === 'event_002') {
		// Weekend Discount: 20% off
		discount = Math.round(subtotal * 0.2);
	} else if (eventId === 'event_004') {
		// First Timer: 50% off
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
 * In-memory payment store for tracking payment status across polling requests
 * In production, Friend B maintains this in database
 */
const PAYMENT_STORE = new Map<
	string,
	{
		payment: Payment;
		completionTime: number;
		qrCodeId?: string;
	}
>();

/**
 * Mock payment creation
 * Simulates async payment processing (as per PRD flow)
 * Returns PROCESSING status immediately, completion happens asynchronously
 */
export async function createPayment(
	userId: string,
	machineId: string,
	amount: number
): Promise<Payment> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	// Create payment with PROCESSING status
	const payment: Payment = {
		id: paymentId,
		machineId,
		userId,
		amount,
		status: 'PROCESSING' as PaymentStatus,
		createdAt: new Date()
	};

	// Store payment for status polling
	const completionTime = Date.now() + 2000; // Complete after 2 seconds
	PAYMENT_STORE.set(paymentId, {
		payment,
		completionTime
	});

	// Simulate async payment completion (Friend B's payment gateway integration)
	setTimeout(() => {
		const stored = PAYMENT_STORE.get(paymentId);
		if (stored) {
			stored.payment.status = 'SUCCESS' as PaymentStatus;
			stored.payment.completedAt = new Date();
			stored.payment.transactionId = `txn_${paymentId}`;

			// Generate QR code ID on successful payment
			stored.qrCodeId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		}
	}, 2000);

	return payment;
}

/**
 * Mock payment status polling
 * GET /api/v1/payments/:id
 *
 * Frontend polls this every 2 seconds to check payment status
 * Returns qrCodeId when payment succeeds
 */
export async function getPaymentStatus(
	paymentId: string
): Promise<{ payment: Payment; qrCodeId?: string }> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	const stored = PAYMENT_STORE.get(paymentId);
	if (!stored) {
		throw new Error(`Payment ${paymentId} not found`);
	}

	// Check if payment has completed
	const now = Date.now();
	if (now >= stored.completionTime && stored.payment.status === 'PROCESSING') {
		// Update to success if completion time reached
		stored.payment.status = 'SUCCESS';
		stored.payment.completedAt = new Date();
		stored.payment.transactionId = `txn_${paymentId}`;
		stored.qrCodeId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	return {
		payment: { ...stored.payment },
		qrCodeId: stored.qrCodeId
	};
}

/**
 * Poll payment status with timeout
 * Utility function for frontend to use
 * Polls every 2 seconds for up to 30 seconds (PRD requirement)
 */
export async function pollPaymentStatus(
	paymentId: string,
	maxAttempts: number = 15, // 15 attempts × 2 seconds = 30 seconds
	intervalMs: number = 2000
): Promise<{ payment: Payment; qrCodeId?: string }> {
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const result = await getPaymentStatus(paymentId);

		// If payment succeeded or failed, return immediately
		if (result.payment.status === 'SUCCESS' || result.payment.status === 'FAILED') {
			return result;
		}

		// Wait before next poll (except on last attempt)
		if (attempt < maxAttempts - 1) {
			await new Promise((resolve) => setTimeout(resolve, intervalMs));
		}
	}

	// Timeout reached
	throw new Error('Payment status polling timeout after 30 seconds');
}

/**
 * Format price in cents to RM display
 */
export function formatPrice(cents: number): string {
	const rm = (cents / 100).toFixed(2);
	return `RM ${rm}`;
}
