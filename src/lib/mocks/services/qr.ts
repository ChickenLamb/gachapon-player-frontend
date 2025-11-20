// Mock QR code service
import type { QRCode } from '$lib/types';

/**
 * Mock QR code generation
 * Simulates backend QR generation after successful payment
 */
export async function generateQRCode(
	userId: string,
	machineId: string,
	paymentId: string
): Promise<QRCode> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	const qrId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	// Generate mock QR code data (in real app, this would be from backend)
	const qrData = {
		qrId,
		userId,
		machineId,
		paymentId,
		timestamp: Date.now()
	};

	// Encode as base64 (mock)
	const qrCodeData = btoa(JSON.stringify(qrData));

	return {
		id: qrId,
		userId,
		machineId,
		paymentId,
		code: qrCodeData,
		expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
		createdAt: new Date(),
		used: false
	};
}

/**
 * Generate QR code image URL
 * Uses QR code API service to generate scannable image
 */
export function getQRCodeImageUrl(qrCodeData: string): string {
	// Using quickchart.io QR code API (free service)
	// In production, use your own QR generation service
	const size = 400;
	const encodedData = encodeURIComponent(qrCodeData);
	return `https://quickchart.io/qr?text=${encodedData}&size=${size}&margin=2`;
}

/**
 * Check if QR code is still valid
 */
export function isQRCodeValid(qrCode: QRCode): boolean {
	const now = new Date();
	return !qrCode.used && qrCode.expiresAt > now;
}

/**
 * Get remaining time for QR code in seconds
 */
export function getQRCodeRemainingTime(qrCode: QRCode): number {
	const now = Date.now();
	const expiresAt = qrCode.expiresAt.getTime();
	const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
	return remaining;
}

/**
 * Format remaining time as MM:SS
 */
export function formatRemainingTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}
