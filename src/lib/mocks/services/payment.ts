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
 * Mock payment creation
 * Simulates payment processing
 */
export async function createPayment(
	userId: string,
	machineId: string,
	amount: number
): Promise<Payment> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	// Simulate payment processing
	const payment: Payment = {
		id: paymentId,
		machineId,
		userId,
		amount,
		status: 'PROCESSING' as PaymentStatus,
		createdAt: new Date()
	};

	// Simulate async payment completion
	setTimeout(() => {
		payment.status = 'SUCCESS' as PaymentStatus;
		payment.completedAt = new Date();
		payment.transactionId = `txn_${paymentId}`;
	}, 2000);

	return payment;
}

/**
 * Mock payment status check
 */
export async function getPaymentStatus(_paymentId: string): Promise<PaymentStatus> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	// Mock: payments complete after 2 seconds
	// In real app, poll backend for status
	// Note: paymentId would be used in real implementation
	return 'SUCCESS' as PaymentStatus;
}

/**
 * Format price in cents to RM display
 */
export function formatPrice(cents: number): string {
	const rm = (cents / 100).toFixed(2);
	return `RM ${rm}`;
}
