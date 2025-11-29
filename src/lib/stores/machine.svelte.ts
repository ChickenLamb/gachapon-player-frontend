/**
 * Machine connection store
 * Manages WebSocket connection state for machine scanning
 * Implements new API spec with HubMessage protocol
 */

import { getContext, setContext } from 'svelte';
import type { PaymentRedirectNotification, HubMessage } from '$lib/types';
import { usePaymentWebSocket, type MockPaymentWebSocket } from '$lib/mocks/services/websocket';

const MACHINE_CONTEXT_KEY = Symbol('machine');

export type ScanStatus =
	| 'idle'
	| 'generating_qr'
	| 'waiting_scan'
	| 'connecting'
	| 'connected'
	| 'error';

export interface MachineState {
	scanned: boolean;
	machineId: string | null;
	machineName: string | null;
	machineSerialNumber: string | null;
	pricePerDraw: string | null;
	locationId: string | null;
	spinCount: number;
	status: ScanStatus;
	error: string | null;
	// New API spec fields
	sessionId: string | null;
	sessionToken: string | null;
	qrCode: string | null;
	qrExpiresAt: string | null;
}

export function createMachineStore() {
	let scanned = $state(false);
	let machineId = $state<string | null>(null);
	let machineName = $state<string | null>(null);
	let machineSerialNumber = $state<string | null>(null);
	let pricePerDraw = $state<string | null>(null);
	let locationId = $state<string | null>(null);
	let spinCount = $state(0);
	let status = $state<ScanStatus>('idle');
	let error = $state<string | null>(null);
	let sessionId = $state<string | null>(null);
	let sessionToken = $state<string | null>(null);
	let qrCode = $state<string | null>(null);
	let qrExpiresAt = $state<string | null>(null);

	// WebSocket instance
	let ws: MockPaymentWebSocket | null = null;
	let unsubscribe: (() => void) | null = null;
	let mockWs: ReturnType<typeof setTimeout> | null = null;

	function reset() {
		scanned = false;
		machineId = null;
		machineName = null;
		machineSerialNumber = null;
		pricePerDraw = null;
		locationId = null;
		spinCount = 0;
		status = 'idle';
		error = null;
		sessionId = null;
		sessionToken = null;
		qrCode = null;
		qrExpiresAt = null;
	}

	/**
	 * Handle HubMessage from WebSocket
	 */
	function handleHubMessage(message: HubMessage) {
		console.log('[MachineStore] Received HubMessage:', message.type);

		switch (message.type) {
			case 'QR_CODE_GENERATED':
				// QR code ready for display
				status = 'waiting_scan';
				break;

			case 'QR_CODE_SCANNED':
				// Machine scanned the QR code
				status = 'connecting';
				break;

			case 'REDIRECT_TO_PAYMENT': {
				// Machine sends redirect notification with payment details
				const data = message.data as PaymentRedirectNotification;
				scanned = true;
				machineId = data.machineId;
				machineName = data.machineName;
				machineSerialNumber = data.machineSerialNumber;
				pricePerDraw = data.pricePerDraw;
				sessionToken = data.sessionToken;
				status = 'connected';
				break;
			}

			case 'ERROR':
				status = 'error';
				error = 'Connection error. Please try again.';
				break;
		}
	}

	/**
	 * Generate QR code for machine scanning (new API flow)
	 */
	function generateQR(userId: string) {
		status = 'generating_qr';
		error = null;

		// Get WebSocket instance and subscribe
		ws = usePaymentWebSocket();
		unsubscribe = ws.subscribeHub(handleHubMessage);

		// Generate QR code
		const result = ws.generatePaymentQR(userId);
		qrCode = result.code;
		qrExpiresAt = result.expiresAt;
		sessionId = result.sessionId;
		status = 'waiting_scan';
	}

	/**
	 * Simulate machine scanning QR code (for testing)
	 */
	function mockMachineScan(testMachineId: string, userId: string) {
		if (ws) {
			ws.simulateMachineScan(testMachineId, userId);
		}
	}

	/**
	 * Legacy: Simulate successful machine scan (mock)
	 * Uses real machine IDs from mock data for testing
	 */
	function mockScanSuccess() {
		status = 'connecting';
		error = null;

		// Use real machine IDs for proper testing
		const mockMachines = [
			{
				id: 'machine_001',
				name: 'Anime Paradise',
				serialNumber: 'GCH-2024-001',
				drawCost: '5.00',
				location: 'Pavilion KL'
			},
			{
				id: 'machine_002',
				name: 'Foodie Rewards',
				serialNumber: 'GCH-2024-002',
				drawCost: '3.00',
				location: 'KLCC'
			},
			{
				id: 'machine_003',
				name: 'Gaming Zone',
				serialNumber: 'GCH-2024-003',
				drawCost: '4.00',
				location: 'Mid Valley'
			}
		];
		const randomMachine = mockMachines[Math.floor(Math.random() * mockMachines.length)];

		mockWs = setTimeout(() => {
			scanned = true;
			machineId = randomMachine.id;
			machineName = randomMachine.name;
			machineSerialNumber = randomMachine.serialNumber;
			pricePerDraw = randomMachine.drawCost;
			locationId = `location-${Math.floor(Math.random() * 10) + 1}`;
			spinCount = Math.floor(Math.random() * 5) + 1;
			status = 'connected';
		}, 1500);
	}

	/**
	 * Simulate failed machine scan (mock)
	 */
	function mockScanFail() {
		status = 'connecting';
		error = null;

		mockWs = setTimeout(() => {
			status = 'error';
			error = 'Failed to connect to machine. Please try again.';
		}, 1500);
	}

	function disconnect() {
		if (mockWs) {
			clearTimeout(mockWs);
			mockWs = null;
		}
		if (unsubscribe) {
			unsubscribe();
			unsubscribe = null;
		}
		ws = null;
		reset();
	}

	/**
	 * Auto-connect to WebSocket on app start (mock)
	 * In real app, this would establish WS connection when user opens the app
	 */
	function autoConnect() {
		// Reset to idle state, ready for QR scan
		reset();
	}

	return {
		// State getters
		get scanned() {
			return scanned;
		},
		get machineId() {
			return machineId;
		},
		get machineName() {
			return machineName;
		},
		get machineSerialNumber() {
			return machineSerialNumber;
		},
		get pricePerDraw() {
			return pricePerDraw;
		},
		get locationId() {
			return locationId;
		},
		get spinCount() {
			return spinCount;
		},
		get status() {
			return status;
		},
		get error() {
			return error;
		},
		get sessionId() {
			return sessionId;
		},
		get sessionToken() {
			return sessionToken;
		},
		get qrCode() {
			return qrCode;
		},
		get qrExpiresAt() {
			return qrExpiresAt;
		},
		// New API methods
		generateQR,
		mockMachineScan,
		// Legacy methods
		mockScanSuccess,
		mockScanFail,
		disconnect,
		reset,
		autoConnect
	};
}

export type MachineStore = ReturnType<typeof createMachineStore>;

export function setMachineContext(store: MachineStore) {
	setContext(MACHINE_CONTEXT_KEY, store);
}

export function getMachineContext(): MachineStore {
	return getContext<MachineStore>(MACHINE_CONTEXT_KEY);
}
