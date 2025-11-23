// Mock WebSocket service for prize dispensing notifications
import type { Prize } from '$lib/types';

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
 * WebSocket message types from Friend B's backend
 */
export type WebSocketMessageType = 'PRIZE_DISPENSED' | 'QR_SCANNED' | 'ERROR';

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
	type: WebSocketMessageType;
	qrCodeId: string;
	prizeResult?: PrizeResult;
	error?: {
		code: string;
		message: string;
	};
}

/**
 * WebSocket event listener callback
 */
export type WebSocketListener = (message: WebSocketMessage) => void;

/**
 * Mock WebSocket client for prize notifications
 * Simulates Friend B's WebSocket endpoint: wss://api.example.com/ws/prize-events
 */
export class MockPrizeWebSocket {
	private listeners: Set<WebSocketListener> = new Set();
	private isConnected: boolean = false;
	private reconnectTimer?: ReturnType<typeof setTimeout>;

	/**
	 * Connect to mock WebSocket server
	 * In production, connects to Friend B's WebSocket endpoint
	 */
	async connect(): Promise<void> {
		// Simulate connection delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		this.isConnected = true;
		console.log('[MockWebSocket] Connected to prize notification service');
	}

	/**
	 * Disconnect from WebSocket
	 */
	disconnect(): void {
		this.isConnected = false;
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = undefined;
		}
		console.log('[MockWebSocket] Disconnected from prize notification service');
	}

	/**
	 * Subscribe to WebSocket messages
	 */
	subscribe(listener: WebSocketListener): () => void {
		this.listeners.add(listener);

		// Return unsubscribe function
		return () => {
			this.listeners.delete(listener);
		};
	}

	/**
	 * Emit message to all listeners
	 */
	private emit(message: WebSocketMessage): void {
		this.listeners.forEach((listener) => {
			try {
				listener(message);
			} catch (error) {
				console.error('[MockWebSocket] Listener error:', error);
			}
		});
	}

	/**
	 * Simulate prize dispensing event
	 * In production, Unity machine sends QR scan → Backend processes → WebSocket broadcasts
	 */
	simulatePrizeDispensed(qrCodeId: string, prizeResult: PrizeResult): void {
		if (!this.isConnected) {
			console.warn('[MockWebSocket] Cannot send message: Not connected');
			return;
		}

		// Simulate network delay
		setTimeout(() => {
			const message: WebSocketMessage = {
				type: 'PRIZE_DISPENSED',
				qrCodeId,
				prizeResult
			};

			console.log('[MockWebSocket] Prize dispensed:', prizeResult.prize.name);
			this.emit(message);
		}, 1000);
	}

	/**
	 * Simulate QR code scan event
	 * Sent when Unity machine scans QR code (before prize dispensing)
	 */
	simulateQRScanned(qrCodeId: string): void {
		if (!this.isConnected) {
			console.warn('[MockWebSocket] Cannot send message: Not connected');
			return;
		}

		setTimeout(() => {
			const message: WebSocketMessage = {
				type: 'QR_SCANNED',
				qrCodeId
			};

			console.log('[MockWebSocket] QR code scanned');
			this.emit(message);
		}, 500);
	}

	/**
	 * Simulate error event (e.g., QR code expired, already used)
	 */
	simulateError(qrCodeId: string, errorCode: string, errorMessage: string): void {
		if (!this.isConnected) {
			console.warn('[MockWebSocket] Cannot send message: Not connected');
			return;
		}

		const message: WebSocketMessage = {
			type: 'ERROR',
			qrCodeId,
			error: {
				code: errorCode,
				message: errorMessage
			}
		};

		console.log('[MockWebSocket] Error:', errorMessage);
		this.emit(message);
	}

	/**
	 * Check if WebSocket is connected
	 */
	isActive(): boolean {
		return this.isConnected;
	}
}

/**
 * Singleton instance for global WebSocket connection
 * In production, create new instance per user session
 */
let globalWebSocket: MockPrizeWebSocket | null = null;

/**
 * Get or create global WebSocket instance
 */
export function getPrizeWebSocket(): MockPrizeWebSocket {
	if (!globalWebSocket) {
		globalWebSocket = new MockPrizeWebSocket();
	}
	return globalWebSocket;
}

/**
 * Cleanup global WebSocket (for testing/unmounting)
 */
export function cleanupPrizeWebSocket(): void {
	if (globalWebSocket) {
		globalWebSocket.disconnect();
		globalWebSocket = null;
	}
}

/**
 * Create WebSocket hook for Svelte components
 * Usage in component:
 *
 * const ws = usePrizeWebSocket();
 * const unsubscribe = ws.subscribe((message) => {
 *   if (message.type === 'PRIZE_DISPENSED') {
 *     console.log('Prize won:', message.prizeResult);
 *   }
 * });
 * onDestroy(unsubscribe);
 */
export function usePrizeWebSocket(): MockPrizeWebSocket {
	const ws = getPrizeWebSocket();

	// Auto-connect if not connected
	if (!ws.isActive()) {
		ws.connect();
	}

	return ws;
}
