// Mock QR code service
import type { QRCode } from '$lib/types';

/**
 * QR code payload structure before encryption
 */
interface QRPayload {
	qrId: string;
	userId: string;
	machineId: string;
	paymentId: string;
	timestamp: number;
}

/**
 * Mock AES-256-GCM encryption using Web Crypto API
 * In production, Friend B implements this server-side with proper key management
 */
async function encryptQRPayload(payload: QRPayload): Promise<string> {
	// Generate encryption key (in production, use secure key management)
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode('mock_secret_key_32_bytes_long!'),
		{ name: 'PBKDF2' },
		false,
		['deriveBits', 'deriveKey']
	);

	const key = await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: new TextEncoder().encode('mock_salt'),
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt']
	);

	// Generate IV (Initialization Vector)
	const iv = crypto.getRandomValues(new Uint8Array(12));

	// Encrypt the payload
	const encrypted = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv
		},
		key,
		new TextEncoder().encode(JSON.stringify(payload))
	);

	// Combine IV + encrypted data
	const combined = new Uint8Array(iv.length + encrypted.byteLength);
	combined.set(iv, 0);
	combined.set(new Uint8Array(encrypted), iv.length);

	// Encode to base64
	return btoa(String.fromCharCode(...combined));
}

/**
 * Mock AES-256-GCM decryption (for validation/testing)
 * In production, Friend B's backend and Unity machine scanner implement this
 */
export async function decryptQRPayload(encryptedData: string): Promise<QRPayload | null> {
	try {
		// Decode from base64
		const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

		// Extract IV and encrypted data
		const iv = combined.slice(0, 12);
		const encrypted = combined.slice(12);

		// Regenerate key (same as encryption)
		const keyMaterial = await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode('mock_secret_key_32_bytes_long!'),
			{ name: 'PBKDF2' },
			false,
			['deriveBits', 'deriveKey']
		);

		const key = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: new TextEncoder().encode('mock_salt'),
				iterations: 100000,
				hash: 'SHA-256'
			},
			keyMaterial,
			{ name: 'AES-GCM', length: 256 },
			true,
			['encrypt', 'decrypt']
		);

		// Decrypt
		const decrypted = await crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv
			},
			key,
			encrypted
		);

		const payload = JSON.parse(new TextDecoder().decode(decrypted));
		return payload as QRPayload;
	} catch {
		return null;
	}
}

/**
 * Mock QR code generation
 * Simulates backend QR generation after successful payment
 * NOW WITH: AES-256-GCM encryption + 2-minute expiry (PRD requirement)
 */
export async function generateQRCode(
	userId: string,
	machineId: string,
	paymentId: string
): Promise<QRCode> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	const qrId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	// Generate QR code payload
	const qrPayload: QRPayload = {
		qrId,
		userId,
		machineId,
		paymentId,
		timestamp: Date.now()
	};

	// Encrypt using AES-256-GCM
	const encryptedCode = await encryptQRPayload(qrPayload);

	return {
		id: qrId,
		userId,
		machineId,
		paymentId,
		code: encryptedCode,
		expiresAt: new Date(Date.now() + 2 * 60 * 1000), // ✅ 2 minutes (PRD requirement)
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
