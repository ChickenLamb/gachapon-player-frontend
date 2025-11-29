// Mock WebSocket service for payment QR and notification flow
// Implements the new API spec WebSocket protocol with HubMessage structure
import type { Prize, PaymentStatus } from '$lib/types';
import type {
	HubMessage,
	QRCodeGeneratedData,
	QRCodeScannedData,
	PaymentRedirectNotification,
	PaymentStatusUpdateData,
	PaymentCompletedData,
	PaymentFailedData
} from '$lib/types';
import { mockMachines } from '../data/machines';

// ============================================
// LEGACY TYPES (for backward compatibility)
// ============================================

/**
 * Prize result after machine dispenses prize
 */
export interface PrizeResult {
	id: string;
	userId: string;
	machineId: string;
	qrCodeId: string;
	prize: Prize;
	wonAt: Date;
}

/**
 * Legacy WebSocket message types
 */
export type LegacyWebSocketMessageType = 'PRIZE_DISPENSED' | 'QR_SCANNED' | 'ERROR';

/**
 * Legacy WebSocket message structure
 */
export interface LegacyWebSocketMessage {
	type: LegacyWebSocketMessageType;
	qrCodeId: string;
	prizeResult?: PrizeResult;
	error?: {
		code: string;
		message: string;
	};
}

// ============================================
// NEW API SPEC TYPES
// ============================================

export type HubMessageListener = (message: HubMessage) => void;
export type LegacyWebSocketListener = (message: LegacyWebSocketMessage) => void;

/**
 * QR Code generation response (mock)
 */
export interface QRCodeGenerationResult {
	code: string;
	expiresAt: string;
	sessionId: string;
}

// ============================================
// MOCK WEBSOCKET CLIENT
// ============================================

/**
 * Mock WebSocket client supporting both new HubMessage protocol and legacy messages
 */
export class MockPaymentWebSocket {
	private hubListeners: Set<HubMessageListener> = new Set();
	private legacyListeners: Set<LegacyWebSocketListener> = new Set();
	private isConnected: boolean = false;
	private reconnectTimer?: ReturnType<typeof setTimeout>;
	private pingInterval?: ReturnType<typeof setInterval>;
	private currentSessionId: string | null = null;

	/**
	 * Connect to mock WebSocket server
	 */
	async connect(): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, 300));
		this.isConnected = true;
		console.log('[MockWebSocket] Connected to payment notification service');

		// Start heartbeat
		this.startHeartbeat();
	}

	/**
	 * Disconnect from WebSocket
	 */
	disconnect(): void {
		this.isConnected = false;
		this.currentSessionId = null;
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = undefined;
		}
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
			this.pingInterval = undefined;
		}
		console.log('[MockWebSocket] Disconnected');
	}

	/**
	 * Start PING/PONG heartbeat
	 */
	private startHeartbeat(): void {
		this.pingInterval = setInterval(() => {
			if (this.isConnected) {
				this.emitHub({
					type: 'PONG',
					timestamp: new Date().toISOString()
				});
			}
		}, 30000); // Every 30 seconds
	}

	/**
	 * Subscribe to HubMessage protocol messages
	 */
	subscribeHub(listener: HubMessageListener): () => void {
		this.hubListeners.add(listener);
		return () => this.hubListeners.delete(listener);
	}

	/**
	 * Subscribe to legacy WebSocket messages (backward compatibility)
	 */
	subscribe(listener: LegacyWebSocketListener): () => void {
		this.legacyListeners.add(listener);
		return () => this.legacyListeners.delete(listener);
	}

	/**
	 * Emit HubMessage to listeners
	 */
	private emitHub(message: HubMessage): void {
		this.hubListeners.forEach((listener) => {
			try {
				listener(message);
			} catch (error) {
				console.error('[MockWebSocket] Hub listener error:', error);
			}
		});
	}

	/**
	 * Emit legacy message to listeners
	 */
	private emitLegacy(message: LegacyWebSocketMessage): void {
		this.legacyListeners.forEach((listener) => {
			try {
				listener(message);
			} catch (error) {
				console.error('[MockWebSocket] Legacy listener error:', error);
			}
		});
	}

	// ============================================
	// NEW API: QR CODE FLOW
	// ============================================

	/**
	 * Generate QR code for payment (mock)
	 * Frontend calls this, backend returns QR code data via WebSocket
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	generatePaymentQR(_userId: string): QRCodeGenerationResult {
		const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		this.currentSessionId = sessionId;

		const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

		const result: QRCodeGenerationResult = {
			code: `GCH_QR_${sessionId}`,
			expiresAt: expiresAt.toISOString(),
			sessionId
		};

		// Emit QR_CODE_GENERATED via WebSocket
		setTimeout(() => {
			const message: HubMessage<QRCodeGeneratedData> = {
				domain: 'qr_code',
				type: 'QR_CODE_GENERATED',
				data: {
					code: result.code,
					expiresAt: result.expiresAt,
					sessionId: result.sessionId
				},
				timestamp: new Date().toISOString()
			};
			this.emitHub(message);
		}, 100);

		return result;
	}

	/**
	 * Simulate machine scanning QR code
	 * This triggers the redirect notification to the user's device
	 */
	simulateMachineScan(machineId: string, userId: string): void {
		if (!this.isConnected) {
			console.warn('[MockWebSocket] Cannot simulate: Not connected');
			return;
		}

		const machine = mockMachines[machineId];
		if (!machine) {
			console.error('[MockWebSocket] Machine not found:', machineId);
			return;
		}

		// First emit QR_CODE_SCANNED
		setTimeout(() => {
			const scannedMessage: HubMessage<QRCodeScannedData> = {
				domain: 'qr_code',
				type: 'QR_CODE_SCANNED',
				data: {
					machineId: machine.id,
					machineName: machine.name,
					machineSerialNumber: machine.serialNumber,
					scannedAt: new Date().toISOString()
				},
				timestamp: new Date().toISOString()
			};
			this.emitHub(scannedMessage);
		}, 500);

		// Then emit REDIRECT_TO_PAYMENT
		setTimeout(() => {
			const sessionToken = `token_${Date.now()}`;
			const redirectMessage: HubMessage<PaymentRedirectNotification> = {
				domain: 'payment',
				type: 'REDIRECT_TO_PAYMENT',
				data: {
					machineId: machine.id,
					machineName: machine.name,
					machineSerialNumber: machine.serialNumber,
					pricePerDraw: machine.drawCost,
					userId,
					sessionToken,
					timestamp: new Date().toISOString()
				},
				timestamp: new Date().toISOString()
			};
			this.emitHub(redirectMessage);
		}, 1000);
	}

	// ============================================
	// NEW API: PAYMENT STATUS FLOW
	// ============================================

	/**
	 * Simulate payment status update
	 */
	simulatePaymentStatusUpdate(paymentId: string, status: PaymentStatus, message?: string): void {
		if (!this.isConnected) return;

		const statusMessage: HubMessage<PaymentStatusUpdateData> = {
			domain: 'payment',
			type: 'PAYMENT_STATUS_UPDATE',
			data: {
				paymentId,
				status,
				message,
				timestamp: new Date().toISOString()
			},
			timestamp: new Date().toISOString()
		};
		this.emitHub(statusMessage);
	}

	/**
	 * Simulate payment completed
	 */
	simulatePaymentCompleted(paymentId: string, machineId: string, creditsAdded: number): void {
		if (!this.isConnected) return;

		const completedMessage: HubMessage<PaymentCompletedData> = {
			domain: 'payment',
			type: 'PAYMENT_COMPLETED',
			data: {
				paymentId,
				creditsAdded,
				machineId,
				earnedRewards: [],
				timestamp: new Date().toISOString()
			},
			timestamp: new Date().toISOString()
		};
		this.emitHub(completedMessage);
	}

	/**
	 * Simulate payment failed
	 */
	simulatePaymentFailed(paymentId: string, errorCode: string, errorMessage: string): void {
		if (!this.isConnected) return;

		const failedMessage: HubMessage<PaymentFailedData> = {
			domain: 'payment',
			type: 'PAYMENT_FAILED',
			data: {
				paymentId,
				errorCode,
				errorMessage,
				timestamp: new Date().toISOString()
			},
			timestamp: new Date().toISOString()
		};
		this.emitHub(failedMessage);
	}

	// ============================================
	// LEGACY API (backward compatibility)
	// ============================================

	/**
	 * Simulate prize dispensing event (legacy)
	 */
	simulatePrizeDispensed(qrCodeId: string, prizeResult: PrizeResult): void {
		if (!this.isConnected) return;

		setTimeout(() => {
			const message: LegacyWebSocketMessage = {
				type: 'PRIZE_DISPENSED',
				qrCodeId,
				prizeResult
			};
			console.log('[MockWebSocket] Prize dispensed:', prizeResult.prize.name);
			this.emitLegacy(message);
		}, 1000);
	}

	/**
	 * Simulate QR code scan event (legacy)
	 */
	simulateQRScanned(qrCodeId: string): void {
		if (!this.isConnected) return;

		setTimeout(() => {
			const message: LegacyWebSocketMessage = {
				type: 'QR_SCANNED',
				qrCodeId
			};
			console.log('[MockWebSocket] QR code scanned');
			this.emitLegacy(message);
		}, 500);
	}

	/**
	 * Simulate error event (legacy)
	 */
	simulateError(qrCodeId: string, errorCode: string, errorMessage: string): void {
		if (!this.isConnected) return;

		const message: LegacyWebSocketMessage = {
			type: 'ERROR',
			qrCodeId,
			error: { code: errorCode, message: errorMessage }
		};
		console.log('[MockWebSocket] Error:', errorMessage);
		this.emitLegacy(message);
	}

	/**
	 * Check if WebSocket is connected
	 */
	isActive(): boolean {
		return this.isConnected;
	}

	/**
	 * Get current session ID
	 */
	getSessionId(): string | null {
		return this.currentSessionId;
	}
}

// ============================================
// SINGLETON & HOOKS
// ============================================

let globalWebSocket: MockPaymentWebSocket | null = null;

/**
 * Get or create global WebSocket instance
 */
export function getPaymentWebSocket(): MockPaymentWebSocket {
	if (!globalWebSocket) {
		globalWebSocket = new MockPaymentWebSocket();
	}
	return globalWebSocket;
}

/**
 * Cleanup global WebSocket
 */
export function cleanupPaymentWebSocket(): void {
	if (globalWebSocket) {
		globalWebSocket.disconnect();
		globalWebSocket = null;
	}
}

/**
 * Hook for Svelte components
 */
export function usePaymentWebSocket(): MockPaymentWebSocket {
	const ws = getPaymentWebSocket();
	if (!ws.isActive()) {
		ws.connect();
	}
	return ws;
}

// ============================================
// LEGACY EXPORTS (backward compatibility)
// ============================================

// Alias for legacy code
export const MockPrizeWebSocket = MockPaymentWebSocket;
export const getPrizeWebSocket = getPaymentWebSocket;
export const cleanupPrizeWebSocket = cleanupPaymentWebSocket;
export const usePrizeWebSocket = usePaymentWebSocket;

// Re-export legacy types
export type WebSocketMessage = LegacyWebSocketMessage;
export type WebSocketListener = LegacyWebSocketListener;
